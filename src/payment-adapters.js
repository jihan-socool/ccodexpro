const crypto = require("crypto");
const https = require("https");
const { readSiteConfig } = require("./services/siteConfigService");

function paymentQrs() {
  return readSiteConfig().paymentQrs;
}

function mode() {
  return process.env.PAYMENT_MODE === "live" ? "live" : "mock";
}

async function createPayment(order, provider) {
  if (provider === "usdt") return createUsdtPayment(order);
  if (mode() !== "live") return createMockPayment(order, provider);
  if (provider === "alipay") return createAlipayPayment(order);
  if (provider === "wechat") return createWechatPayment(order);
  throw new Error("支付方式不支持");
}

function createMockPayment(order, provider) {
  const qr = paymentQrs();
  return {
    mode: "mock",
    provider,
    orderId: order.id,
    amount: order.amount,
    qrCode: qr[provider] || qr.alipay,
    prepayId: `MOCK-${provider}-${Date.now()}`,
    message: "当前为 mock 模式。配置 PAYMENT_MODE=live 与商户参数后可接真实网关。",
  };
}

function createUsdtPayment(order) {
  const qr = paymentQrs();
  return {
    mode: "manual",
    provider: "usdt",
    orderId: order.id,
    amount: order.amount,
    qrCode: qr.usdt,
    prepayId: `USDT-${Date.now()}`,
    address: process.env.USDT_BEP20_ADDRESS || "TBD_CONFIGURE_USDT_BEP20_ADDRESS",
    network: "BEP20",
  };
}

async function createAlipayPayment(order) {
  const required = ["ALIPAY_APP_ID", "ALIPAY_PRIVATE_KEY", "ALIPAY_PUBLIC_KEY", "ALIPAY_NOTIFY_URL"];
  assertEnv(required, "支付宝");
  const bizContent = {
    out_trade_no: order.id,
    total_amount: Number(order.amount).toFixed(2),
    subject: order.productName,
  };
  const params = {
    app_id: process.env.ALIPAY_APP_ID,
    method: "alipay.trade.precreate",
    charset: "utf-8",
    sign_type: "RSA2",
    timestamp: nowForGateway(),
    version: "1.0",
    notify_url: process.env.ALIPAY_NOTIFY_URL,
    biz_content: JSON.stringify(bizContent),
  };
  params.sign = rsaSign(buildAlipaySignText(params), process.env.ALIPAY_PRIVATE_KEY);

  const response = await postForm(params.gateway || process.env.ALIPAY_GATEWAY || "https://openapi.alipay.com/gateway.do", params);
  const payload = JSON.parse(response);
  const result = payload.alipay_trade_precreate_response || {};
  if (result.code && result.code !== "10000") {
    throw new Error(`支付宝下单失败：${result.sub_msg || result.msg || result.code}`);
  }
  return {
    mode: "live",
    provider: "alipay",
    orderId: order.id,
    amount: order.amount,
    qrCode: paymentQrs().alipay,
    qrPayload: result.qr_code,
    prepayId: result.out_trade_no || order.id,
    gatewayTradeNo: result.trade_no,
    raw: result,
    message: "支付宝 OpenAPI 已返回预下单结果。",
  };
}

async function createWechatPayment(order) {
  const required = [
    "WECHAT_MCH_ID",
    "WECHAT_APP_ID",
    "WECHAT_API_V3_KEY",
    "WECHAT_PRIVATE_KEY",
    "WECHAT_SERIAL_NO",
    "WECHAT_NOTIFY_URL",
  ];
  assertEnv(required, "微信支付");
  const body = {
    appid: process.env.WECHAT_APP_ID,
    mchid: process.env.WECHAT_MCH_ID,
    description: order.productName,
    out_trade_no: order.id,
    notify_url: process.env.WECHAT_NOTIFY_URL,
    amount: { total: Math.round(Number(order.amount) * 100), currency: "CNY" },
  };
  const nonce = crypto.randomBytes(16).toString("hex");
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = wechatSign("POST", "/v3/pay/transactions/native", timestamp, nonce, JSON.stringify(body));
  const response = await postJson("https://api.mch.weixin.qq.com/v3/pay/transactions/native", body, {
    Authorization: `WECHATPAY2-SHA256-RSA2048 mchid="${process.env.WECHAT_MCH_ID}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="${process.env.WECHAT_SERIAL_NO}"`,
    "Content-Type": "application/json",
    Accept: "application/json",
  });
  const payload = JSON.parse(response);
  if (!payload.code_url) {
    throw new Error(`微信支付下单失败：${payload.message || payload.code || "未返回 code_url"}`);
  }
  return {
    mode: "live",
    provider: "wechat",
    orderId: order.id,
    amount: order.amount,
    qrCode: paymentQrs().wechat,
    qrPayload: payload.code_url,
    prepayId: payload.prepay_id || order.id,
    raw: payload,
    message: "微信支付 V3 Native 已返回 code_url。",
  };
}

async function verifyPaymentCallback(provider, rawBody, headers) {
  if (mode() !== "live") return verifyMockCallback(provider, rawBody);
  if (provider === "alipay") return verifyAlipayCallback(rawBody);
  if (provider === "wechat") return verifyWechatCallback(rawBody, headers);
  return { ok: false, error: "回调渠道不支持" };
}

