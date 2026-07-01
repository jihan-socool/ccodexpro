const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const repoDir = path.join(__dirname, "../..");
const dataDir = path.join(repoDir, "data");
const logsDir = path.join(repoDir, "logs");
const stateFile = path.join(dataDir, "system-update.json");
const logFile = path.join(logsDir, "system-update.log");
const runnerFile = path.join(__dirname, "systemUpdateRunner.js");
const gitTimeoutMs = Number(process.env.ADMIN_UPDATE_GIT_TIMEOUT_MS || 20000);

function parseBoolean(value, fallback = false) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function ensureSystemUpdateStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  if (!fs.existsSync(stateFile)) {
    fs.writeFileSync(stateFile, `${JSON.stringify({ lastCheck: null, lastRun: null }, null, 2)}\n`);
  }
}

function readState() {
  ensureSystemUpdateStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(stateFile, "utf8"));
    return {
      lastCheck: parsed?.lastCheck && typeof parsed.lastCheck === "object" ? parsed.lastCheck : null,
      lastRun: parsed?.lastRun && typeof parsed.lastRun === "object" ? parsed.lastRun : null,
    };
  } catch (error) {
    return { lastCheck: null, lastRun: null };
  }
}

function writeState(nextState) {
  ensureSystemUpdateStore();
  const payload = {
    lastCheck: nextState?.lastCheck && typeof nextState.lastCheck === "object" ? nextState.lastCheck : null,
    lastRun: nextState?.lastRun && typeof nextState.lastRun === "object" ? nextState.lastRun : null,
  };
  fs.writeFileSync(stateFile, `${JSON.stringify(payload, null, 2)}\n`);
  return payload;
}

function processAlive(pid) {
  const numericPid = Number(pid);
  if (!Number.isInteger(numericPid) || numericPid <= 0) return false;
  try {
    process.kill(numericPid, 0);
    return true;
  } catch (error) {
    return error.code === "EPERM";
  }
}

function normalizeState() {
  const state = readState();
  const lastRun = state.lastRun ? { ...state.lastRun } : null;
  if (lastRun?.status === "running" && !processAlive(lastRun.pid)) {
    lastRun.status = "failed";
    lastRun.finishedAt = lastRun.finishedAt || new Date().toISOString();
    lastRun.message = lastRun.message || "更新进程已退出，请检查日志。";
    const nextState = { ...state, lastRun };
    writeState(nextState);
    return nextState;
  }
  return state;
}

