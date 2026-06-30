const API_BASE = "/api";
const sessionKey = "nexai20x-admin-session";

const state = {
  products: [],
  orders: [],
  content: [],
  siteConfig: null,
  visitors: { total: 0, today: 0, history: [] },
  session: localStorage.getItem(sessionKey) || "",
  productPage: 1,
  productsPerPage: 3,
  uploadTarget: "",
};

const statsGrid = document.querySelector("#statsGrid");
const miniBars = document.querySelector("#miniBars");
const incomeList = document.querySelector("#incomeList");
const visitorChart = document.querySelector("#visitorChart");
const visitorTotal = document.querySelector("#visitorTotal");
const visitorToday = document.querySelector("#visitorToday");
const productList = document.querySelector("#productList");
const productPager = document.querySelector("#productPager");
const orderList = document.querySelector("#orderList");
const contentList = document.querySelector("#contentList");
const contentForm = document.querySelector("#contentForm");
const siteConfigForm = document.querySelector("#siteConfigForm");
const loginShell = document.querySelector("#loginShell");
const loginForm = document.querySelector("#loginForm");
const adminLayout = document.querySelector("#adminLayout");
const toast = document.querySelector("#toast");
const sidebar = document.querySelector("#adminSidebar");
const globalSearch = document.querySelector("#globalSearch");
const adminSearch = document.querySelector(".admin-search");
const qrUploadInput = document.querySelector("#qrUploadInput");
const pageIds = ["overview", "orders", "products", "site-config", "content"];

function adminHeaders() {
  return {
    "Content-Type": "application/json",
    ...(state.session ? { "X-Admin-Session": state.session } : {}),
  };
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...adminHeaders(), ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    state.session = "";
    localStorage.removeItem(sessionKey);
    showLogin();
  }
  if (!response.ok) throw new Error(data.error || "接口请求失败");
  return data;
}

function showLogin() {
  if (loginShell) loginShell.hidden = false;
  if (adminLayout) adminLayout.hidden = true;
}

function showAdmin() {
  if (loginShell) loginShell.hidden = true;
  if (adminLayout) adminLayout.hidden = false;
}