function verifyMockCallback(provider, rawBody) {
  try {
    const data = rawBody ? JSON.parse(rawBody) : {};
    return {
      ok: true,
      provider,
      orderId: data.orderId,
      tradeNo: data.tradeNo || `MOCK-TRADE-${Date.now()}`,
    };
  } catch (error) {
    return { ok: false, error: "mock 回调 JSON 格式错误" };
  }
}

function verifyAlipayCallback(rawBody) {
  const params = Object.fromEntries(new URLSearchParams(rawBody));
  const sign = params.sign;
  delete params.sign;
  delete params.sign_type;
  const signText = buildAlipaySignText(params);
  const ok = crypto
    .createVerify("RSA-SHA256")
    .update(signText, "utf8")
    .verify(normalizePublicKey(process.env.ALIPAY_PUBLIC_KEY), sign || "", "base64");
  if (!ok) return { ok: false, error: "支付宝回调验签失败" };
  if (!["TRADE_SUCCESS", "TRADE_FINISHED"].includes(params.trade_status)) {
    return { ok: false, error: "支付宝交易状态未成功" };
  }
  return { ok: true, provider: "alipay", orderId: params.out_trade_no, tradeNo: params.trade_no };
}

function verifyWechatCallback(rawBody, headers) {
  const serial = headers["wechatpay-serial"];
  const signature = headers["wechatpay-signature"];
  const timestamp = headers["wechatpay-timestamp"];
  const nonce = headers["wechatpay-nonce"];
  if (!serial || !signature || !timestamp || !nonce) return { ok: false, error: "微信回调头缺失" };
  const publicKey = process.env.WECHAT_PLATFORM_PUBLIC_KEY;
  if (!publicKey) return { ok: false, error: "缺少 WECHAT_PLATFORM_PUBLIC_KEY，无法验签" };
  const message = `${timestamp}\n${nonce}\n${rawBody}\n`;
  const ok = crypto.createVerify("RSA-SHA256").update(message, "utf8").verify(normalizePublicKey(publicKey), signature, "base64");
  if (!ok) return { ok: false, error: "微信回调验签失败" };
  const payload = JSON.parse(rawBody);
  const decrypted = payload.resource ? decryptWechatResource(payload.resource) : payload;
  return {
    ok: true,
    provider: "wechat",
    orderId: decrypted.out_trade_no,
    tradeNo: decrypted.transaction_id,
    rawEncrypted: payload.resource,
  };
}

function decryptWechatResource(resource) {
  const key = Buffer.from(process.env.WECHAT_API_V3_KEY, "utf8");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(resource.nonce, "utf8"));
  decipher.setAuthTag(Buffer.from(resource.tag, "base64"));
  decipher.setAAD(Buffer.from(resource.associated_data || "", "utf8"));
  const decoded = Buffer.concat([decipher.update(Buffer.from(resource.ciphertext, "base64")), decipher.final()]);
  return JSON.parse(decoded.toString("utf8"));
}

function assertEnv(keys, provider) {
  const missing = keys.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`${provider} live 模式缺少环境变量：${missing.join(", ")}`);
  }
}

function nowForGateway() {
  const date = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function buildAlipaySignText(params) {
  return Object.keys(params)
    .sort()
    .filter((key) => params[key] !== undefined && params[key] !== "")
    .map((key) => `${key}=${params[key]}`)
    .join("&");
}

function rsaSign(text, privateKey) {
  return crypto.createSign("RSA-SHA256").update(text, "utf8").sign(normalizePrivateKey(privateKey), "base64");
}

function wechatSign(method, url, timestamp, nonce, body) {
  const message = `${method}\n${url}\n${timestamp}\n${nonce}\n${body}\n`;
  return rsaSign(message, process.env.WECHAT_PRIVATE_KEY);
}

function normalizePrivateKey(value) {
  if (value.includes("BEGIN")) return value.replace(/\\n/g, "\n");
  return `-----BEGIN PRIVATE KEY-----\n${value.match(/.{1,64}/g).join("\n")}\n-----END PRIVATE KEY-----`;
}

function normalizePublicKey(value) {
  if (value.includes("BEGIN")) return value.replace(/\\n/g, "\n");
  return `-----BEGIN PUBLIC KEY-----\n${value.match(/.{1,64}/g).join("\n")}\n-----END PUBLIC KEY-----`;
}

function postForm(url, params) {
  return request(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body: new URLSearchParams(params).toString(),
  });
}

function postJson(url, body, headers) {
  return request(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

function request(url, options) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const req = https.request(
      {
        hostname: target.hostname,
        path: `${target.pathname}${target.search}`,
        method: options.method,
        headers: {
          ...options.headers,
          "Content-Length": Buffer.byteLength(options.body),
        },
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`支付网关 HTTP ${res.statusCode}: ${data}`));
            return;
          }
          resolve(data);
        });
      },
    );
    req.on("error", reject);
    req.write(options.body);
    req.end();
  });
}

module.exports = {
  createPayment,
  verifyPaymentCallback,
};
