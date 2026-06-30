const http = require("http");
const fs = require("fs");
const path = require("path");
const { createPayment, verifyPaymentCallback } = require("./src/payment-adapters");

const root = __dirname;
const dataDir = path.join(root, "data");
const ordersFile = path.join(dataDir, "orders.json");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";

const products = new Map([
  ["plus-topup", { name: "ChatGPT Plus 充值", price: 168 }],
  ["plus-ready", { name: "ChatGPT Plus 成品", price: 176 }],
  ["pro-5x", { name: "ChatGPT Pro 5X 充值", price: 825 }],
  ["pro-20x", { name: "ChatGPT Pro 20X 充值", price: 1480 }],
  ["codex-starter", { name: "Codex Agent 充值", price: 128 }],
  ["codex-team", { name: "Codex Pro 工作流", price: 398 }],
]);

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, "[]\n");
}

function readOrders() {
  ensureStore();
  return JSON.parse(fs.readFileSync(ordersFile, "utf8"));
}

function writeOrders(orders) {
  ensureStore();
  fs.writeFileSync(ordersFile, `${JSON.stringify(orders, null, 2)}\n`);
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("请求体过大"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error("JSON 格式错误"));
      }
    });
    req.on("error", reject);
  });
}

function orderId() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `ORD-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function formatTime(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function publicOrder(order) {
  return {
    id: order.id,
    productId: order.productId,
    productName: order.productName,
    amount: order.amount,
    contact: order.contact,
    payment: order.payment,
    status: order.status,
    time: order.time,
    paidAt: order.paidAt,
    gatewayTradeNo: order.gatewayTradeNo,
  };
}

function updateOrder(id, updater) {
  const orders = readOrders();
  const index = orders.findIndex((order) => order.id === id);
  if (index === -1) return null;
  orders[index] = { ...orders[index], ...updater(orders[index]), updatedAt: formatTime() };
  writeOrders(orders);
  return orders[index];
}

function staticFile(res, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const target = path.normalize(path.join(root, requested));
  if (!target.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(target, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(target);
    const types = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".svg": "image/svg+xml",
      ".json": "application/json; charset=utf-8",
      ".md": "text/markdown; charset=utf-8",
    };
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(data);
  });
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, paymentMode: process.env.PAYMENT_MODE || "mock" });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/orders") {
    const keyword = String(url.searchParams.get("keyword") || "").trim().toLowerCase();
    const orders = readOrders()
      .filter((order) => {
        if (!keyword) return true;
        return order.id.toLowerCase().includes(keyword) || String(order.contact).toLowerCase().includes(keyword);
      })
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .map(publicOrder);
    sendJson(res, 200, { orders });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/orders") {
    const body = await readBody(req);
    const product = products.get(body.productId);
    const contact = String(body.contact || "").trim();
    const payment = String(body.payment || "alipay");
    if (!product) return sendError(res, 400, "商品不存在");
    if (contact.length < 8 || !/(@|\d{8,})/.test(contact)) return sendError(res, 400, "联系方式格式不正确");
    if (!["alipay", "wechat", "usdt"].includes(payment)) return sendError(res, 400, "支付方式不支持");

    const now = formatTime();
    const order = {
      id: orderId(),
      productId: body.productId,
      productName: product.name,
      amount: product.price,
      contact,
      payment,
      status: "待支付",
      time: now,
      createdAt: now,
      updatedAt: now,
    };
    const orders = readOrders();
    orders.unshift(order);
    writeOrders(orders);
    sendJson(res, 201, { order: publicOrder(order) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/payments/create") {
    const body = await readBody(req);
    const orders = readOrders();
    const order = orders.find((item) => item.id === body.orderId);
    if (!order) return sendError(res, 404, "订单不存在");
    const provider = String(body.provider || order.payment || "alipay");
    if (!["alipay", "wechat", "usdt"].includes(provider)) return sendError(res, 400, "支付方式不支持");
    const payment = await createPayment({ ...order, payment: provider }, provider);
    const updated = updateOrder(order.id, () => ({
      payment: provider,
      paymentMode: payment.mode,
      gatewayPrepayId: payment.prepayId,
      status: "待支付",
    }));
    sendJson(res, 200, { order: publicOrder(updated), payment });
    return;
  }

  if (req.method === "POST" && url.pathname.match(/^\/api\/orders\/[^/]+\/mark-paid$/)) {
    const id = decodeURIComponent(url.pathname.split("/")[3]);
    const updated = updateOrder(id, () => ({
      status: "支付已提交，待人工交付",
      paidAt: formatTime(),
    }));
    if (!updated) return sendError(res, 404, "订单不存在");
    sendJson(res, 200, { order: publicOrder(updated) });
    return;
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/payments/callback/")) {
    const provider = url.pathname.split("/").pop();
    const rawBody = await new Promise((resolve) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => resolve(body));
    });
    const headers = req.headers;
    const result = await verifyPaymentCallback(provider, rawBody, headers);
    if (!result.ok) return sendError(res, 400, result.error || "回调验签失败");
    const updated = updateOrder(result.orderId, () => ({
      status: "已支付，待交付",
      paidAt: formatTime(),
      gatewayTradeNo: result.tradeNo,
    }));
    if (!updated) return sendError(res, 404, "订单不存在");
    sendJson(res, 200, provider === "wechat" ? { code: "SUCCESS", message: "成功" } : { success: true });
    return;
  }

  sendError(res, 404, "接口不存在");
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    staticFile(res, url.pathname);
  } catch (error) {
    sendError(res, 500, error.message || "服务器错误");
  }
});

server.listen(port, host, () => {
  ensureStore();
  console.log(`NEXAI20X site running at http://${host}:${port}`);
});