function toastMessage(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function money(value) {
  return `¥${Number(value || 0).toFixed(2)}`;
}

function isPaidOrder(order) {
  const status = String(order.status || "");
  return status.includes("待交付") || status.includes("已支付") || status.includes("已交付");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentPage() {
  const page = window.location.hash.replace("#", "");
  return pageIds.includes(page) ? page : "overview";
}

function showPage(page = getCurrentPage()) {
  const current = pageIds.includes(page) ? page : "overview";
  document.querySelectorAll("[data-page]").forEach((section) => {
    section.hidden = section.dataset.page !== current;
  });
  if (adminSearch) {
    adminSearch.hidden = current !== "orders";
  }
  document.querySelectorAll("[data-section-link]").forEach((link) => {
    link.classList.toggle("active", link.dataset.sectionLink === current);
  });
  if (!pageIds.includes(window.location.hash.replace("#", ""))) {
    history.replaceState(null, "", `#${current}`);
  }
  window.scrollTo({ top: 0, behavior: "auto" });
}

function navigatePage(page) {
  if (!pageIds.includes(page)) return;
  if (window.location.hash === `#${page}`) {
    showPage(page);
    return;
  }
  window.location.hash = page;
}

async function loadOverview() {
  const data = await api("/admin/overview");
  state.products = data.products || [];
  state.orders = data.orders || [];
  state.content = data.content || [];
  state.siteConfig = data.siteConfig || null;
  state.visitors = data.visitors || { total: 0, today: 0, history: [] };
  render();
}

function render() {
  renderStats();
  renderDashboard();
  renderVisitors();
  renderProducts();
  renderOrders();
  renderSiteConfig();
  renderContent();
}

function renderStats() {
  const paid = state.orders.filter(isPaidOrder).length;
  const published = state.content.filter((item) => item.status === "published").length;
  const revenue = state.orders.filter(isPaidOrder).reduce((sum, order) => sum + Number(order.amount || 0), 0);
  statsGrid.innerHTML = [
    ["商品数", state.products.length, "品", "前台可购买套餐"],
    ["订单数", state.orders.length, "单", `已支付/交付 ${paid} 单`],
    ["收入", money(revenue), "¥", "来自已支付或已交付订单"],
    ["访客", state.visitors.total || 0, "访", `今日 ${state.visitors.today || 0} 次访问`],
  ].map(([label, value, icon, hint]) => `
    <article class="stat-card">
      <header><span>${label}</span><em>${icon}</em></header>
      <strong>${value}</strong>
      <small>${hint}</small>
    </article>
  `).join("");
}

function renderDashboard() {
  if (!miniBars || !incomeList) return;
  const recent = state.orders.slice(0, 7).reverse();
  const maxAmount = Math.max(...recent.map((order) => Number(order.amount || 0)), 1);
  miniBars.innerHTML = recent.length ? recent.map((order) => {
    const height = Math.max(18, Math.round((Number(order.amount || 0) / maxAmount) * 105));
    const label = String(order.time || order.createdAt || order.id || "").slice(5, 10) || "订单";
    return `
      <div class="mini-bar" title="${order.id}">
        <i style="height:${height}px"></i>
        <span>${label}</span>
      </div>
    `;
  }).join("") : '<p class="empty">暂无订单趋势。</p>';

  const paidOrders = state.orders.filter(isPaidOrder);
  const paidAmount = paidOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const pendingAmount = state.orders
    .filter((order) => !isPaidOrder(order))
    .reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const average = paidOrders.length ? paidAmount / paidOrders.length : 0;
  incomeList.innerHTML = [
    ["已确认收入", money(paidAmount)],
    ["待确认金额", money(pendingAmount)],
    ["平均客单价", money(average)],
  ].map(([label, value]) => `
    <div class="income-item">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function renderVisitors() {
  if (!visitorChart || !visitorTotal || !visitorToday) return;
  const history = Array.isArray(state.visitors.history) ? state.visitors.history : [];
  const width = 680;
  const height = 150;
  const pad = 22;
  const max = Math.max(...history.map((item) => Number(item.count || 0)), 1);
  const points = history.map((item, index) => {
    const x = history.length <= 1 ? width / 2 : pad + (index * (width - pad * 2)) / (history.length - 1);
    const y = height - pad - (Number(item.count || 0) / max) * (height - pad * 2);
    return { ...item, x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");

  visitorTotal.textContent = state.visitors.total || 0;
  visitorToday.textContent = `今日 ${state.visitors.today || 0}`;
  visitorChart.innerHTML = history.length ? `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="访客历史曲线图">
      <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" />
      <polyline points="${line}" />
      ${points.map((point) => `
        <g>
          <circle cx="${point.x}" cy="${point.y}" r="5" />
          <text x="${point.x}" y="${point.y - 10}">${point.count}</text>
        </g>
      `).join("")}
    </svg>
    <div class="visitor-axis">
      ${history.map((item) => `<span>${String(item.date).slice(5)}</span>`).join("")}
    </div>
  ` : '<p class="empty">暂无访客数据。</p>';
}

function renderProducts() {
  const totalPages = Math.max(1, Math.ceil(state.products.length / state.productsPerPage));
  state.productPage = Math.min(Math.max(1, state.productPage), totalPages);
  const start = (state.productPage - 1) * state.productsPerPage;
  const pageProducts = state.products.slice(start, start + state.productsPerPage);

  productList.innerHTML = pageProducts.map((product) => `
    <form class="product-card ${product.featured ? "featured" : ""}" data-product-form="${product.id}">
      <div class="badge-row">
        <span class="badge">${product.type}</span>
        <span class="badge">${product.tag}</span>
        ${product.featured ? '<span class="badge">推荐</span>' : ""}
      </div>
      <h2>${product.name}</h2>
      <div class="field-grid">
        <label><span>现价</span><input name="price" type="number" min="0" step="0.01" value="${product.price}" /></label>
        <label><span>原价</span><input name="original" type="number" min="0" step="0.01" value="${product.original || product.price}" /></label>
      </div>
      <label><span>商品名称</span><input name="name" value="${product.name}" /></label>
      <label><span>描述</span><textarea name="desc" rows="3">${product.desc || ""}</textarea></label>
      <label><span>权益，每行一条</span><textarea name="features" rows="4">${(product.features || []).join("\n")}</textarea></label>
      <button type="submit">保存价格与文案</button>
    </form>
  `).join("");

  if (!productPager) return;
  productPager.innerHTML = `
    ${state.productPage > 1 ? '<button type="button" data-product-page="prev">上一页</button>' : ""}
    <span>第 ${state.productPage} / ${totalPages} 页，共 ${state.products.length} 个商品</span>
    ${state.productPage < totalPages ? '<button type="button" data-product-page="next">下一页</button>' : ""}
  `;
}

function renderOrders() {
  orderList.innerHTML = state.orders.length ? `
    <div class="order-table">
      <div class="order-row head">
        <span>订单号</span>
        <span>时间</span>
        <span>客户</span>
        <span>金额</span>
        <span>状态</span>
        <span>操作</span>
      </div>
      ${state.orders.map((order) => `
        <article class="order-row" data-order="${order.id}">
          <strong>${order.id}</strong>
          <span>${order.time || order.createdAt || "-"}</span>
          <span>${order.contact || "-"}<br />${order.productName || "-"}</span>
          <strong>${money(order.amount)}</strong>
          <span class="status-pill ${isPaidOrder(order) ? "done" : ""}">${order.status || "-"}</span>
          <div class="order-actions">
            <select name="status">
              ${["待支付", "待交付", "已交付", "已退款", "已取消"].map((status) => `<option value="${status}" ${order.status === status ? "selected" : ""}>${status}</option>`).join("")}
            </select>
            <input name="note" placeholder="备注" value="${order.adminNote || ""}" />
            <button type="button" data-update-order="${order.id}">更新</button>
          </div>
        </article>
      `).join("")}
    </div>
  ` : '<p class="empty">没有找到订单。</p>';
}

function renderContent() {
  contentList.innerHTML = state.content.length ? state.content.map((item) => `
    <article class="content-card">
      <div class="badge-row">
        <span class="badge ${item.type === "podcast" ? "podcast" : ""}">${item.type === "podcast" ? "播客" : "新闻"}</span>
        <span class="badge">${item.status === "published" ? "已发布" : "草稿"}</span>
        <span class="badge">${item.date || ""}</span>
      </div>
      <h2>${item.title}</h2>
      <p>${item.intro}</p>
      <div class="content-actions">
        <button type="button" data-edit-content="${item.id}">编辑</button>
      </div>
    </article>
  `).join("") : '<p class="empty">还没有新闻或播客内容。</p>';
}

function renderSiteConfig() {
  if (!siteConfigForm || !state.siteConfig) return;
  const { paymentQrs = {}, contacts = {} } = state.siteConfig;
  siteConfigForm.elements.alipayQr.value = paymentQrs.alipay || "";
  siteConfigForm.elements.wechatQr.value = paymentQrs.wechat || "";
  siteConfigForm.elements.usdtQr.value = paymentQrs.usdt || "";
  siteConfigForm.elements.supportQr.value = contacts.supportQr || "";
  siteConfigForm.elements.salesQr.value = contacts.salesQr || "";
  siteConfigForm.elements.supportLabel.value = contacts.supportLabel || "";
  siteConfigForm.elements.salesLabel.value = contacts.salesLabel || "";
  siteConfigForm.elements.supportText.value = contacts.supportText || "";
}

document.querySelector("#reloadBtn").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  button.classList.add("is-spinning");
  try {
    await loadOverview();
    toastMessage("数据已刷新");
  } catch (error) {
    toastMessage(error.message);
  } finally {
    button.disabled = false;
    button.classList.remove("is-spinning");
  }
});

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = loginForm.querySelector("button[type='submit']");
    const form = new FormData(loginForm);
    button.disabled = true;
    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: String(form.get("username") || "").trim(),
          password: String(form.get("password") || ""),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "登录失败");
      state.session = data.session || "";
      localStorage.setItem(sessionKey, state.session);
      loginForm.reset();
      showAdmin();
      showPage();
      await loadOverview();
      toastMessage("登录成功");
    } catch (error) {
      toastMessage(error.message);
    } finally {
      button.disabled = false;
    }
  });
}

if (globalSearch) {
  globalSearch.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;
    const keyword = globalSearch.value.trim();
    try {
      const data = await api(`/admin/orders?keyword=${encodeURIComponent(keyword)}`);
      state.orders = data.orders || [];
      renderStats();
      renderDashboard();
      renderOrders();
      navigatePage("orders");
    } catch (error) {
      toastMessage(error.message);
    }
  });
}

document.addEventListener("submit", async (event) => {
  const productForm = event.target.closest("[data-product-form]");
  if (productForm) {
    event.preventDefault();
    const button = productForm.querySelector("button[type='submit']");
    const form = new FormData(productForm);
    button.disabled = true;
    try {
      const data = await api(`/admin/products/${encodeURIComponent(productForm.dataset.productForm)}`, {
        method: "PATCH",
        body: JSON.stringify({
          price: Number(form.get("price")),
          original: Number(form.get("original")),
          name: String(form.get("name") || ""),
          desc: String(form.get("desc") || ""),
          features: String(form.get("features") || "").split(/\r?\n/),
        }),
      });
      state.products = state.products.map((item) => item.id === data.product.id ? data.product : item);
      renderProducts();
      toastMessage("商品已保存，前台价格已同步。");
    } catch (error) {
      toastMessage(error.message);
    } finally {
      button.disabled = false;
    }
    return;
  }

  if (event.target.id === "orderSearchForm") {
    event.preventDefault();
    const keyword = String(new FormData(event.target).get("keyword") || "").trim();
    try {
      const data = await api(`/admin/orders?keyword=${encodeURIComponent(keyword)}`);
      state.orders = data.orders || [];
      renderStats();
      renderDashboard();
      renderOrders();
    } catch (error) {
      toastMessage(error.message);
    }
    return;
  }

  if (event.target.id === "contentForm") {
    event.preventDefault();
    const button = event.target.querySelector("button[type='submit']");
    const form = new FormData(event.target);
    const contentId = String(form.get("id") || "").trim();
    const existingItem = state.content.find((item) => item.id === contentId);
    button.disabled = true;
    try {
      const data = await api("/admin/content", {
        method: "POST",
        body: JSON.stringify({
          ...Object.fromEntries(form.entries()),
          status: existingItem?.status || "published",
          date: existingItem?.date || today(),
        }),
      });
      const existing = state.content.findIndex((item) => item.id === data.item.id);
      if (existing === -1) state.content.unshift(data.item);
      else state.content[existing] = data.item;
      event.target.reset();
      event.target.elements.type.value = "news";
      event.target.querySelector("button[type='submit']").textContent = "发布内容";
      renderStats();
      renderContent();
      toastMessage("内容已保存，前台新闻博客已同步。");
    } catch (error) {
      toastMessage(error.message);
    } finally {
      button.disabled = false;
    }
  }

  if (event.target.id === "siteConfigForm") {
    event.preventDefault();
    const button = event.target.querySelector("button[type='submit']");
    const form = new FormData(event.target);
    button.disabled = true;
    try {
      const data = await api("/admin/site-config", {
        method: "PATCH",
        body: JSON.stringify({
          paymentQrs: {
            alipay: form.get("alipayQr"),
            wechat: form.get("wechatQr"),
            usdt: form.get("usdtQr"),
          },
          contacts: {
            supportQr: form.get("supportQr"),
            salesQr: form.get("salesQr"),
            supportLabel: form.get("supportLabel"),
            salesLabel: form.get("salesLabel"),
            supportText: form.get("supportText"),
          },
        }),
      });
      state.siteConfig = data.config;
      renderSiteConfig();
      toastMessage("收款码及联系方式已保存。");
    } catch (error) {
      toastMessage(error.message);
    } finally {
      button.disabled = false;
    }
  }
});

document.addEventListener("click", async (event) => {
  const uploadButton = event.target.closest("[data-upload-target]");
  if (uploadButton) {
    state.uploadTarget = uploadButton.dataset.uploadTarget;
    if (qrUploadInput) {
      qrUploadInput.value = "";
      qrUploadInput.click();
    }
    return;
  }

  const productPageButton = event.target.closest("[data-product-page]");
  if (productPageButton) {
    const direction = productPageButton.dataset.productPage;
    const totalPages = Math.max(1, Math.ceil(state.products.length / state.productsPerPage));
    if (direction === "prev") state.productPage = Math.max(1, state.productPage - 1);
    if (direction === "next") state.productPage = Math.min(totalPages, state.productPage + 1);
    renderProducts();
    return;
  }

  const updateOrder = event.target.closest("[data-update-order]");
  if (updateOrder) {
    const card = updateOrder.closest("[data-order]");
    const status = card.querySelector("[name='status']").value;
    const note = card.querySelector("[name='note']").value;
    updateOrder.disabled = true;
    try {
      const data = await api(`/admin/orders/${encodeURIComponent(updateOrder.dataset.updateOrder)}`, {
        method: "PATCH",
        body: JSON.stringify({ status, note }),
      });
      state.orders = state.orders.map((order) => order.id === data.order.id ? { ...order, ...data.order, adminNote: note } : order);
      renderStats();
      renderDashboard();
      renderOrders();
      toastMessage("订单状态已更新。");
    } catch (error) {
      toastMessage(error.message);
    } finally {
      updateOrder.disabled = false;
    }
    return;
  }

  const editContent = event.target.closest("[data-edit-content]");
  if (editContent) {
    const item = state.content.find((entry) => entry.id === editContent.dataset.editContent);
    if (!item) return;
    for (const [key, value] of Object.entries(item)) {
      if (contentForm.elements[key]) contentForm.elements[key].value = value || "";
    }
    contentForm.querySelector("button[type='submit']").textContent = "保存内容";
    navigatePage("content");
  }

  const sectionLink = event.target.closest("[data-section-link]");
  if (sectionLink) {
    event.preventDefault();
    navigatePage(sectionLink.dataset.sectionLink);
    if (window.matchMedia("(max-width: 820px)").matches) {
      sidebar.classList.remove("is-pinned");
    }
  }
});

if (qrUploadInput) {
  qrUploadInput.addEventListener("change", () => {
    const file = qrUploadInput.files?.[0];
    const target = state.uploadTarget;
    if (!file || !target || !siteConfigForm?.elements[target]) return;
    if (!file.type.startsWith("image/")) {
      toastMessage("请选择图片文件。");
      return;
    }
    if (file.size > 1024 * 1024) {
      toastMessage("图片不能超过 1MB。");
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      siteConfigForm.elements[target].value = String(reader.result || "");
      toastMessage("图片已填入，保存后生效。");
    });
    reader.addEventListener("error", () => toastMessage("图片读取失败，请重试。"));
    reader.readAsDataURL(file);
  });
}

async function initAdmin() {
  if (!state.session) {
    showLogin();
    return;
  }
  showAdmin();
  showPage();
  try {
    await loadOverview();
  } catch (error) {
    toastMessage(error.message);
  }
}

initAdmin();
window.addEventListener("hashchange", () => showPage());
