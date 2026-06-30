const { getAllProducts } = require("../config/products");
const { publicContent } = require("../services/contentService");
const { getAiStatus } = require("../services/statusService");
const { readSiteConfig } = require("../services/siteConfigService");
const { trackVisit } = require("../services/visitorService");

function getProducts(req, res) {
  res.json({ products: getAllProducts() });
}

function getPublishedContent(req, res) {
  res.json({ content: publicContent() });
}

async function getStatus(req, res) {
  try {
    res.json(await getAiStatus());
  } catch (error) {
    res.status(502).json({ error: error.message || "状态查询失败" });
  }
}

function getSiteConfig(req, res) {
  res.json({ config: readSiteConfig() });
}

function trackVisitor(req, res) {
  res.json({ visitors: trackVisit() });
}

module.exports = {
  getProducts,
  getPublishedContent,
  getStatus,
  getSiteConfig,
  trackVisitor,
};
