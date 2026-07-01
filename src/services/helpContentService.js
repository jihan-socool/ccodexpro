const fs = require("fs");
const path = require("path");
const { sqliteEnabled, ensureSqliteStore, readMeta, writeMeta } = require("./sqliteStore");
const helpContentDefaults = require("../shared/helpContentDefaults");

const dataDir = path.join(__dirname, "../../data");
const helpContentFile = path.join(dataDir, "help-content.json");

function ensureHelpContentStore() {
  if (sqliteEnabled()) {
    ensureSqliteStore();
    return;
  }
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(helpContentFile)) {
    fs.writeFileSync(helpContentFile, `${JSON.stringify(helpContentDefaults, null, 2)}\n`);
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function legacyPolicyToMarkdown(policy = {}) {
  const lines = [];
  const effectiveDate = String(policy.effectiveDate || "").trim();
  const lastUpdated = String(policy.lastUpdated || "").trim();
  if (effectiveDate) lines.push(`生效日期：${effectiveDate}`);
  if (lastUpdated) lines.push(`最后更新：${lastUpdated}`);
  if (lines.length) lines.push("");

  const sections = Array.isArray(policy.sections) ? policy.sections : [];
  sections.forEach((section, index) => {
    const title = String(section.title || "").trim();
    const paragraphs = Array.isArray(section.paragraphs)
      ? section.paragraphs.map((item) => String(item || "").trim()).filter(Boolean)
      : [];
    const bullets = Array.isArray(section.bullets)
      ? section.bullets.map((item) => String(item || "").trim()).filter(Boolean)
      : [];

    if (title) lines.push(`## ${title}`);
    paragraphs.forEach((paragraph) => {
      lines.push("");
      lines.push(paragraph);
    });
    if (bullets.length) {
      lines.push("");
      bullets.forEach((bullet) => lines.push(`- ${bullet}`));
    }
    if (index < sections.length - 1) lines.push("");
    lines.push("");
  });

  return lines.join("\n").trim();
}

function mergeHelpContent(content = {}) {
  const defaults = clone(helpContentDefaults);
  const next = {
    supportShowcase: {
      ...defaults.supportShowcase,
      ...(content.supportShowcase || {}),
    },
    faq: {
      ...defaults.faq,
      ...(content.faq || {}),
      groups: Array.isArray(content.faq?.groups)
        ? content.faq.groups.map((group) => ({
          title: String(group.title || "").trim(),
          items: Array.isArray(group.items)
            ? group.items.map((item) => ({
              question: String(item.question || "").trim(),
              answer: String(item.answer || "").trim(),
            })).filter((item) => item.question && item.answer)
            : [],
        })).filter((group) => group.title && group.items.length)
        : defaults.faq.groups,
    },
    policies: {},
    checkoutAgreement: String(content.checkoutAgreement || defaults.checkoutAgreement).trim() || defaults.checkoutAgreement,
  };

  for (const key of Object.keys(defaults.policies)) {
    const current = content.policies?.[key] || {};
    next.policies[key] = {
      markdown: String(current.markdown || "").trim()
        || legacyPolicyToMarkdown(current)
        || defaults.policies[key].markdown,
    };
  }

  return next;
}

function readHelpContent() {
  if (sqliteEnabled()) {
    const content = readMeta("helpContent", helpContentFile, helpContentDefaults);
    return mergeHelpContent(content);
  }
  ensureHelpContentStore();
  const content = JSON.parse(fs.readFileSync(helpContentFile, "utf8"));
  return mergeHelpContent(content);
}

function writeHelpContent(update) {
  const current = readHelpContent();
  const next = mergeHelpContent({
    ...current,
    ...update,
    supportShowcase: { ...current.supportShowcase, ...(update.supportShowcase || {}) },
    faq: { ...current.faq, ...(update.faq || {}) },
    policies: { ...current.policies, ...(update.policies || {}) },
  });
  if (sqliteEnabled()) {
    writeMeta("helpContent", next);
    return next;
  }
  ensureHelpContentStore();
  fs.writeFileSync(helpContentFile, `${JSON.stringify(next, null, 2)}\n`);
  return next;
}

module.exports = {
  ensureHelpContentStore,
  readHelpContent,
  writeHelpContent,
  mergeHelpContent,
};
