const API_BASE = window.location.protocol === "file:" ? "" : "/api";

const products = [
  {
    id: "plus-topup",
    type: "chatgpt",
    tag: "入门",
    name: "ChatGPT Plus 充值",
    desc: "适合日常对话、写作、作图与轻度编程的个人使用场景",
    price: 168,
    original: 252,
    period: "/月 30天",
    accent: "#6cff3d",
    features: ["GPT-5.5 / GPT-5.2 / GPT-5", "Images 2.0 图像生成", "Codex Agent 编程", "每 3 小时 150 条消息"],
  },
  {
    id: "plus-ready",
    type: "chatgpt",
    tag: "精选",
    name: "ChatGPT Plus 成品",
    desc: "直登官方账号，开立即用，适合无账号需快捷使用的个人使用场景",
    price: 176,
    original: 268,
    period: "/月 30天",
    accent: "#f6e95f",
    featured: true,
    features: ["GPT-5.5 / GPT-5.2 / GPT-5 访问", "Images 2.0 图像生成", "独立一人，独立使用", "ChatGPT Plus 完整会员权益"],
  },
  {
    id: "pro-5x",
    type: "chatgpt",
    tag: "进阶版",
    name: "ChatGPT Pro 5X 充值",
    desc: "适合重度使用 AI 的开发者、创作者与研究使用场景",
    price: 825,
    original: 1050,
    period: "/月 30天",
    accent: "#54d9ff",
    features: ["消息额度 5 倍 Plus", "Codex Agent 编程", "GPT-5.5 优先访问", "Images 2.0 完整功能"],
  },
  {
    id: "pro-20x",
    type: "chatgpt",
    tag: "顶级版",
    name: "ChatGPT Pro 20X 充值",
    desc: "适合企业、研究与超高频工作流，支持合作与提供报销收据",
    price: 1480,
    original: 1880,
    period: "/月 30天",
    accent: "#ff6f61",
    features: ["消息额度 20 倍 / 接近无限", "Images 2.0 + 4K 升级", "GPT-5.5 最高优先级", "支持合作与报销收据"],
  },
  {
    id: "codex-starter",
    type: "codex",
    tag: "轻量",
    name: "Codex Agent 充值",
    desc: "适合个人项目、脚本修复与日常代码问答",
    price: 128,
    original: 198,
    period: "/30天",
    accent: "#b8ff4d",
    features: ["代码仓库理解", "任务拆解与补丁生成", "常见框架支持", "售后协助配置"],
  },
  {
    id: "codex-team",
    type: "codex",
    tag: "团队",
    name: "Codex Pro 工作流",
    desc: "适合持续开发、批量修复与企业级代码协作",
    price: 398,
    original: 598,
    period: "/30天",
    accent: "#7ee8ff",
    featured: true,
    features: ["更高任务并发", "PR 级变更说明", "多仓库任务跟踪", "企业微信优先支持"],
  },
  {
    id: "claude-pro",
    type: "claude",
    tag: "Claude Pro",
    name: "Claude Pro 订阅",
    desc: "适合日常写作、研究、代码问答与跨设备使用的 Claude 个人订阅",
    price: 188,
    original: 268,
    period: "/月 30天",
    accent: "#ffb86b",
    features: ["官方月付参考 $20", "更多使用额度", "包含 Claude Code", "Research、Projects 与更多模型能力"],
  },
  {
    id: "claude-max-5x",
    type: "claude",
    tag: "Max 5X",
    name: "Claude Max 5X 订阅",
    desc: "适合频繁使用 Claude 写代码、分析材料和处理复杂工作的高频用户",
    price: 880,
    original: 1180,
    period: "/月 30天",
    accent: "#c8a2ff",
    featured: true,
    features: ["官方月付参考 $100", "约 5 倍 Pro 使用额度", "更高输出限制", "高峰期优先访问"],
  },
  {
    id: "claude-max-20x",
    type: "claude",
    tag: "Max 20X",
    name: "Claude Max 20X 订阅",
    desc: "适合长时间编码、研究和企业级个人工作流的超高频使用场景",
    price: 1680,
    original: 2280,
    period: "/月 30天",
    accent: "#ff8fbd",
    features: ["官方月付参考 $200", "约 20 倍 Pro 使用额度", "高级功能早期访问", "适合重度 Claude Code 工作流"],
  },
];

const blogPosts = [
  {
    date: "2026-05-26",
    author: "NEXAI20X 官方博客",
    title: '2026 终极指南：解决 ChatGPT Plus "信用卡被拒" 与 "支付失败" 难题',
    intro: "订阅 ChatGPT Plus 时常见的卡片拒付、地区限制和页面异常原因，以及更稳妥的订阅准备方式。",
  },
  {
    date: "2026-05-18",
    author: "NEXAI20X 风控中心",
    title: "2026 避坑必看：常见低价共享号与黑卡代充风险",
    intro: "为什么明显低于市场价的共享号存在账号、隐私和售后风险，如何辨别可靠服务。",
  },
  {
    date: "2026-05-12",
    author: "NEXAI20X 安全实验室",
    title: "零基础注册 ChatGPT 官方账号与安全使用指南",
    intro: "从账号注册、联系方式准备到日常登录习惯，梳理更适合长期使用的安全步骤。",
  },
];

