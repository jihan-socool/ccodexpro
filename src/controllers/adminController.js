const { getAllProducts, updateProduct } = require("../config/products");
const { queryOrders, updateOrder, publicOrder, formatTime } = require("../services/orderService");
const { readContent, saveContentItem } = require("../services/contentService");
const { readSiteConfig, writeSiteConfig } = require("../services/siteConfigService");
const { visitorSummary } = require("../services/visitorService");
const { createAdminSession, validateAdminCredentials } = require("../middleware/adminAuth");

const contentTypes = ["news", "podcast"];
const contentStatuses = ["draft", "published"];

function loginAdmin(req, res) {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (!validateAdminCredentials(username, password)) {
    return res.status(401).json({ error: "账号或密码错误" });
  }

  res.json({ session: createAdminSession(username) });
}

function getAdminOverview(req, res) {
  const keyword = String(req.query.keyword || "").trim();
  res.json({
    products: getAllProducts(),
    orders: queryOrders({ keyword }),
    content: readContent().sort((a, b) => String(b.date).localeCompare(String(a.date))),
    siteConfig: readSiteConfig(),
    visitors: visitorSummary(),
  });
}

function updateAdminProduct(req, res) {
  const { productId } = req.params;
  const price = Number(req.body.price);
  const original = Number(req.body.original);

  if (!Number.isFinite(price) || price < 0) {
    return res.status(400).json({ error: "价格必须是有效数字" });
  }

  const updateData = {
    price,
  };

  if (Number.isFinite(original) && original >= 0) updateData.original = original;
  if (typeof req.body.name === "string") updateData.name = req.body.name.trim();
  if (typeof req.body.desc === "string") updateData.desc = req.body.desc.trim();
  if (typeof req.body.period === "string") updateData.period = req.body.period.trim();
  if (Array.isArray(req.body.features)) {
    updateData.features = req.body.features.map((item) => String(item).trim()).filter(Boolean);
  }

  const product = updateProduct(productId, updateData);
  if (!product) return res.status(404).json({ error: "商品不存在" });

  res.json({ product });
}

function searchAdminOrders(req, res) {
  const keyword = String(req.query.keyword || "").trim();
  res.json({ orders: queryOrders({ keyword }) });
}

function updateAdminOrder(req, res) {
  const { orderId } = req.params;
  const status = String(req.body.status || "").trim();
  if (!status) return res.status(400).json({ error: "订单状态不能为空" });

  const updateData = { status };
  if (status.includes("支付") || status.includes("交付")) {
    updateData.paidAt = req.body.paidAt || formatTime();
  }
  if (typeof req.body.note === "string") updateData.adminNote = req.body.note.trim();

  const order = updateOrder(orderId, updateData);
  if (!order) return res.status(404).json({ error: "订单不存在" });

  res.json({ order: publicOrder(order) });
}

function listAdminContent(req, res) {
  res.json({ content: readContent().sort((a, b) => String(b.date).localeCompare(String(a.date))) });
}

function saveAdminContent(req, res) {
  const data = {
    id: String(req.body.id || "").trim(),
    type: String(req.body.type || "").trim(),
    status: String(req.body.status || "published").trim(),
    date: String(req.body.date || "").trim(),
    author: String(req.body.author || "").trim(),
    title: String(req.body.title || "").trim(),
    intro: String(req.body.intro || "").trim(),
    body: String(req.body.body || "").trim(),
    audioUrl: String(req.body.audioUrl || "").trim(),
  };

  if (!contentTypes.includes(data.type)) {
    return res.status(400).json({ error: "内容类型必须是新闻或播客" });
  }
  if (!contentStatuses.includes(data.status)) {
    return res.status(400).json({ error: "发布状态无效" });
  }
  if (!data.title || !data.intro || !data.author) {
    return res.status(400).json({ error: "标题、作者和摘要不能为空" });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    return res.status(400).json({ error: "日期格式应为 YYYY-MM-DD" });
  }

  res.status(data.id ? 200 : 201).json({ item: saveContentItem(data) });
}

function updateAdminSiteConfig(req, res) {
  const clean = (value) => String(value || "").trim();
  const config = writeSiteConfig({
    paymentQrs: {
      alipay: clean(req.body.paymentQrs?.alipay),
      wechat: clean(req.body.paymentQrs?.wechat),
      usdt: clean(req.body.paymentQrs?.usdt),
    },
    contacts: {
      supportText: clean(req.body.contacts?.supportText),
      supportQr: clean(req.body.contacts?.supportQr),
      salesQr: clean(req.body.contacts?.salesQr),
      supportLabel: clean(req.body.contacts?.supportLabel),
      salesLabel: clean(req.body.contacts?.salesLabel),
    },
  });

  res.json({ config });
}

module.exports = {
  loginAdmin,
  getAdminOverview,
  updateAdminProduct,
  searchAdminOrders,
  updateAdminOrder,
  listAdminContent,
  saveAdminContent,
  updateAdminSiteConfig,
};
