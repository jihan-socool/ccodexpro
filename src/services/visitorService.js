const fs = require("fs");
const path = require("path");
const { sqliteEnabled, ensureSqliteStore, readMeta, writeMeta } = require("./sqliteStore");

const dataDir = path.join(__dirname, "../../data");
const visitorsFile = path.join(dataDir, "visitors.json");

function ensureVisitorStore() {
  if (sqliteEnabled()) {
    ensureSqliteStore();
    return;
  }
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(visitorsFile)) {
    fs.writeFileSync(visitorsFile, `${JSON.stringify({ total: 0, daily: {} }, null, 2)}\n`);
  }
}

function todayKey(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function readVisitors() {
  if (sqliteEnabled()) return readMeta("visitors", visitorsFile, { total: 0, daily: {} });
  ensureVisitorStore();
  return JSON.parse(fs.readFileSync(visitorsFile, "utf8"));
}

function writeVisitors(data) {
  if (sqliteEnabled()) {
    writeMeta("visitors", data);
    return;
  }
  ensureVisitorStore();
  fs.writeFileSync(visitorsFile, `${JSON.stringify(data, null, 2)}\n`);
}

function trackVisit() {
  const data = readVisitors();
  const day = todayKey();
  data.total = Number(data.total || 0) + 1;
  data.daily = data.daily || {};
  data.daily[day] = Number(data.daily[day] || 0) + 1;
  writeVisitors(data);
  return visitorSummary();
}

function visitorSummary(days = 14) {
  const data = readVisitors();
  const daily = data.daily || {};
  const history = [];
  const now = new Date();

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - index);
    const day = todayKey(date);
    history.push({ date: day, count: Number(daily[day] || 0) });
  }

  return {
    total: Number(data.total || 0),
    today: Number(daily[todayKey()] || 0),
    history,
  };
}

module.exports = {
  ensureVisitorStore,
  trackVisit,
  visitorSummary,
};