const faqGroups = [
  {
    title: "购买与充值",
    items: [
      ["充值服务安全吗？账号会被封吗？", "我们将订单、支付与交付拆开处理，尽量减少用户提交敏感信息。充值类服务仍受到官方风控、地区、账号安全习惯等因素影响，因此页面明确提示非官方关系、订单凭证、售后边界与风险。建议用户不要共用账号，不要频繁切换异常网络环境，并保存付款凭证。"],
      ["为什么 Plus 代充价格比官方的 20 美金便宜这么多？你们赚什么？", "价格差异通常来自汇率、地区渠道、批量采购或营销补贴。页面应透明展示原价、优惠、实际支付金额和服务性质，避免承诺“永久”“绝对不封”等不可靠说法。服务方收益主要来自渠道折扣、服务费或批量采购差价。"],
      ["整个充值流程需要多长时间？", "常规订单在支付确认后进入交付队列。自动支付回调成功时，系统会立即把订单状态改为“已支付待交付”；人工核验场景需要客服根据付款截图处理。高峰期、企业大额采购或风控核验可能需要更久。"],
      ["下个月我该如何续费？", "到期前可在购买记录中查询原订单，选择相同套餐重新下单。建议提前 1 至 3 天续费，避免订阅断档。如果账号状态异常，应先联系售后确认再续费。"],
      ["充值失败怎么办？", "如果支付成功但充值失败，请提供订单号、联系方式、付款截图和失败提示。可控原因导致的失败可协助补发、重试或退款；账号自身违规、官方风控、用户提供信息错误等情况需要按售后政策核验。"],
      ["支持哪些支付方式？", "页面支持支付宝、微信支付和 USDT-BEP20 的支付入口。后端提供统一订单接口，支付适配层可接支付宝 OpenAPI 与微信支付 V3，未配置商户参数时使用 mock 二维码。"],
      ["是否支持 Claude Pro 和 Claude Max？", "页面已增加 Claude Pro、Claude Max 5X 和 Claude Max 20X 订阅购买模块。Claude 官方价格、功能、额度、模型访问和计划名称可能调整，本站展示为第三方服务价与购买流程说明，下单前应以页面确认信息和官方实际规则为准。"],
    ],
  },
  {
    title: "账号、交付与质保",
    items: [
      ["代充和官方充值有什么区别？", "官方充值由用户直接向官方平台付款，路径最清晰；代充是第三方支付代办或账号交付服务，优势是支付方式更适合本地用户，但风险、售后和责任边界必须提前说明。本页面在条款中明确非官方关系。"],
      ["有多少用户使用过 ChatGPT Plus 充值服务？", "首页展示“已帮助 1.8 万+ 位用户完成充值”的营销指标。真实上线时应以后台订单数据、去重用户数和成功交付记录为准，不应伪造统计。"],
      ["是否支持退款？", "未支付订单可取消；已支付但未交付且确认无法完成服务的订单可退款；已交付的虚拟商品原则上不支持无理由退款。若首次使用前确认卡密或账号无效，可按售后政策补发或退款。"],
      ["充值需要提供账号密码吗？", "充值下单页只收集订单联系方式。若业务必须登录用户账号，应提供更安全的替代方案、明确数据用途、最短保存时间和删除方式。不要在普通聊天里提交密码、验证码、支付密码或二次验证信息。"],
      ["有质保和无质保有什么区别？", "质保订单在有效期内可获得状态核验、可控问题补发、使用指导和优先客服。无质保或低价共享类服务通常售后边界更窄，风险更高，不建议作为长期主账号使用。"],
      ["企业批量采购如何处理？", "企业订单建议走单独报价、批量开通清单、发票或收据流程、对公付款记录和交付验收表。页面保留企业采购客服入口，避免在公开表单收集过多员工账号信息。"],
    ],
  },
  {
    title: "订单与支付接口",
    items: [
      ["订单查询是真后端吗？", "现在已增加 Node 后端接口：订单创建后写入本地 data/orders.json，查询接口支持订单号或联系方式检索。直接 file 打开时会降级为浏览器本地存储；通过 server.js 运行时使用后端。"],
      ["微信支付宝接口是否已经能收款？", "代码提供支付适配结构、订单状态、回调入口和环境变量位。未填真实商户号、私钥、证书序列号、AppID、网关地址时默认 mock。接入真实收款前必须使用商户平台参数并完成签名、验签、回调安全校验。"],
      ["支付回调如何保证安全？", "真实模式应验证支付宝 RSA2 签名或微信支付 V3 平台证书签名，校验金额、订单号、商户号、回调幂等和订单状态。示例后端把这些步骤集中在 payment-adapters.js，方便替换为官方 SDK。"],
    ],
  },
];

const state = {
  selectedProduct: products[0],
  contact: "",
  payment: "alipay",
  paymentInfo: null,
  lastOrder: null,
  lang: "ZH",
};

const paymentLabels = {
  alipay: "支付宝",
  wechat: "微信支付",
  usdt: "USDT-BEP20",
};

