const API_BASE = window.location.protocol === "file:" ? "" : "/api";

let products = [
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
    features: ["GPT-5.5 / GPT-5.2 / GPT-5", "Images 2.0 图像生成", "轻度编程辅助", "每 3 小时 150 条消息"],
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
    features: ["消息额度 5 倍 Plus", "高强度编程辅助", "GPT-5.5 优先访问", "Images 2.0 完整功能"],
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

let blogPosts = [
  {
    id: "post-payment-2026",
    type: "news",
    status: "published",
    date: "2026-05-26",
    author: "NEXAI20X 官方博客",
    title: '2026 终极指南：解决 ChatGPT Plus "信用卡被拒" 与 "支付失败" 难题',
    intro: "订阅 ChatGPT Plus 时常见的卡片拒付、地区限制和页面异常原因，以及更稳妥的订阅准备方式。",
    body: "订阅失败通常与卡 BIN、账单地址、地区风控和支付环境有关。建议用户提前准备稳定网络、真实联系方式和可核验的支付凭证。",
  },
  {
    id: "post-risk-2026",
    type: "news",
    status: "published",
    date: "2026-05-18",
    author: "NEXAI20X 风控中心",
    title: "2026 避坑必看：常见低价共享号与黑卡代充风险",
    intro: "为什么明显低于市场价的共享号存在账号、隐私和售后风险，如何辨别可靠服务。",
    body: "明显低于市场价格的账号通常伴随共享登录、异常支付、售后不透明等问题。购买前应关注订单记录、交付边界、质保说明和退款条件。",
  },
  {
    id: "post-register-guide",
    type: "news",
    status: "published",
    date: "2026-05-12",
    author: "NEXAI20X 安全实验室",
    title: "零基础注册 ChatGPT 官方账号与安全使用指南",
    intro: "从账号注册、联系方式准备到日常登录习惯，梳理更适合长期使用的安全步骤。",
    body: "长期使用账号应优先保证邮箱、手机号和二次验证可控。不要多人共用主账号，不要频繁更换异常登录环境。",
  },
];

const defaultHelpContent = window.DEFAULT_HELP_CONTENT || {
  supportShowcase: {
    title: "帮助与支持",
    description: "",
    faqHint: "",
    helpHint: "",
    privacyHint: "",
    termsHint: "",
  },
  faq: {
    eyebrow: "Support Manual",
    title: "帮助与支持",
    description: "",
    navTitle: "目录",
    groups: [],
  },
  policies: {
    help: { title: "售后政策", subtitle: "售后政策", markdown: "" },
    priv: { title: "隐私政策", subtitle: "隐私政策", markdown: "" },
    tos: { title: "服务条款", subtitle: "服务条款", markdown: "" },
  },
  checkoutAgreement: "",
};

const state = {
  selectedProduct: products[0],
  contact: "",
  payment: "alipay",
  paymentInfo: null,
  lastOrder: null,
  lang: "ZH",
  aiStatuses: [
    { label: "ChatGPT", status: "loading" },
    { label: "Codex", status: "loading" },
    { label: "Claude.ai", status: "loading" },
    { label: "Claude Code", status: "loading" },
  ],
  siteConfig: {
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
  },
  helpContent: JSON.parse(JSON.stringify(defaultHelpContent)),
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function helpContent() {
  return state.helpContent || defaultHelpContent;
}

function normalizePolicy(policy, fallback) {
  const markdown = String(policy?.markdown || fallback.markdown || "");
  const title = String(policy?.title || fallback.title || "");
  const subtitle = String(policy?.subtitle || fallback.subtitle || title);
  return { title, subtitle, markdown };
}

function normalizeHelpContent(content) {
  const defaults = clone(defaultHelpContent);
  const source = content && typeof content === "object" ? content : {};
  return {
    supportShowcase: {
      ...defaults.supportShowcase,
      ...(source.supportShowcase || {}),
    },
    faq: {
      ...defaults.faq,
      ...(source.faq || {}),
      groups: Array.isArray(source.faq?.groups) ? source.faq.groups : defaults.faq.groups,
    },
    policies: {
      help: normalizePolicy(source.policies?.help, defaults.policies.help),
      priv: normalizePolicy(source.policies?.priv, defaults.policies.priv),
      tos: normalizePolicy(source.policies?.tos, defaults.policies.tos),
    },
    checkoutAgreement: String(source.checkoutAgreement || defaults.checkoutAgreement || ""),
  };
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

function formatInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function extractMarkdownMeta(markdown) {
  const lines = String(markdown || "").split(/\r?\n/);
  const meta = [];
  while (lines.length && /^((生效日期|最后更新)：)/.test(lines[0].trim())) {
    meta.push(lines.shift().trim());
  }
  while (lines.length && !lines[0].trim()) lines.shift();
  return {
    meta: meta.join("　"),
    body: lines.join("\n"),
  };
}

function renderMarkdown(markdown) {
  const lines = String(markdown || "").replace(/\r/g, "").split("\n");
  const blocks = [];
  let paragraph = [];
  let list = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${formatInlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!list.length) return;
    blocks.push(`<ul>${list.map((item) => `<li>${formatInlineMarkdown(item)}</li>`).join("")}</ul>`);
    list = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }
    if (/^##\s+/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push(`<h2 id="${policyAnchorId(trimmed.replace(/^##\s+/, ""))}">${formatInlineMarkdown(trimmed.replace(/^##\s+/, ""))}</h2>`);
      continue;
    }
    if (/^#\s+/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push(`<h1>${formatInlineMarkdown(trimmed.replace(/^#\s+/, ""))}</h1>`);
      continue;
    }
    if (/^- /.test(trimmed)) {
      flushParagraph();
      list.push(trimmed.replace(/^- /, ""));
      continue;
    }
    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  return blocks.join("");
}

async function loadPublicData() {
  if (!API_BASE) return;

  try {
    const [productData, contentData] = await Promise.all([
      api("/products"),
      api("/content"),
    ]);

    if (Array.isArray(productData.products) && productData.products.length) {
      products = productData.products;
      state.selectedProduct = products.find((item) => item.id === state.selectedProduct?.id) || products[0];
    }

    if (Array.isArray(contentData.content) && contentData.content.length) {
      blogPosts = contentData.content;
    }
  } catch (error) {
    toastMessage(`使用本地演示数据：${error.message}`);
  }
}

async function loadHelpContent() {
  if (!API_BASE) return;

  try {
    const data = await api("/help-content");
    if (data.helpContent) {
      state.helpContent = normalizeHelpContent(data.helpContent);
    }
  } catch (error) {
    toastMessage(`使用默认帮助内容：${error.message}`);
  }
}

async function loadSiteConfig() {
  if (!API_BASE) return;

  try {
    const data = await api("/site-config");
    if (data.config) {
      state.siteConfig = {
        paymentQrs: { ...state.siteConfig.paymentQrs, ...(data.config.paymentQrs || {}) },
        contacts: { ...state.siteConfig.contacts, ...(data.config.contacts || {}) },
      };
      updateStaticContactBlocks();
    }
  } catch (error) {
    toastMessage(`使用默认收款配置：${error.message}`);
  }
}

async function trackVisitor() {
  if (!API_BASE) return;
  try {
    await api("/visitors/track", { method: "POST" });
  } catch (error) {
    // Visitor stats should never block the storefront.
  }
}

function updateStaticContactBlocks() {
  const { contacts } = state.siteConfig;
  document.querySelectorAll("[data-contact-text]").forEach((node) => {
    node.textContent = contacts.supportText;
  });
  document.querySelectorAll("[data-contact-support-qr]").forEach((node) => {
    node.src = contacts.supportQr;
  });
  document.querySelectorAll("[data-contact-sales-qr]").forEach((node) => {
    node.src = contacts.salesQr;
  });
}

function productCard(product, compact = false) {
  return `
    <article class="product-card ${product.featured ? "featured" : ""} ${compact ? "compact" : ""}" style="--accent:${escapeHtml(product.accent || "#6cff3d")}">
      <div class="card-topline">
        <span class="tag">${escapeHtml(product.tag)}</span>
        ${product.featured ? "<span class='hot'>推荐选择</span>" : ""}
      </div>
      <h3>${escapeHtml(product.name)}</h3>
      <p>${escapeHtml(product.desc)}</p>
      <div class="price-line"><span>¥</span><strong>${product.price}</strong><em>${escapeHtml(product.period)}</em></div>
      <ul>${(product.features || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      <button type="button" data-buy="${product.id}">锁定套餐</button>
    </article>
  `;
}

function statusPercent(status) {
  const values = {
    operational: 100,
    degraded_performance: 65,
    partial_outage: 35,
    major_outage: 10,
    under_maintenance: 50,
    loading: 20,
    unknown: 0,
  };
  return values[status] ?? 0;
}

function renderAiStatusList() {
  return state.aiStatuses.map((item) => `
    <div class="ai-status-item" data-status="${escapeHtml(item.status)}" style="--status:${statusPercent(item.status)}%">
      <div class="ai-status-meta">
        <dt>${escapeHtml(item.label)}</dt>
        <dd>${statusPercent(item.status)}%</dd>
      </div>
      <div class="ai-status-track" aria-hidden="true">
        <span></span>
      </div>
    </div>
  `).join("");
}

async function refreshAiStatus() {
  if (!API_BASE) return;

  try {
    const data = await api("/ai-status");
    if (Array.isArray(data.services) && data.services.length) {
      state.aiStatuses = data.services;
      const list = document.querySelector("#aiStatusList");
      if (list) list.innerHTML = renderAiStatusList();
    }
  } catch (error) {
    state.aiStatuses = state.aiStatuses.map((item) => ({ ...item, status: "unknown" }));
    const list = document.querySelector("#aiStatusList");
    if (list) list.innerHTML = renderAiStatusList();
  }
}

function render() {
  const route = currentRoute();
  const policies = normalizeHelpContent(helpContent()).policies;
  mobileMenu.classList.remove("open");
  mobileMenu.setAttribute("aria-hidden", "true");

  if (route === "/query") return renderQuery();
  if (route === "/gpt") return renderGptService();
  if (route === "/blog") return renderBlog();
  if (route === "/faq") return renderFaq();
  if (route === "/help") return renderPolicy(policies.help.title, policies.help.subtitle, renderPolicyBody(policies.help));
  if (route === "/priv") return renderPolicy(policies.priv.title, policies.priv.subtitle, renderPolicyBody(policies.priv));
  if (route === "/tos") return renderPolicy(policies.tos.title, policies.tos.subtitle, renderPolicyBody(policies.tos));
  if (route.startsWith("/checkout/")) return renderCheckout(route.split("/").pop());
  if (route === "/pay") return renderPay();
  if (route === "/success") return renderSuccess();
  return renderHome();
}

function renderHome() {
  const chatgpt = products.filter((item) => item.type === "chatgpt");
  const claude = products.filter((item) => item.type === "claude");
  const support = helpContent().supportShowcase;
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
            <strong>AI 状态检测</strong>
            <span>实时监控</span>
          </div>
          <dl id="aiStatusList" class="ai-status-list">
            ${renderAiStatusList()}
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
        <h2>${escapeHtml(support.title)}</h2>
        <p>${escapeHtml(support.description)}</p>
      </div>
      <div class="support-links">
        <a href="#/faq" data-route="/faq">常见问题<span>${escapeHtml(support.faqHint)}</span></a>
        <a href="#/help" data-route="/help">售后政策<span>${escapeHtml(support.helpHint)}</span></a>
        <a href="#/priv" data-route="/priv">隐私政策<span>${escapeHtml(support.privacyHint)}</span></a>
        <a href="#/tos" data-route="/tos">服务条款<span>${escapeHtml(support.termsHint)}</span></a>
      </div>
    </section>
  `;
  refreshAiStatus();
}

function renderGptService() {
  const chatgpt = products.filter((item) => item.type === "chatgpt");
  app.innerHTML = `
    <section class="content-page gpt-service-page">
      <button class="back-btn" type="button" data-route="/">返回首页</button>
      <span class="eyebrow">GPT Recharge</span>
      <h1>gpt 充值服务</h1>
      <p>按使用强度选择 ChatGPT Plus / Pro 套餐。价格、权益和售后边界都放在卡片里。</p>
      <section class="product-grid gpt-product-grid">
        ${chatgpt.map((item) => productCard(item)).join("")}
      </section>
    </section>
  `;
}

function renderCheckout(id) {
  const product = products.find((item) => item.id === id) || products[0];
  state.selectedProduct = product;
  const discount = product.original - product.price;
  const agreement = helpContent().checkoutAgreement;
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
            <strong>查询订单</strong>
            <p>下单后可在购买记录页用订单号、手机号或邮箱查询订单状态。</p>
          </article>
          <article class="notice-card">
            <strong>支付方式有哪些</strong>
            <p>支持支付宝、微信支付和 USDT-BEP20，支付后请保留付款凭证。</p>
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
          <label class="agreement-checkbox">
            <input type="checkbox" name="agreement" required />
            <span>我已阅读并同意《用户须知与风险告知》、<a href="#/help" data-route="/help" target="_blank">《售后政策》</a>、<a href="#/priv" data-route="/priv" target="_blank">《隐私政策》</a>和<a href="#/tos" data-route="/tos" target="_blank">《服务条款》</a>，${escapeHtml(agreement)}</span>
          </label>
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
  if (payment === "wechat") return state.siteConfig.paymentQrs.wechat;
  if (payment === "usdt") return state.siteConfig.paymentQrs.usdt;
  return state.siteConfig.paymentQrs.alipay;
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
        <p>通过 server.js 运行时，可输入完整订单号或完整下单手机号/邮箱进行精确查询；直接打开文件时，查询本地演示订单。</p>
        <form class="query-form" id="queryForm">
          <input name="lookup" placeholder="请输入完整订单号或手机号/邮箱" />
          <button type="submit">立即查询</button>
        </form>
      </div>
      <div id="queryResult" class="query-results"><p class="empty">正在读取订单...</p></div>
    </section>
  `;
  await loadOrders();
}

async function loadOrders(lookup = "") {
  const result = document.querySelector("#queryResult");
  try {
    const data = API_BASE
      ? (lookup
          ? await api(`/orders?lookup=${encodeURIComponent(lookup)}`)
          : { orders: [] })
      : { orders: localOrders() };
    const list = data.orders || [];
    result.innerHTML = list.length ? list.map(orderDetails).join("") : "<p class='empty'>没有找到匹配订单。你可以先选择套餐并完成一次下单。</p>";
  } catch (error) {
    result.innerHTML = `<p class="empty">${error.message}</p>`;
  }
}

function renderBlog() {
  const posts = blogPosts.filter((post) => post.status !== "draft");
  app.innerHTML = `
    <section class="content-page">
      <button class="back-btn" type="button" data-route="/">返回首页</button>
      <span class="eyebrow">Signal Notes</span>
      <h1>新闻博客与播客</h1>
      <p>整理 ChatGPT 订阅、支付限制、账号安全、使用指南和音频播客。</p>
      <div class="blog-list">
        ${posts.map((post) => `
          <article class="blog-card reveal">
            <div>${escapeHtml(post.date)}<span>${escapeHtml(post.author)}</span><span>${post.type === "podcast" ? "播客" : "新闻"}</span></div>
            <h2>${escapeHtml(post.title)}</h2>
            <p>${escapeHtml(post.intro)}</p>
            <button type="button" data-blog="${escapeHtml(post.id || post.title)}">${post.type === "podcast" ? "查看播客" : "阅读全文"}</button>
          </article>
        `).join("") || '<p class="empty">暂无已发布内容。</p>'}
      </div>
    </section>
  `;
}

function openBlogPost(id) {
  const post = blogPosts.find((item) => String(item.id || item.title) === String(id));
  if (!post) return;

  modalContent.innerHTML = `
    <span class="eyebrow">${post.type === "podcast" ? "Podcast" : "News"}</span>
    <h2 id="modalTitle">${escapeHtml(post.title)}</h2>
    <p>${escapeHtml(post.intro)}</p>
    ${post.audioUrl ? `<audio controls src="${escapeHtml(post.audioUrl)}"></audio>` : ""}
    <div class="blog-body">
      ${escapeHtml(post.body || post.intro).split(/\n+/).map((text) => `<p>${text}</p>`).join("")}
    </div>
  `;
  showModal();
}

function renderFaq() {
  const faq = helpContent().faq;
  app.innerHTML = `
    <section class="content-page support-page">
      <div class="support-hero">
        <span class="eyebrow">${escapeHtml(faq.eyebrow)}</span>
        <h1>${escapeHtml(faq.title)}</h1>
        <p>${escapeHtml(faq.description)}</p>
      </div>
      <div class="support-layout">
        <aside class="support-nav">
          <strong>${escapeHtml(faq.navTitle)}</strong>
          ${faq.groups.map((group) => `<button class="support-nav-link" type="button" data-faq-anchor="${policyAnchorId(group.title)}">${escapeHtml(group.title)}</button>`).join("")}
          <a href="#/help" data-route="/help">售后政策</a>
          <a href="#/priv" data-route="/priv">隐私政策</a>
          <a href="#/tos" data-route="/tos">服务条款</a>
        </aside>
        <div class="faq-list rich">
          ${faq.groups.map((group) => `
            <section id="${policyAnchorId(group.title)}" class="faq-group reveal">
              <h2>${escapeHtml(group.title)}</h2>
              ${group.items.map((item) => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join("")}
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
        <span class="eyebrow">${escapeHtml(subtitle)}</span>
        <h1>${escapeHtml(title)}</h1>
      </div>
      <div class="policy-shell reveal">${body}</div>
    </section>
  `;
}

function policyAnchorId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function renderPolicyBody(policy) {
  const { meta, body } = extractMarkdownMeta(policy.markdown || "");
  return `
    ${meta ? `<p class="effective">${escapeHtml(meta)}</p>` : ""}
    <div class="markdown-body">${renderMarkdown(body)}</div>
  `;
}

function openCodex() {
  modalContent.innerHTML = `
    <span class="eyebrow">GPT Recharge</span>
    <h2 id="modalTitle">GPT 充值</h2>
    <p>按使用强度选择 ChatGPT Plus / Pro 套餐。价格、权益和售后边界都放在卡片里。</p>
    <div class="modal-products">
      ${products.filter((item) => item.type === "chatgpt").map((item) => productCard(item, true)).join("")}
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
  const { contacts } = state.siteConfig;
  modalContent.innerHTML = `
    <h2 id="modalTitle">联系客服</h2>
    <p>${escapeHtml(contacts.supportText)} 截图付款凭证和订单号发给客服，可更快核验订单。</p>
    <div class="support-modal-grid">
      <div><img src="${escapeHtml(contacts.supportQr)}" alt="客服二维码" /><strong>${escapeHtml(contacts.supportLabel)}</strong><span>订单、退款、补发</span></div>
      <div><img src="${escapeHtml(contacts.salesQr)}" alt="企业采购二维码" /><strong>${escapeHtml(contacts.salesLabel)}</strong><span>批量、收据、对公</span></div>
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
    body: JSON.stringify({ orderId, provider: payment, contact: state.contact }),
  });
}

async function markPaid(orderId) {
  if (!API_BASE) {
    const updated = { ...state.lastOrder, status: "待交付", payment: state.payment };
    state.lastOrder = updated;
    saveLocalOrder(updated);
    return { order: updated };
  }
  return api(`/orders/${encodeURIComponent(orderId)}/mark-paid`, {
    method: "POST",
    body: JSON.stringify({ contact: state.contact }),
  });
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

  const faqAnchor = event.target.closest("[data-faq-anchor]");
  if (faqAnchor) {
    const section = document.getElementById(faqAnchor.dataset.faqAnchor);
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
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

  const blog = event.target.closest("[data-blog]");
  if (blog) {
    openBlogPost(blog.dataset.blog);
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
    const lookup = String(new FormData(event.target).get("lookup") || "").trim();
    await loadOrders(lookup);
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
Promise.all([loadPublicData(), loadSiteConfig(), loadHelpContent(), trackVisitor()]).finally(render);
