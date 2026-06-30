const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "../../data");
const defaultDbPath = path.join(dataDir, "app.sqlite");

let database;

function sqliteEnabled() {
  return String(process.env.DATA_STORE || "json").toLowerCase() === "sqlite";
}

function getDbPath() {
  return process.env.SQLITE_PATH || defaultDbPath;
}

function ensureParentDir(filePath) {
  const parentDir = path.dirname(filePath);
  if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
}

function getDb() {
  if (!sqliteEnabled()) return null;
  if (database) return database;

  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  ensureParentDir(getDbPath());
  const Database = require("better-sqlite3");
  database = new Database(getDbPath());
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  database.exec(`
    CREATE TABLE IF NOT EXISTS records (
      namespace TEXT NOT NULL,
      id TEXT NOT NULL,
      sort_index INTEGER NOT NULL DEFAULT 0,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (namespace, id)
    );

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  return database;
}

function ensureSqliteStore() {
  getDb();
}

function readJsonFile(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function seedCollection(namespace, filePath) {
  const db = getDb();
  const count = db.prepare("SELECT COUNT(*) AS count FROM records WHERE namespace = ?").get(namespace).count;
  if (count > 0 || !fs.existsSync(filePath)) return;
  const items = readJsonFile(filePath, []);
  if (!Array.isArray(items) || !items.length) return;
  writeCollection(namespace, items);
}

function readCollection(namespace, filePath) {
  const db = getDb();
  seedCollection(namespace, filePath);
  return db
    .prepare("SELECT data FROM records WHERE namespace = ? ORDER BY sort_index ASC, created_at DESC")
    .all(namespace)
    .map((row) => JSON.parse(row.data));
}

function writeCollection(namespace, items) {
  const db = getDb();
  const transaction = db.transaction((nextItems) => {
    db.prepare("DELETE FROM records WHERE namespace = ?").run(namespace);
    const insert = db.prepare(`
      INSERT INTO records (namespace, id, sort_index, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    nextItems.forEach((item, index) => {
      insert.run(namespace, String(item.id), index, JSON.stringify(item));
    });
  });
  transaction(items);
}

function readMeta(key, filePath, fallback) {
  const db = getDb();
  const row = db.prepare("SELECT value FROM meta WHERE key = ?").get(key);
  if (row) return JSON.parse(row.value);

  const value = readJsonFile(filePath, fallback);
  writeMeta(key, value);
  return value;
}

function writeMeta(key, value) {
  const db = getDb();
  db.prepare(`
    INSERT INTO meta (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = CURRENT_TIMESTAMP
  `).run(key, JSON.stringify(value));
}

module.exports = {
  sqliteEnabled,
  ensureSqliteStore,
  readCollection,
  writeCollection,
  readMeta,
  writeMeta,
};
