const crypto = require("crypto");

const sessionTtlMs = 1000 * 60 * 60 * 12;

function adminSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || process.env.ADMIN_TOKEN || "nexai20x-dev-secret";
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function signPayload(payload) {
  return crypto.createHmac("sha256", adminSecret()).update(payload).digest("base64url");
}

function createAdminSession(username) {
  const payload = Buffer.from(JSON.stringify({
    username,
    exp: Date.now() + sessionTtlMs,
  })).toString("base64url");
  return `${payload}.${signPayload(payload)}`;
}

function verifyAdminSession(token) {
  const [payload, signature] = String(token || "").split(".");
  if (!payload || !signature || !safeEqual(signature, signPayload(payload))) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.exp || Date.now() >= Number(data.exp)) return false;
    return data;
  } catch (error) {
    return false;
  }
}

function validateAdminCredentials(username, password) {
  const adminUser = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_TOKEN || "";
  if (!adminPassword) return false;
  return safeEqual(username, adminUser) && safeEqual(password, adminPassword);
}

function adminAuth(req, res, next) {
  const legacyToken = process.env.ADMIN_TOKEN;
  const providedSession = req.get("X-Admin-Session") || "";
  const providedLegacy = req.get("X-Admin-Token") || req.query.adminToken;
  const session = verifyAdminSession(providedSession);

  if (session) {
    req.adminUser = session.username || process.env.ADMIN_USERNAME || "admin";
    return next();
  }
  if (legacyToken && providedLegacy && safeEqual(providedLegacy, legacyToken)) {
    req.adminUser = process.env.ADMIN_USERNAME || "admin";
    return next();
  }

  return res.status(401).json({ error: "请先登录后台" });
}

module.exports = {
  adminAuth,
  createAdminSession,
  validateAdminCredentials,
};
