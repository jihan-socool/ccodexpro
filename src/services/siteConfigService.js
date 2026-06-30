const fs = require("fs");
const path = require("path");
const { sqliteEnabled, ensureSqliteStore, readMeta, writeMeta } = require("./sqliteStore");

const dataDir = path.join(__dirname, "../../data");
const configFile = path.join(dataDir, "site-config.json");

const defaultConfig = {
  paymentQrs: {
    alipay: "assets/qr-alipay.svg",
    wechat: "assets/qr-wechat.svg",
    usdt: "assets/qr-usdt.svg",
  },
  contacts: {
    supportText: "添加客服微信获取帮助，工作时间 9:00 至 24:00。",
    supportQr: "assets/qr-support.svg",
    salesQr: "assets/qr-sales.svg",
    supportLabel: "售后客服",
    salesLabel: "企业采购",
  },
};

function ensureSiteConfigStore() {
  if (sqliteEnabled()) {
    ensureSqliteStore();
    return;
  }
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(configFile)) {
    fs.writeFileSync(configFile, `${JSON.stringify(defaultConfig, null, 2)}\n`);
  }
}

function readSiteConfig() {
  if (sqliteEnabled()) {
    const config = readMeta("siteConfig", configFile, defaultConfig);
    return {
      paymentQrs: { ...defaultConfig.paymentQrs, ...(config.paymentQrs || {}) },
      contacts: { ...defaultConfig.contacts, ...(config.contacts || {}) },
    };
  }
  ensureSiteConfigStore();
  const config = JSON.parse(fs.readFileSync(configFile, "utf8"));
  return {
    paymentQrs: { ...defaultConfig.paymentQrs, ...(config.paymentQrs || {}) },
    contacts: { ...defaultConfig.contacts, ...(config.contacts || {}) },
  };
}

function writeSiteConfig(update) {
  const current = readSiteConfig();
  const next = {
    paymentQrs: { ...current.paymentQrs, ...(update.paymentQrs || {}) },
    contacts: { ...current.contacts, ...(update.contacts || {}) },
  };
  if (sqliteEnabled()) {
    writeMeta("siteConfig", next);
    return next;
  }
  fs.writeFileSync(configFile, `${JSON.stringify(next, null, 2)}\n`);
  return next;
}

module.exports = {
  ensureSiteConfigStore,
  readSiteConfig,
  writeSiteConfig,
};
