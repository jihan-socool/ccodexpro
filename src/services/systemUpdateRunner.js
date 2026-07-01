const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const stateFile = String(process.env.ADMIN_UPDATE_RUNNER_STATE_FILE || "").trim();
const logFile = String(process.env.ADMIN_UPDATE_RUNNER_LOG_FILE || "").trim();
const repoDir = String(process.env.ADMIN_UPDATE_RUNNER_REPO_DIR || "").trim();
const command = String(process.env.ADMIN_UPDATE_RUNNER_COMMAND || "").trim();
const shell = String(process.env.ADMIN_UPDATE_RUNNER_SHELL || "/bin/sh").trim() || "/bin/sh";
const gitTimeoutMs = Number(process.env.ADMIN_UPDATE_GIT_TIMEOUT_MS || 20000);

function ensureParentDir(file) {
  if (!file) return;
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readState() {
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
  if (!stateFile) return;
  ensureParentDir(stateFile);
  fs.writeFileSync(stateFile, `${JSON.stringify({
    lastCheck: nextState?.lastCheck && typeof nextState.lastCheck === "object" ? nextState.lastCheck : null,
    lastRun: nextState?.lastRun && typeof nextState.lastRun === "object" ? nextState.lastRun : null,
  }, null, 2)}\n`);
}

function git(args) {
  const result = spawnSync("git", args, {
    cwd: repoDir,
    encoding: "utf8",
    timeout: gitTimeoutMs,
  });
  if (result.error || result.status !== 0) return "";
  return String(result.stdout || "").trim();
}

function currentHead() {
  const sha = git(["rev-parse", "HEAD"]);
  if (!sha) return null;
  const subject = git(["log", "-1", "--format=%s", "HEAD"]);
  return {
    sha,
    shortSha: sha.slice(0, 7),
    subject,
  };
}

function appendLog(message) {
  if (!logFile) return;
  ensureParentDir(logFile);
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`);
}

function finalize(status, message, exitCode) {
  const state = readState();
  writeState({
    ...state,
    lastRun: {
      ...(state.lastRun || {}),
      status,
      finishedAt: new Date().toISOString(),
      exitCode,
      message,
      head: currentHead(),
    },
  });
}

function failFast(message) {
  appendLog(message);
  if (stateFile) finalize("failed", message, 1);
  process.exit(1);
}

if (!stateFile || !logFile || !repoDir || !command) {
  failFast("更新 runner 缺少必要环境变量，任务终止。");
}

appendLog("更新任务开始执行。");
const logFd = fs.openSync(logFile, "a");
const child = spawn(shell, ["-lc", command], {
  cwd: repoDir,
  env: process.env,
  stdio: ["ignore", logFd, logFd],
});

child.on("error", (error) => {
  fs.closeSync(logFd);
  appendLog(`更新命令启动失败：${error.message}`);
  finalize("failed", `更新命令启动失败：${error.message}`, 1);
  process.exit(1);
});

child.on("exit", (code) => {
  fs.closeSync(logFd);
  appendLog(`更新任务结束，退出码 ${code ?? 0}。`);
  if (code === 0) {
    finalize("success", "更新命令执行完成。", 0);
    process.exit(0);
  }
  finalize("failed", `更新命令执行失败，退出码 ${code ?? 1}。`, Number(code ?? 1));
  process.exit(Number(code ?? 1));
});