function git(args, options = {}) {
  const result = spawnSync("git", args, {
    cwd: repoDir,
    encoding: "utf8",
    timeout: gitTimeoutMs,
    ...options,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    const message = String(result.stderr || result.stdout || "").trim()
      || `git ${args.join(" ")} 执行失败`;
    throw new Error(message);
  }

  return String(result.stdout || "").trim();
}

function safeGit(args, options = {}) {
  try {
    return git(args, options);
  } catch (error) {
    return "";
  }
}

function readCommit(ref) {
  const output = safeGit(["log", "-1", "--format=%H%n%s%n%cI", ref]);
  if (!output) return null;
  const [sha = "", subject = "", committedAt = ""] = output.split(/\r?\n/);
  if (!sha) return null;
  return {
    ref,
    sha,
    shortSha: sha.slice(0, 7),
    subject,
    committedAt,
  };
}

function config() {
  const command = String(process.env.ADMIN_UPDATE_COMMAND || "").trim();
  return {
    enabled: parseBoolean(process.env.ADMIN_UPDATE_ENABLED, false),
    commandConfigured: Boolean(command),
    command,
    allowDirty: parseBoolean(process.env.ADMIN_UPDATE_ALLOW_DIRTY, false),
    remoteName: String(process.env.ADMIN_UPDATE_REMOTE || "origin").trim() || "origin",
    configuredBranch: String(process.env.ADMIN_UPDATE_BRANCH || "").trim(),
    shell: String(process.env.ADMIN_UPDATE_SHELL || "/bin/sh").trim() || "/bin/sh",
  };
}

function collectRepositoryStatus(options = {}) {
  const currentConfig = options.config || config();
  if (!fs.existsSync(path.join(repoDir, ".git"))) {
    return {
      available: false,
      repoPath: repoDir,
      currentBranch: "",
      targetBranch: currentConfig.configuredBranch || "main",
      remoteName: currentConfig.remoteName,
      remoteUrl: "",
      head: null,
      upstream: null,
      workingTreeDirty: false,
      dirtyCount: 0,
      dirtyFiles: [],
      localAhead: null,
      localBehind: null,
      updateAvailable: false,
      fetchAttempted: false,
      fetchError: "当前目录不是 Git 仓库。",
    };
  }

  const currentBranch = safeGit(["branch", "--show-current"]);
  const targetBranch = currentConfig.configuredBranch || currentBranch || "main";
  const remoteName = currentConfig.remoteName;
  const remoteUrl = safeGit(["remote", "get-url", remoteName]);
  const head = readCommit("HEAD");
  const dirtyFiles = safeGit(["status", "--porcelain"])
    .split(/\r?\n/)
    .filter(Boolean);

  let fetchError = "";
  if (options.fetchRemote && !remoteUrl) {
    fetchError = `未配置远程仓库 ${remoteName}。`;
  } else if (options.fetchRemote && remoteUrl) {
    try {
      git(["fetch", "--prune", remoteName]);
    } catch (error) {
      fetchError = error.message;
    }
  }

  const upstreamRef = remoteUrl ? `${remoteName}/${targetBranch}` : "";
  const upstream = upstreamRef ? readCommit(upstreamRef) : null;
  let localAhead = null;
  let localBehind = null;
  if (upstreamRef && upstream) {
    const counts = safeGit(["rev-list", "--left-right", "--count", `HEAD...${upstreamRef}`]);
    if (counts) {
      const [aheadText = "", behindText = ""] = counts.split(/\s+/);
      const ahead = Number(aheadText);
      const behind = Number(behindText);
      localAhead = Number.isFinite(ahead) ? ahead : null;
      localBehind = Number.isFinite(behind) ? behind : null;
    }
  }

  return {
    available: true,
    repoPath: repoDir,
    currentBranch,
    targetBranch,
    remoteName,
    remoteUrl,
    head,
    upstream,
    workingTreeDirty: dirtyFiles.length > 0,
    dirtyCount: dirtyFiles.length,
    dirtyFiles,
    localAhead,
    localBehind,
    updateAvailable: Boolean(localBehind && localBehind > 0),
    fetchAttempted: Boolean(options.fetchRemote),
    fetchError,
  };
}

function buildStatus(options = {}) {
  const currentConfig = config();
  const state = normalizeState();
  const repository = collectRepositoryStatus({
    fetchRemote: Boolean(options.fetchRemote),
    config: currentConfig,
  });

  return {
    feature: {
      enabled: currentConfig.enabled,
      commandConfigured: currentConfig.commandConfigured,
      canRunUpdate: currentConfig.enabled && currentConfig.commandConfigured,
      allowDirty: currentConfig.allowDirty,
      remoteName: repository.remoteName,
      targetBranch: repository.targetBranch,
      repoPath: repoDir,
      stateFile: path.relative(repoDir, stateFile) || "data/system-update.json",
      logFile: path.relative(repoDir, logFile) || "logs/system-update.log",
    },
    repository,
    lastCheck: state.lastCheck,
    lastRun: state.lastRun,
  };
}

function systemStatusMessage(repository) {
  if (!repository.available) return repository.fetchError || "Git 仓库不可用。";
  if (repository.fetchError) return repository.fetchError;
  if (repository.updateAvailable) return `检测到 ${repository.localBehind} 个待更新提交。`;
  return "当前已经是最新版本。";
}

function getSystemUpdateStatus() {
  return buildStatus();
}

function checkSystemUpdates() {
  const checkedAt = new Date().toISOString();
  const status = buildStatus({ fetchRemote: true });
  const nextState = normalizeState();
  nextState.lastCheck = {
    ok: status.repository.available && !status.repository.fetchError,
    checkedAt,
    message: systemStatusMessage(status.repository),
  };
  writeState(nextState);
  return {
    ...status,
    lastCheck: nextState.lastCheck,
  };
}

function runSystemUpdate(requestedBy = "admin") {
  const currentConfig = config();
  if (!currentConfig.enabled) {
    throw new Error("系统更新功能未启用，请先配置 ADMIN_UPDATE_ENABLED=1。");
  }
  if (!currentConfig.commandConfigured) {
    throw new Error("未配置 ADMIN_UPDATE_COMMAND，无法执行更新。");
  }

  const currentState = normalizeState();
  if (currentState.lastRun?.status === "running" && processAlive(currentState.lastRun.pid)) {
    throw new Error("已有更新任务正在执行，请稍后再试。");
  }

  const repository = collectRepositoryStatus({ fetchRemote: false, config: currentConfig });
  if (!repository.available) {
    throw new Error(repository.fetchError || "Git 仓库不可用，无法执行更新。");
  }
  if (repository.workingTreeDirty && !currentConfig.allowDirty) {
    throw new Error("当前工作区存在未提交改动，已阻止自动更新。");
  }

  const startedAt = new Date().toISOString();
  const seededState = writeState({
    ...currentState,
    lastRun: {
      status: "running",
      startedAt,
      finishedAt: "",
      requestedBy,
      pid: null,
      exitCode: null,
      message: "更新任务已启动。",
      logFile: path.relative(repoDir, logFile) || "logs/system-update.log",
    },
  });

  const child = spawn(process.execPath, [runnerFile], {
    cwd: repoDir,
    detached: true,
    stdio: "ignore",
    env: {
      ...process.env,
      ADMIN_UPDATE_RUNNER_STATE_FILE: stateFile,
      ADMIN_UPDATE_RUNNER_LOG_FILE: logFile,
      ADMIN_UPDATE_RUNNER_REPO_DIR: repoDir,
      ADMIN_UPDATE_RUNNER_COMMAND: currentConfig.command,
      ADMIN_UPDATE_RUNNER_SHELL: currentConfig.shell,
    },
  });
  child.unref();

  writeState({
    ...seededState,
    lastRun: {
      ...(seededState.lastRun || {}),
      pid: child.pid,
      message: "更新任务正在后台执行。",
    },
  });

  return buildStatus();
}

module.exports = {
  ensureSystemUpdateStore,
  getSystemUpdateStatus,
  checkSystemUpdates,
  runSystemUpdate,
};