const app = document.querySelector("#app");
const modal = document.querySelector("#modal");
const modalContent = document.querySelector("#modalContent");
const toast = document.querySelector("#toast");
const mobileMenu = document.querySelector("#mobileMenu");

function money(value) {
  return `¥${Number(value).toFixed(2)}`;
}

function shortMoney(value) {
  return `¥${value}`;
}

function routeTo(path) {
  window.location.hash = path === "/" ? "#/" : `#${path}`;
}

function currentRoute() {
  return window.location.hash.replace(/^#/, "") || "/";
}

function toastMessage(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function localOrders() {
  return JSON.parse(localStorage.getItem("nexai20x-orders") || "[]");
}

function saveLocalOrder(order) {
  localStorage.setItem("nexai20x-orders", JSON.stringify([order, ...localOrders()].slice(0, 20)));
}

function localOrderId() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `ORD-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function formatTime(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function api(path, options = {}) {
  if (!API_BASE) throw new Error("请通过后端服务运行以使用接口。");
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "接口请求失败");
  return data;
}

function productCard(product, compact = false) {
  return `
    <article class="product-card ${product.featured ? "featured" : ""} ${compact ? "compact" : ""}" style="--accent:${product.accent}">
      <div class="card-topline">
        <span class="tag">${product.tag}</span>
        ${product.featured ? "<span class='hot'>推荐选择</span>" : ""}
      </div>
      <h3>${product.name}</h3>
      <p>${product.desc}</p>
      <div class="price-line"><span>¥</span><strong>${product.price}</strong><em>${product.period}</em></div>
      <ul>${product.features.map((item) => `<li>${item}</li>`).join("")}</ul>
      <button type="button" data-buy="${product.id}">锁定套餐</button>
    </article>
  `;
}

function render() {
  const route = currentRoute();
  mobileMenu.classList.remove("open");
  mobileMenu.setAttribute("aria-hidden", "true");

  if (route === "/query") return renderQuery();
  if (route === "/blog") return renderBlog();
  if (route === "/faq") return renderFaq();
  if (route === "/help") return renderPolicy("售后政策", "Support Policy", supportPolicy());
  if (route === "/priv") return renderPolicy("隐私政策", "Privacy Policy", privacyPolicy());
  if (route === "/tos") return renderPolicy("服务条款", "Terms of Service", termsPolicy());
  if (route.startsWith("/checkout/")) return renderCheckout(route.split("/").pop());
  if (route === "/pay") return renderPay();
  if (route === "/success") return renderSuccess();
  return renderHome();
}

function renderHome() {
  const chatgpt = products.filter((item) => item.type === "chatgpt");
  const claude = products.filter((item) => item.type === "claude");
  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy reveal">
        <span class="eyebrow">异维订阅补给站</span>
        <h1>打开传送门，补上 ChatGPT、Claude 与 Codex 额度。</h1>
        <p>选套餐，留联系方式，扫码支付。订单可追踪，售后规则写清楚。</p>
        <div class="hero-actions">
          <button class="primary-btn" type="button" data-action="scroll-products">进入补给站</button>
          <a class="secondary-btn" href="#/query" data-route="/query">购买记录</a>
        </div>
      </div>
      <div class="hero-visual reveal" aria-label="异维充值柜台">
        <div class="portal-stage" aria-hidden="true">
          <span class="portal-ring"></span>
          <span class="portal-spark spark-a"></span>
          <span class="portal-spark spark-b"></span>
          <span class="portal-spark spark-c"></span>
          <span class="portal-orbit orbit-a">Plus</span>
          <span class="portal-orbit orbit-b">Pro</span>
          <span class="portal-orbit orbit-c">Claude</span>
        </div>
        <div class="counter-ticket">
          <div class="ticket-head">
            <strong>今日柜台</strong>
            <span>支付接口已待命</span>
          </div>
          <dl>
            <div><dt>支付</dt><dd>支付宝 / 微信 / USDT</dd></div>
            <div><dt>订单</dt><dd>后端落单，可查询</dd></div>
            <div><dt>售后</dt><dd>政策、隐私、条款完整保留</dd></div>
          </dl>
        </div>
      </div>
    </section>

    <section class="trust-strip-home" aria-label="服务优势">
      <div><strong>本地支付</strong><span>支付宝、微信支付、USDT 三条通道</span></div>
      <div><strong>订单回执</strong><span>订单号或联系方式都能查</span></div>
      <div><strong>规则透明</strong><span>交付、退款、质保边界提前说明</span></div>
      <div><strong>人工协助</strong><span>企业采购与售后可单独联系</span></div>
    </section>

    <section class="section-head" id="products">
      <h2>把套餐做成维度票据。</h2>
      <p>按使用强度选，不绕弯。价格、权益和售后边界都放在卡片里。</p>
    </section>
    <section class="product-grid">${chatgpt.map((item) => productCard(item)).join("")}</section>

    <section class="claude-module" id="claude">
      <div class="claude-copy">
        <span class="eyebrow">Claude 订阅舱</span>
        <h2>Pro、Max 5X、Max 20X 单独成舱。</h2>
        <p>新增 Claude 订阅购买模块，沿用同一套订单、支付和售后链路。价格为本站服务价，官方价格和权益可能调整，请以下单前说明为准。</p>
      </div>
      <div class="claude-grid">${claude.map((item) => productCard(item)).join("")}</div>
    </section>

    <section class="route-map" aria-label="购买流程">
      <div class="route-card main">
        <h2>四步穿过支付虫洞。</h2>
        <p>下单流程保留后端订单、支付适配和状态回写，视觉换了，逻辑没动。</p>
      </div>
      <div class="route-card"><strong>选套餐</strong><span>ChatGPT、Claude、Codex 按需选择</span></div>
      <div class="route-card"><strong>留联系</strong><span>用于订单查询和售后核验</span></div>
      <div class="route-card"><strong>扫码付</strong><span>支付宝、微信支付或 USDT</span></div>
      <div class="route-card"><strong>等交付</strong><span>保存付款凭证，按订单处理</span></div>
    </section>

    <section class="support-showcase">
      <div>
        <h2>帮助中心改成一份实验手册。</h2>
        <p>常见问题、售后政策、隐私政策和服务条款都在同一个支持体系里。</p>
      </div>
      <div class="support-links">
        <a href="#/faq" data-route="/faq">常见问题<span>安全、价格、交付、接口说明</span></a>
        <a href="#/help" data-route="/help">售后政策<span>退款、补发、质保、争议处理</span></a>
        <a href="#/priv" data-route="/priv">隐私政策<span>数据最小化、支付数据与删除</span></a>
        <a href="#/tos" data-route="/tos">服务条款<span>服务边界、支付回调与免责声明</span></a>
      </div>
    </section>
  `;
}

function renderCheckout(id) {
  const product = products.find((item) => item.id === id) || products[0];
  state.selectedProduct = product;
  const discount = product.original - product.price;
  app.innerHTML = `
    <section class="checkout">
      <button class="back-btn" type="button" data-action="back-home">返回上一页</button>
      <div class="checkout-layout">
        <div class="checkout-info reveal">
          <div class="trust-strip"><span>异维票据</span><span>后端落单</span><span>支付回调预留</span></div>
          <h1>${product.name}</h1>
          <div class="checkout-price">${shortMoney(product.price)}<span>/月</span></div>
          <div class="feature-pills">${product.features.map((item) => `<span>${item}</span>`).join("")}</div>
          <article class="notice-card">
            <strong>订单进入后端</strong>
            <p>通过 Node 服务运行时，订单会写入 data/orders.json，并可从购买记录页查询。</p>
          </article>
          <article class="notice-card">
            <strong>支付接口适配</strong>
            <p>支付宝、微信支付默认 mock，配置商户参数后可替换为真实网关。</p>
          </article>
        </div>
        <form class="order-form reveal" id="orderForm">
          <label>
            <span>下单手机号或邮箱</span>
            <input name="contact" required minlength="8" placeholder="请输入至少 8 位手机号或邮箱" autocomplete="email" value="${state.contact}" />
          </label>
          <p>仅用于查询订单与售后联系，后端会保存到订单记录。</p>
          <details open>
            <summary>支付后如何进入交付流程？</summary>
            <ol>
              <li>提交联系方式，后端创建待支付订单。</li>
              <li>选择支付宝、微信或 USDT 获取支付二维码。</li>
              <li>支付回调或人工确认后进入交付队列。</li>
            </ol>
          </details>
          <div class="summary">
            <div><span>原价</span><del>${money(product.original)}</del></div>
            <div><span>限时特惠</span><strong>-${money(discount)}</strong></div>
            <div class="total"><span>实付金额</span><strong>${money(product.price)}</strong></div>
            <em>已优惠 ${money(discount)}</em>
          </div>
          <button class="primary-btn full" type="submit">创建订单 ${money(product.price)}</button>
        </form>
      </div>
    </section>
  `;
}

function renderPay() {
  const product = state.selectedProduct;
  const qr = state.paymentInfo?.qrCode || paymentQr(state.payment);
  app.innerHTML = `
    <section class="payment">
      <button class="back-btn" type="button" data-action="checkout">返回上一页</button>
      <div class="payment-panel reveal">
        <span class="eyebrow">Portal Gateway</span>
        <h2>扫码穿过支付门。</h2>
        <p>${state.paymentInfo?.mode === "live" ? "当前为真实网关返回" : "当前为 mock 演示二维码"}，请使用${paymentLabels[state.payment]}完成支付。</p>
        <div class="pay-tabs">
          ${Object.entries(paymentLabels).map(([key, label]) => `<button class="${state.payment === key ? "active" : ""}" type="button" data-pay="${key}">${label}</button>`).join("")}
        </div>
        <div class="qr-card">
          <h3>${paymentLabels[state.payment]}</h3>
          <img src="${qr}" alt="${paymentLabels[state.payment]}二维码" />
          <div class="pay-meta"><span>${product.name}</span><strong>${money(product.price)}</strong></div>
          <small>订单号：${state.lastOrder?.id || "尚未创建"}</small>
          ${state.paymentInfo?.qrPayload ? `<code class="qr-payload">${state.paymentInfo.qrPayload}</code><small>生产环境请将以上网关 code_url / qr_code 渲染为真实二维码。</small>` : ""}
        </div>
        <button class="primary-btn full" type="button" data-action="paid">我已完成支付</button>
      </div>
    </section>
  `;
}

function paymentQr(payment) {
  if (payment === "wechat") return "assets/qr-wechat.svg";
  if (payment === "usdt") return "assets/qr-usdt.svg";
  return "assets/qr-alipay.svg";
}

function renderSuccess() {
  const order = state.lastOrder || localOrders()[0];
  if (!order) return renderQuery();
  app.innerHTML = `
    <section class="success">
      <button class="back-btn" type="button" data-route="/">返回首页</button>
      <div class="success-card reveal">
        <span class="success-icon">✓</span>
        <h3>支付已提交，感谢您的购买!</h3>
        <p>订单已进入交付队列。请保存付款凭证；后端模式下可通过订单号或联系方式查询。</p>
        <button class="secondary-btn" type="button" data-action="support">发送截图给客服</button>
      </div>
      ${orderDetails(order)}
    </section>
  `;
}

function orderDetails(order) {
  return `
    <article class="order-details reveal">
      <h3>订单详情</h3>
      ${[
        ["订单编号", order.id],
        ["商品名称", order.productName],
        ["联系方式", order.contact],
        ["支付方式", paymentLabels[order.payment] || order.payment],
        ["下单时间", order.time],
        ["订单状态", order.status],
        ["支付总额", money(order.amount)],
      ].map(([key, value]) => `<div><span>${key}</span><strong>${value}</strong></div>`).join("")}
      <button type="button" data-copy="${order.id}">复制订单号</button>
    </article>
  `;
}

async function renderQuery() {
  app.innerHTML = `
    <section class="query-page">
      <div class="query-hero reveal">
        <span class="eyebrow">Order Radar</span>
        <h1>把订单从虫洞里捞出来。</h1>
        <p>通过 server.js 运行时，请求后端 /api/orders；直接打开文件时，查询本地演示订单。</p>
        <form class="query-form" id="queryForm">
          <input name="keyword" placeholder="请输入订单号或联系方式..." />
          <button type="submit">立即查询</button>
        </form>
      </div>
      <div id="queryResult" class="query-results"><p class="empty">正在读取订单...</p></div>
    </section>
  `;
  await loadOrders("");
}

async function loadOrders(keyword) {
  const result = document.querySelector("#queryResult");
  try {
    const data = API_BASE ? await api(`/orders?keyword=${encodeURIComponent(keyword)}`) : { orders: localOrders() };
    const list = data.orders || [];
    result.innerHTML = list.length ? list.map(orderDetails).join("") : "<p class='empty'>没有找到匹配订单。你可以先选择套餐并完成一次下单。</p>";
  } catch (error) {
    result.innerHTML = `<p class="empty">${error.message}</p>`;
  }
}

function renderBlog() {
  app.innerHTML = `
    <section class="content-page">
      <button class="back-btn" type="button" data-route="/">返回首页</button>
      <span class="eyebrow">Signal Notes</span>
      <h1>补给站公告板</h1>
      <p>整理 ChatGPT 订阅、支付限制、账号安全与使用指南。</p>
      <div class="blog-list">
        ${blogPosts.map((post) => `
          <article class="blog-card reveal">
            <div>${post.date}<span>${post.author}</span></div>
            <h2>${post.title}</h2>
            <p>${post.intro}</p>
            <button type="button" data-blog="${post.title}">阅读全文</button>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderFaq() {
  app.innerHTML = `
    <section class="content-page support-page">
      <div class="support-hero">
        <span class="eyebrow">Support Manual</span>
        <h1>异维补给手册。</h1>
        <p>购买前最容易犹豫的事都在这里：安全、价格、交付、退款、订单查询和支付接口。</p>
      </div>
      <div class="support-layout">
        <aside class="support-nav">
          <strong>手册目录</strong>
          ${faqGroups.map((group) => `<a href="#${group.title}">${group.title}</a>`).join("")}
          <a href="#/help" data-route="/help">售后政策</a>
          <a href="#/priv" data-route="/priv">隐私政策</a>
          <a href="#/tos" data-route="/tos">服务条款</a>
        </aside>
        <div class="faq-list rich">
          ${faqGroups.map((group) => `
            <section id="${group.title}" class="faq-group reveal">
              <h2>${group.title}</h2>
              ${group.items.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}
            </section>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderPolicy(title, subtitle, body) {
  app.innerHTML = `
    <section class="content-page prose support-page">
      <div class="support-hero">
        <span class="eyebrow">${subtitle}</span>
        <h1>${title}</h1>
      </div>
      <div class="policy-shell reveal">${body}</div>
    </section>
  `;
}

function policySection(title, paragraphs, bullets = []) {
  return `
    <section class="policy-section">
      <h2>${title}</h2>
      ${paragraphs.map((text) => `<p>${text}</p>`).join("")}
      ${bullets.length ? `<ul>${bullets.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
    </section>
  `;
}

function supportPolicy() {
  return `
    <p class="effective">生效日期：2025年10月20日　最后更新：2026年06月24日</p>
    ${policySection("1. 服务说明", [
      "NEXAI20X 是独立第三方演示服务提供商，致力于提供 AI 账户充值、支付代办、账号交付与相关技术咨询流程展示。",
      "本服务与 OpenAI、ChatGPT、Anthropic、Claude 或其他模型提供商无官方隶属、授权、代理或合作关系；所有商标与服务权益归原权利人所有。",
    ], [
      "服务性质包括支付代办、虚拟商品交付、订单查询和售后协助。",
      "平台不保证 AI 官方服务在任何地区、任何账号、任何网络环境下持续可用。",
      "页面价格、套餐、权益会根据渠道成本、汇率、库存和上游政策变化调整。",
    ])}
    ${policySection("2. 交付范围与时效", [
      "订单支付成功后进入交付队列。自动回调成功的订单会由系统标记为已支付待交付；人工核验订单需要用户提供付款截图或交易凭证。",
      "常规订单通常在较短时间内处理；大额订单、企业采购、账号异常、官方风控或高峰期可能延长交付时间。",
    ], [
      "成品账号类商品以账号、密码、绑定信息或使用说明为交付内容。",
      "充值类商品以订阅状态升级、卡密、激活码或人工确认记录为交付内容。",
      "企业采购可提供批量清单、交付确认表和收款凭证。",
    ])}
    ${policySection("3. 账户与安全责任", [
      "用户应妥善保管平台交付的账号、卡密、激活码、订单号和付款凭证，不应转借、转售或公开传播。",
      "因用户泄露密码、共享账号、频繁异常登录、违反官方平台规则、使用高风险网络环境造成的封禁、限制或损失，不属于平台可控责任。",
    ], [
      "不要通过聊天窗口发送支付密码、银行卡号、验证码、二次验证代码等敏感信息。",
      "如需要协助登录，应优先选择临时凭证、远程协助或其他更安全方式。",
      "收到交付信息后建议在 24 小时内核验并反馈问题。",
    ])}
    ${policySection("4. 退款、补发与更换", [
      "虚拟商品具有即时交付和可复制特性，一旦交付原则上不支持无理由退款。平台会优先通过补发、更换、重新处理或使用指导解决问题。",
      "若支付成功但平台确认无法完成服务，或交付内容在首次使用前被核验为无效，可申请退款或补发。",
    ], [
      "可退款：重复支付、未交付且无法履约、金额错误且未开始交付。",
      "可补发：首次核验无效、交付信息错误、可控渠道问题导致无法使用。",
      "不可退款：用户原因导致封禁、已使用后反悔、违反平台规则、恶意争议或伪造凭证。",
    ])}
    ${policySection("5. 质保范围", [
      "质保服务覆盖有效期内的可控交付问题，包括交付信息错误、卡密首次不可用、订单状态异常、客服核验后的可替代问题。",
      "质保不等同于官方订阅保证，也不覆盖官方政策调整、大规模风控、不可抗力、用户违规使用或第三方平台故障。",
    ])}
    ${policySection("6. 支付异常与争议处理", [
      "支付异常请提供订单号、支付方式、支付时间、付款截图和联系方式。后端订单会保留状态变化，便于客服按订单号追踪。",
      "如发生争议，双方应优先依据订单记录、支付网关回调、聊天记录和交付日志协商处理。",
    ])}
    ${policySection("7. 联系方式", [
      "如对售后政策有疑问，或需要人工协助，请通过页面右下角客服入口联系。企业订单可使用企业采购二维码联系专属客服。",
    ])}
  `;
}

function privacyPolicy() {
  return `
    <p class="effective">生效日期：2025年10月20日　最后更新：2026年06月24日</p>
    ${policySection("1. 我们收集的信息", [
      "为了创建订单、核对支付、交付商品和提供售后，我们遵循最小化原则，仅收集完成交易所需的信息。",
    ], [
      "订单信息：订单号、商品名称、金额、支付方式、订单状态、创建与更新时间。",
      "联系方式：用户主动填写的手机号、邮箱或用于售后的联系方式。",
      "支付信息：支付网关返回的交易号、回调状态、金额核验结果；不保存银行卡号、支付密码或完整敏感凭证。",
      "安全日志：访问时间、基础请求信息、错误日志，用于排查异常和防止恶意请求。",
    ])}
    ${policySection("2. 信息的使用", [
      "我们使用上述信息处理订单、生成支付二维码、核验支付回调、交付虚拟商品、提供售后和改善页面体验。",
      "联系方式仅用于订单查询、异常通知、售后沟通和企业采购联系，不用于无关营销轰炸。",
    ])}
    ${policySection("3. 支付数据与第三方共享", [
      "接入支付宝、微信支付或其他支付渠道时，必要的订单号、金额、商品描述和回调地址会发送至对应支付网关。",
      "我们不会出售用户个人信息。除支付处理、法律要求、安全风控、用户授权外，不向无关第三方共享个人数据。",
    ])}
    ${policySection("4. Cookie、本地存储与后端存储", [
      "前端可能使用 localStorage 保存演示订单，便于直接打开静态页面时体验查询流程。通过后端服务运行时，订单会写入服务器 data/orders.json。",
      "你可以清理浏览器数据删除本地记录；服务器记录需由站点管理员按订单管理规则处理。",
    ])}
    ${policySection("5. 数据保留与删除", [
      "订单数据会在满足交易核验、售后质保、财务对账和争议处理所需期间内保留。超过必要期限后，应做删除、匿名化或归档处理。",
    ], [
      "普通订单建议至少保留至质保期结束后的一段合理对账期。",
      "无效、取消或测试订单可由管理员定期清理。",
      "用户可通过客服请求更正联系方式或删除非必要信息，但财务与风控所需记录可能依法保留。",
    ])}
    ${policySection("6. 安全措施", [
      "真实上线时应启用 HTTPS、服务端输入校验、支付回调验签、最小权限文件读写、日志脱敏、后台访问控制和密钥环境变量管理。",
      "不要把支付宝私钥、微信商户 API 证书、AppSecret 等敏感配置写入前端代码或公开仓库。",
    ])}
    ${policySection("7. 政策更新", [
      "我们可能根据业务、法规或支付渠道要求更新隐私政策。重大变更应在页面显著位置提示。",
    ])}
  `;
}

function termsPolicy() {
  return `
    <p class="effective">生效日期：2025年10月20日　最后更新：2026年06月24日</p>
    ${policySection("1. 接受条款", [
      "访问、浏览、下单或使用本网站功能，即表示你已阅读并同意本服务条款、隐私政策与售后政策。如果你不同意任何条款，请停止使用本服务。",
    ])}
    ${policySection("2. 服务性质", [
      "NEXAI20X 为独立第三方服务演示站，提供 AI 账户充值、支付代办、虚拟商品交付、订单查询与客服协助等流程展示。",
      "本服务不是 OpenAI、ChatGPT、Anthropic 或其他官方平台，不代表官方承诺、价格、权益或可用性。",
    ])}
    ${policySection("3. 用户义务", [
      "用户应提供真实、可联系的订单信息，保证支付凭证和售后材料真实有效，并遵守所在地法律法规及相关官方平台规则。",
    ], [
      "不得利用购买的账号、卡密或服务从事欺诈、攻击、滥发、侵权、违法内容生成等活动。",
      "不得恶意下单、恶意拒付、伪造付款截图或滥用售后政策。",
      "不得转售、批量共享或公开传播平台交付内容，除非购买时明确允许。",
    ])}
    ${policySection("4. 价格、库存与订单", [
      "商品价格、库存、套餐名称和交付方式可能根据渠道、成本、汇率和上游政策变化。订单提交不代表一定完成交付，只有支付成功并通过核验后才进入交付流程。",
      "平台有权拒绝异常订单，包括但不限于金额异常、风控命中、联系方式无效、疑似欺诈或违反服务条款的订单。",
    ])}
    ${policySection("5. 支付与回调", [
      "接入真实微信支付、支付宝支付时，订单状态以支付网关回调、服务端验签和金额校验为准。用户应确保支付金额、订单号和付款账户信息准确。",
      "因第三方支付平台、银行、网络、风控或用户操作造成的延迟，平台会协助核验，但不承担超出订单金额的间接损失。",
    ])}
    ${policySection("6. 售后与退款", [
      "售后与退款规则以售后政策为准。虚拟商品因其特殊性，一旦交付原则上不支持无理由退款。可控问题优先补发、更换或重新处理。",
    ])}
    ${policySection("7. 免责声明", [
      "AI 官方服务可能因政策、地区、账号状态、网络环境或不可抗力发生中断、封禁、降级或功能变化。平台会尽力协助，但不承诺官方服务永久稳定。",
      "页面中的演示二维码、mock 支付、测试订单不构成真实交易承诺。接入真实商户参数前，请完成合法资质、支付渠道审核和安全评估。",
    ])}
    ${policySection("8. 条款变更与联系", [
      "我们可根据业务与法律要求更新条款。继续使用服务视为接受更新后的条款。如有问题，请通过客服入口联系。",
    ])}
  `;
}

function openCodex() {
  modalContent.innerHTML = `
    <span class="eyebrow">Codex Service</span>
    <h2 id="modalTitle">Codex 充值</h2>
    <p>为代码任务准备的高频额度包，包含 Agent 编程、仓库理解、补丁生成与企业微信优先支持。</p>
    <div class="modal-products">
      ${products.filter((item) => item.type === "codex").map((item) => productCard(item, true)).join("")}
    </div>
  `;
  showModal();
}

function openClaude() {
  modalContent.innerHTML = `
    <span class="eyebrow">Claude Service</span>
    <h2 id="modalTitle">Claude 订阅购买</h2>
    <p>提供 Claude Pro、Claude Max 5X 和 Claude Max 20X 订阅购买入口。本站为第三方服务页面，非 Anthropic 官方渠道。</p>
    <div class="modal-products">
      ${products.filter((item) => item.type === "claude").map((item) => productCard(item, true)).join("")}
    </div>
  `;
  showModal();
}

function openSupport() {
  modalContent.innerHTML = `
    <h2 id="modalTitle">联系客服</h2>
    <p>截图付款凭证和订单号发给客服，可更快核验订单。企业采购请使用右侧入口。</p>
    <div class="support-modal-grid">
      <div><img src="assets/qr-support.svg" alt="客服二维码" /><strong>售后客服</strong><span>订单、退款、补发</span></div>
      <div><img src="assets/qr-sales.svg" alt="企业采购二维码" /><strong>企业采购</strong><span>批量、收据、对公</span></div>
    </div>
  `;
  showModal();
}

function showModal() {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

async function createOrder(contact) {
  const payload = {
    productId: state.selectedProduct.id,
    productName: state.selectedProduct.name,
    amount: state.selectedProduct.price,
    contact,
    payment: state.payment,
  };
  if (!API_BASE) {
    const order = {
      id: localOrderId(),
      ...payload,
      time: formatTime(),
      status: "待支付（本地演示）",
    };
    saveLocalOrder(order);
    return { order };
  }
  return api("/orders", { method: "POST", body: JSON.stringify(payload) });
}

async function createPayment(orderId, payment) {
  if (!API_BASE) return { payment: { mode: "mock", qrCode: paymentQr(payment) } };
  return api("/payments/create", {
    method: "POST",
    body: JSON.stringify({ orderId, provider: payment }),
  });
}

async function markPaid(orderId) {
  if (!API_BASE) {
    const updated = { ...state.lastOrder, status: "支付已提交，待人工交付", payment: state.payment };
    state.lastOrder = updated;
    saveLocalOrder(updated);
    return { order: updated };
  }
  return api(`/orders/${encodeURIComponent(orderId)}/mark-paid`, { method: "POST" });
}

document.addEventListener("click", async (event) => {
  const route = event.target.closest("[data-route]");
  if (route) {
    event.preventDefault();
    routeTo(route.dataset.route);
    closeModal();
    return;
  }

  const buy = event.target.closest("[data-buy]");
  if (buy) {
    closeModal();
    routeTo(`/checkout/${buy.dataset.buy}`);
    return;
  }

  const pay = event.target.closest("[data-pay]");
  if (pay) {
    state.payment = pay.dataset.pay;
    try {
      if (state.lastOrder?.id) {
        const data = await createPayment(state.lastOrder.id, state.payment);
        state.paymentInfo = data.payment;
      }
    } catch (error) {
      toastMessage(error.message);
    }
    renderPay();
    return;
  }

  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;

  if (action === "codex") openCodex();
  if (action === "claude") openClaude();
  if (action === "support") openSupport();
  if (action === "close-modal") closeModal();
  if (action === "language") {
    state.lang = state.lang === "ZH" ? "EN" : "ZH";
    document.querySelector(".lang-chip").textContent = state.lang;
    toastMessage(state.lang === "ZH" ? "已切换为中文" : "Language switched to English");
  }
  if (action === "menu") {
    mobileMenu.classList.toggle("open");
    mobileMenu.setAttribute("aria-hidden", String(!mobileMenu.classList.contains("open")));
  }
  if (action === "scroll-products") document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
  if (action === "scroll-claude") document.querySelector("#claude")?.scrollIntoView({ behavior: "smooth" });
  if (action === "back-home") routeTo("/");
  if (action === "checkout") routeTo(`/checkout/${state.selectedProduct.id}`);
  if (action === "paid") {
    if (!state.lastOrder?.id) return toastMessage("请先创建订单。");
    app.innerHTML = `<section class="loading-state"><span></span><p>正在验证支付状态...</p></section>`;
    try {
      const data = await markPaid(state.lastOrder.id);
      state.lastOrder = data.order;
      routeTo("/success");
    } catch (error) {
      toastMessage(error.message);
      renderPay();
    }
  }
});

document.addEventListener("submit", async (event) => {
  if (event.target.id === "orderForm") {
    event.preventDefault();
    const button = event.target.querySelector("button[type='submit']");
    const form = new FormData(event.target);
    const contact = String(form.get("contact") || "").trim();
    if (contact.length < 8 || !/(@|\d{8,})/.test(contact)) {
      toastMessage("请输入至少 8 位手机号或有效邮箱。");
      return;
    }
    button.disabled = true;
    button.textContent = "正在创建订单...";
    try {
      state.contact = contact;
      const orderData = await createOrder(contact);
      state.lastOrder = orderData.order;
      const paymentData = await createPayment(orderData.order.id, state.payment);
      state.paymentInfo = paymentData.payment;
      routeTo("/pay");
    } catch (error) {
      toastMessage(error.message);
      button.disabled = false;
      button.textContent = `创建订单 ${money(state.selectedProduct.price)}`;
    }
  }

  if (event.target.id === "queryForm") {
    event.preventDefault();
    const keyword = String(new FormData(event.target).get("keyword") || "").trim();
    await loadOrders(keyword);
  }
});

document.addEventListener("click", (event) => {
  const copy = event.target.closest("[data-copy]");
  if (!copy) return;
  navigator.clipboard?.writeText(copy.dataset.copy);
  toastMessage("订单号已复制。");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

window.addEventListener("hashchange", render);
render();
