const fs = require("fs");
const path = require("path");
const { sqliteEnabled, ensureSqliteStore, readCollection, writeCollection } = require("./sqliteStore");

const dataDir = path.join(__dirname, "../../data");
const contentFile = path.join(dataDir, "content.json");

function ensureContentStore() {
  if (sqliteEnabled()) {
    ensureSqliteStore();
    return;
  }
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(contentFile)) fs.writeFileSync(contentFile, "[]\n");
}

function readContent() {
  if (sqliteEnabled()) return readCollection("content", contentFile);
  ensureContentStore();
  return JSON.parse(fs.readFileSync(contentFile, "utf8"));
}

function writeContent(items) {
  if (sqliteEnabled()) {
    writeCollection("content", items);
    return;
  }
  ensureContentStore();
  fs.writeFileSync(contentFile, `${JSON.stringify(items, null, 2)}\n`);
}

function publicContent() {
  return readContent()
    .filter((item) => item.status === "published")
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function generateContentId(title) {
  const slug = normalizeSlug(title) || "content";
  return `${slug}-${Date.now().toString(36)}`;
}

function saveContentItem(data) {
  const items = readContent();
  const id = String(data.id || "").trim() || generateContentId(data.title);
  const now = new Date().toISOString();
  const item = {
    id,
    type: data.type,
    status: data.status || "published",
    date: data.date,
    author: data.author,
    title: data.title,
    intro: data.intro,
    body: data.body || "",
    audioUrl: data.audioUrl || "",
    updatedAt: now,
  };

  const index = items.findIndex((entry) => entry.id === id);
  if (index === -1) {
    items.unshift({ ...item, createdAt: now });
  } else {
    items[index] = { ...items[index], ...item };
  }
  writeContent(items);
  return index === -1 ? items[0] : items[index];
}

module.exports = {
  ensureContentStore,
  readContent,
  writeContent,
  publicContent,
  saveContentItem,
};
