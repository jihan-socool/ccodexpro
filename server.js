require("dotenv").config();
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

const orderRoutes = require("./src/routes/orderRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const publicRoutes = require("./src/routes/publicRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const rawBodyCapture = require("./src/middleware/rawBody");
const errorHandler = require("./src/middleware/errorHandler");
const { ensureStore } = require("./src/services/orderService");
const { ensureProductsStore } = require("./src/config/products");
const { ensureContentStore } = require("./src/services/contentService");
const { ensureHelpContentStore } = require("./src/services/helpContentService");
const { ensureSiteConfigStore } = require("./src/services/siteConfigService");
const { ensureVisitorStore } = require("./src/services/visitorService");

const app = express();
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";

// 安全和日志中间件
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(morgan("dev"));

// 健康检查
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    paymentMode: process.env.PAYMENT_MODE || "mock",
    timestamp: new Date().toISOString(),
  });
});

// 支付回调路由需要原始body
app.use("/api/payments/callback", rawBodyCapture);

// JSON body解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API 路由
app.use("/api", publicRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentRoutes);
app.use("/api", adminRoutes);

// 静态文件服务
app.get("/father", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

app.get("/admin.html", (req, res) => {
  res.status(404).send("Not found");
});

app.get("/admin", (req, res) => {
  res.status(404).send("Not found");
});

app.use(express.static(path.join(__dirname), {
  index: "index.html",
}));

// 404 处理
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({ error: "接口不存在" });
  } else {
    res.status(404).send("Not found");
  }
});

// 错误处理
app.use(errorHandler);

// 启动服务器
app.listen(port, host, () => {
  ensureStore();
  ensureProductsStore();
  ensureContentStore();
  ensureHelpContentStore();
  ensureSiteConfigStore();
  ensureVisitorStore();
  console.log(`NEXAI20X site running at http://${host}:${port}`);
  console.log(`Admin panel: http://${host}:${port}/father`);
  console.log(`Payment mode: ${process.env.PAYMENT_MODE || "mock"}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
