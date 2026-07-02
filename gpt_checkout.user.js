// ==UserScript==
// @name         GPT 支付链接生成器
// @namespace    http://tampermonkey.net/
// @version      1.3.0
// @description  在 ChatGPT 页面生成各地区订阅支付链接（短链/长链）— Claude 美学
// @author       https://github.com/fangyuan99
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ─── 配置：所有套餐 ──────────────────────────────────────────────
  const PLANS = [
    {
      id: 'plus_ph',
      label: 'GPT Plus',
      tag: '菲律宾区',
      badge: '5x',
      plan_name: 'chatgptplusplan',
      country: 'PH',
      currency: 'PHP',
      hasLong: true,
    },
    {
      id: 'pro_eg',
      label: 'GPT Pro',
      tag: '埃及区',
      badge: '5x',
      plan_name: 'chatgptprolite',
      country: 'EG',
      currency: 'EGP',
      hasLong: false,
    },
    {
      id: 'pro_ph',
      label: 'GPT Pro',
      tag: '菲律宾区',
      badge: '20x',
      plan_name: 'chatgptpro',
      country: 'PH',
      currency: 'PHP',
      hasLong: true,
    },
  ];

  const PANEL_ID = '__gpt_checkout_panel__';
  const BTN_ID   = '__gpt_checkout_btn__';

  // ─── 工具：解析 Token ────────────────────────────────────────────
  function parseToken(raw) {
    if (!raw) return null;
    const s = raw.trim();
    try {
      const obj = JSON.parse(s);
      if (obj.accessToken) return obj.accessToken;
    } catch (_) {}
    const kv = s.match(/["']?accessToken["']?\s*:\s*["']?([A-Za-z0-9\-_\.]+)/);
    if (kv) return kv[1];
    if (/^eyJ/i.test(s)) return s;
    return null;
  }

  async function getToken(userRaw) {
    const manual = parseToken(userRaw);
    if (manual) return manual;
    const session = await fetch('/api/auth/session').then(r => r.json());
    if (!session.accessToken) throw new Error('未检测到登录状态，请先登录 ChatGPT');
    return session.accessToken;
  }

  async function generateLink(plan, mode, userToken) {
    const token = await getToken(userToken);
    const body = {
      entry_point: 'all_plans_pricing_modal',
      plan_name: plan.plan_name,
      billing_details: { country: plan.country, currency: plan.currency },
      checkout_ui_mode: mode === 'long' ? 'hosted' : 'custom',
    };
    const res = await fetch('https://chatgpt.com/backend-api/payments/checkout', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (mode === 'long') {
      const url =
        data.url ||
        data.stripe_hosted_url ||
        data.checkout_url ||
        (data.checkout_session_id
          ? 'https://chatgpt.com/checkout/openai_llc/' + data.checkout_session_id
          : null);
      if (!url) throw new Error(data.detail || JSON.stringify(data));
      return { url, mode: 'long' };
    } else {
      if (!data.checkout_session_id) throw new Error(data.detail || JSON.stringify(data));
      return {
        url: 'https://chatgpt.com/checkout/openai_llc/' + data.checkout_session_id,
        mode: 'short',
      };
    }
  }

  // ─── SVG 图标：双层 sparkle，Claude 标志性 ──────────────────────
  const ICON_SPARKLE = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L13.8 9.2C14.05 10.05 14.7 10.7 15.55 10.95L21.75 12.75L15.55 14.55C14.7 14.8 14.05 15.45 13.8 16.3L12 22.5L10.2 16.3C9.95 15.45 9.3 14.8 8.45 14.55L2.25 12.75L8.45 10.95C9.3 10.7 9.95 10.05 10.2 9.2L12 3Z"
            stroke="currentColor" stroke-linejoin="round" fill="none"/>
      <path d="M19 3L19.6 5.1C19.7 5.4 19.9 5.6 20.2 5.7L22.5 6.3L20.2 7C19.9 7.1 19.7 7.3 19.6 7.6L19 9.75L18.4 7.6C18.3 7.3 18.1 7.1 17.8 7L15.5 6.3L17.8 5.7C18.1 5.6 18.3 5.4 18.4 5.1L19 3Z"
            stroke="currentColor" stroke-linejoin="round" fill="none"/>
    </svg>
  `;

  // ─── 样式（Claude.ai 美学）─────────────────────────────────────
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;600&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap');

    /* ─── 浮动按钮：纯 SVG，无背景 ─── */
    #${BTN_ID} {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 999998;
      width: 36px;
      height: 36px;
      padding: 0;
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b6354;
      transition: color 0.22s ease, transform 0.35s cubic-bezier(.34,1.56,.64,1);
      opacity: 0.7;
    }
    #${BTN_ID}:hover {
      color: #c96442;
      opacity: 1;
      transform: rotate(-12deg) scale(1.12);
    }
    #${BTN_ID} svg {
      width: 26px;
      height: 26px;
      stroke-width: 1.6;
      transition: filter 0.22s ease;
    }
    #${BTN_ID}:hover svg {
      filter: drop-shadow(0 2px 8px rgba(201,100,66,0.30));
    }
    #${BTN_ID}.is-open {
      color: #c96442;
      opacity: 1;
    }

    /* ─── 面板 ─── */
    #${PANEL_ID} {
      position: fixed;
      bottom: 76px;
      right: 28px;
      z-index: 999997;
      width: 380px;
      max-height: 84vh;
      overflow-y: auto;
      overflow-x: hidden;
      background: #faf9f5;
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 18px;
      box-shadow:
        0 1px 2px rgba(0,0,0,0.04),
        0 8px 24px rgba(0,0,0,0.06),
        0 24px 60px rgba(60,40,20,0.10);
      font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
      font-size: 14px;
      color: #2c2419;
      letter-spacing: -0.005em;
      transform: translateY(8px) scale(0.985);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.28s cubic-bezier(.34,1.2,.64,1), opacity 0.22s ease;
    }
    #${PANEL_ID}.open {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: all;
    }
    #${PANEL_ID}::-webkit-scrollbar { width: 6px; }
    #${PANEL_ID}::-webkit-scrollbar-track { background: transparent; }
    #${PANEL_ID}::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.10);
      border-radius: 3px;
    }

    /* ─── 头部 ─── */
    .gpt-panel-header {
      padding: 22px 24px 14px;
      display: flex;
      align-items: baseline;
      gap: 9px;
    }
    .gpt-panel-title {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 19px;
      font-weight: 500;
      color: #2c2419;
      letter-spacing: -0.018em;
      line-height: 1;
    }
    .gpt-panel-subtitle {
      font-size: 12px;
      color: #8a7f6a;
      font-weight: 400;
      letter-spacing: 0;
    }

    .gpt-panel-body { padding: 0 24px 24px; }

    /* ─── 区段标签 ─── */
    .gpt-section-label {
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: #a89c85;
      margin: 18px 0 9px;
    }
    .gpt-section-label .gpt-label-extra {
      font-weight: 400;
      text-transform: none;
      letter-spacing: 0;
      color: #c4b8a0;
      margin-left: 5px;
    }

    /* ─── 链接类型 Tabs ─── */
    .gpt-mode-tabs {
      display: flex;
      gap: 0;
      background: rgba(0,0,0,0.035);
      padding: 3px;
      border-radius: 10px;
    }
    .gpt-mode-tab {
      flex: 1;
      padding: 8px 0;
      border-radius: 7px;
      border: none;
      background: transparent;
      color: #8a7f6a;
      font-size: 13px;
      font-weight: 450;
      cursor: pointer;
      text-align: center;
      transition: all 0.18s ease;
      font-family: inherit;
      letter-spacing: -0.005em;
    }
    .gpt-mode-tab.active {
      background: #faf9f5;
      color: #2c2419;
      font-weight: 500;
      box-shadow: 0 1px 2px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04);
    }
    .gpt-mode-tab:hover:not(.active) { color: #2c2419; }

    /* ─── 套餐列表 ─── */
    .gpt-plan-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .gpt-plan-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 13px;
      border-radius: 11px;
      border: 1px solid transparent;
      background: transparent;
      cursor: pointer;
      transition: all 0.16s ease;
      user-select: none;
    }
    .gpt-plan-item:hover:not(.disabled) {
      background: rgba(201,100,66,0.04);
    }
    .gpt-plan-item.active {
      background: rgba(201,100,66,0.06);
      border-color: rgba(201,100,66,0.20);
    }
    .gpt-plan-item.disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    .gpt-plan-radio {
      width: 16px; height: 16px;
      border-radius: 50%;
      border: 1.5px solid #d4cab8;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.18s ease;
      background: #faf9f5;
    }
    .gpt-plan-item:hover:not(.disabled) .gpt-plan-radio {
      border-color: #b8aa8e;
    }
    .gpt-plan-item.active .gpt-plan-radio {
      border-color: #c96442;
      background: #c96442;
    }
    .gpt-plan-radio-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #faf9f5;
      transform: scale(0);
      transition: transform 0.2s cubic-bezier(.34,1.56,.64,1);
    }
    .gpt-plan-item.active .gpt-plan-radio-dot { transform: scale(1); }
    .gpt-plan-info { flex: 1; min-width: 0; }
    .gpt-plan-name {
      font-size: 13.5px;
      font-weight: 500;
      color: #2c2419;
      letter-spacing: -0.005em;
      line-height: 1.3;
    }
    .gpt-plan-name .gpt-plan-region {
      color: #a89c85;
      font-weight: 400;
      margin-left: 6px;
    }
    .gpt-plan-meta {
      font-size: 11px;
      color: #b8ac95;
      margin-top: 2px;
      font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
      letter-spacing: -0.01em;
    }
    .gpt-plan-badge {
      font-size: 10.5px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 100px;
      background: rgba(201,100,66,0.10);
      color: #c96442;
      letter-spacing: 0.01em;
      flex-shrink: 0;
    }

    /* ─── Token 输入 ─── */
    .gpt-token-input {
      width: 100%;
      box-sizing: border-box;
      padding: 11px 13px;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 10px;
      font-size: 12.5px;
      font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
      color: #2c2419;
      background: rgba(255,255,255,0.6);
      resize: none;
      height: 62px;
      transition: all 0.18s ease;
      outline: none;
      letter-spacing: -0.01em;
      line-height: 1.5;
    }
    .gpt-token-input::placeholder { color: #b8ac95; }
    .gpt-token-input:focus {
      border-color: rgba(201,100,66,0.40);
      background: #fff;
      box-shadow: 0 0 0 3px rgba(201,100,66,0.08);
    }
    .gpt-token-hint {
      font-size: 11.5px;
      color: #8a7f6a;
      margin-top: 8px;
      line-height: 1.6;
    }
    .gpt-token-hint a {
      color: #c96442;
      text-decoration: none;
      border-bottom: 1px solid rgba(201,100,66,0.30);
      padding-bottom: 1px;
      transition: border-color 0.15s;
    }
    .gpt-token-hint a:hover { border-bottom-color: #c96442; }

    /* ─── 长链提示横幅 ─── */
    .gpt-info-banner {
      background: rgba(201,100,66,0.05);
      border: 1px solid rgba(201,100,66,0.15);
      border-radius: 10px;
      padding: 10px 13px;
      font-size: 12px;
      color: #8a4a2e;
      line-height: 1.55;
      margin-top: 12px;
      display: flex;
      gap: 9px;
      align-items: flex-start;
    }
    .gpt-info-banner-icon {
      flex-shrink: 0;
      color: #c96442;
      margin-top: 1px;
    }
    .gpt-info-banner-icon svg { width: 14px; height: 14px; display: block; }

    /* ─── 生成按钮 ─── */
    .gpt-generate-btn {
      width: 100%;
      padding: 12px 0;
      margin-top: 18px;
      border-radius: 11px;
      border: none;
      background: #2c2419;
      color: #faf9f5;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.18s ease;
      letter-spacing: -0.005em;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .gpt-generate-btn:hover {
      background: #1a140b;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(44,36,25,0.20);
    }
    .gpt-generate-btn:active { transform: translateY(0); }
    .gpt-generate-btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    /* ─── 结果 ─── */
    .gpt-result {
      margin-top: 14px;
      border-radius: 11px;
      overflow: hidden;
      animation: gptFadeIn 0.25s ease;
    }
    @keyframes gptFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .gpt-result-success {
      background: rgba(34,139,90,0.05);
      border: 1px solid rgba(34,139,90,0.18);
    }
    .gpt-result-error {
      background: rgba(200,55,55,0.04);
      border: 1px solid rgba(200,55,55,0.18);
    }
    .gpt-result-header {
      padding: 10px 13px 6px;
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.09em;
      text-transform: uppercase;
    }
    .gpt-result-success .gpt-result-header { color: #1f8556; }
    .gpt-result-error .gpt-result-header { color: #c83737; }
    .gpt-result-url {
      padding: 2px 13px 10px;
      font-size: 11.5px;
      font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
      color: #4a4030;
      word-break: break-all;
      line-height: 1.55;
      letter-spacing: -0.01em;
    }
    .gpt-result-actions {
      display: flex;
      gap: 6px;
      padding: 0 13px 11px;
    }
    .gpt-result-btn {
      flex: 1;
      padding: 7px 0;
      border-radius: 8px;
      border: 1px solid rgba(0,0,0,0.08);
      background: rgba(255,255,255,0.6);
      color: #2c2419;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s;
      text-align: center;
      letter-spacing: -0.005em;
    }
    .gpt-result-btn:hover {
      background: #fff;
      border-color: rgba(0,0,0,0.15);
      transform: translateY(-1px);
    }
    .gpt-spinner {
      width: 13px; height: 13px;
      border: 1.8px solid rgba(250,249,245,0.3);
      border-top-color: #faf9f5;
      border-radius: 50%;
      animation: spin 0.65s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ─── 暗色模式 ─── */
    @media (prefers-color-scheme: dark) {
      #${BTN_ID} { color: #b8ac95; }
      #${BTN_ID}:hover { color: #e8a07d; }
      #${BTN_ID}.is-open { color: #e8a07d; }

      #${PANEL_ID} {
        background: #1f1c17;
        border-color: rgba(255,255,255,0.08);
        color: #e8e1d2;
        box-shadow:
          0 1px 2px rgba(0,0,0,0.3),
          0 12px 32px rgba(0,0,0,0.4),
          0 24px 60px rgba(0,0,0,0.5);
      }
      .gpt-panel-title { color: #f0e8d6; }
      .gpt-panel-subtitle { color: #8a7f6a; }
      .gpt-section-label { color: #6b6354; }
      .gpt-section-label .gpt-label-extra { color: #4d463a; }

      .gpt-mode-tabs { background: rgba(255,255,255,0.04); }
      .gpt-mode-tab { color: #8a7f6a; }
      .gpt-mode-tab.active {
        background: #2c2620;
        color: #f0e8d6;
        box-shadow: 0 1px 2px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(255,255,255,0.06);
      }

      .gpt-plan-item:hover:not(.disabled) { background: rgba(232,160,125,0.06); }
      .gpt-plan-item.active {
        background: rgba(232,160,125,0.09);
        border-color: rgba(232,160,125,0.25);
      }
      .gpt-plan-radio { background: #1f1c17; border-color: #4d463a; }
      .gpt-plan-item.active .gpt-plan-radio {
        background: #e8a07d;
        border-color: #e8a07d;
      }
      .gpt-plan-item.active .gpt-plan-radio-dot { background: #1f1c17; }
      .gpt-plan-name { color: #f0e8d6; }
      .gpt-plan-name .gpt-plan-region { color: #8a7f6a; }
      .gpt-plan-meta { color: #6b6354; }
      .gpt-plan-badge {
        background: rgba(232,160,125,0.13);
        color: #e8a07d;
      }

      .gpt-token-input {
        background: rgba(0,0,0,0.18);
        border-color: rgba(255,255,255,0.08);
        color: #e8e1d2;
      }
      .gpt-token-input::placeholder { color: #6b6354; }
      .gpt-token-input:focus {
        border-color: rgba(232,160,125,0.4);
        background: rgba(0,0,0,0.25);
        box-shadow: 0 0 0 3px rgba(232,160,125,0.10);
      }
      .gpt-token-hint { color: #8a7f6a; }
      .gpt-token-hint a { color: #e8a07d; border-bottom-color: rgba(232,160,125,0.3); }

      .gpt-info-banner {
        background: rgba(232,160,125,0.06);
        border-color: rgba(232,160,125,0.18);
        color: #d4a98c;
      }
      .gpt-info-banner-icon { color: #e8a07d; }

      .gpt-generate-btn {
        background: #f0e8d6;
        color: #1f1c17;
      }
      .gpt-generate-btn:hover {
        background: #fff;
        box-shadow: 0 6px 16px rgba(0,0,0,0.4);
      }
      .gpt-spinner {
        border-color: rgba(31,28,23,0.25);
        border-top-color: #1f1c17;
      }

      .gpt-result-success {
        background: rgba(64,180,120,0.07);
        border-color: rgba(64,180,120,0.22);
      }
      .gpt-result-success .gpt-result-header { color: #5dc88f; }
      .gpt-result-error {
        background: rgba(220,80,80,0.07);
        border-color: rgba(220,80,80,0.22);
      }
      .gpt-result-error .gpt-result-header { color: #e57373; }
      .gpt-result-url { color: #c4b8a0; }
      .gpt-result-btn {
        background: rgba(255,255,255,0.04);
        border-color: rgba(255,255,255,0.10);
        color: #e8e1d2;
      }
      .gpt-result-btn:hover {
        background: rgba(255,255,255,0.08);
        border-color: rgba(255,255,255,0.18);
      }
    }
  `;

  // ─── 注入 UI ────────────────────────────────────────────────────
  function inject() {
    if (document.getElementById(BTN_ID)) return;

    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.title = 'GPT 支付链接生成器';
    btn.innerHTML = ICON_SPARKLE;
    document.body.appendChild(btn);

    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.innerHTML = buildPanelHTML();
    document.body.appendChild(panel);

    bindEvents(btn, panel);
  }

  function buildPanelHTML() {
    const planItems = PLANS.map(p => `
      <div class="gpt-plan-item" data-plan="${p.id}">
        <div class="gpt-plan-radio"><div class="gpt-plan-radio-dot"></div></div>
        <div class="gpt-plan-info">
          <div class="gpt-plan-name">${p.label}<span class="gpt-plan-region">${p.tag}</span></div>
          <div class="gpt-plan-meta">${p.plan_name}</div>
        </div>
        <span class="gpt-plan-badge">${p.badge}</span>
      </div>
    `).join('');

    return `
      <div class="gpt-panel-header">
        <div class="gpt-panel-title">Checkout</div>
        <div class="gpt-panel-subtitle">/ 支付链接生成</div>
      </div>
      <div class="gpt-panel-body">

        <div class="gpt-section-label">链接类型</div>
        <div class="gpt-mode-tabs">
          <button class="gpt-mode-tab active" data-mode="short">短链 · 自用</button>
          <button class="gpt-mode-tab" data-mode="long">长链 · 可转发</button>
        </div>

        <div class="gpt-section-label">套餐选择</div>
        <div class="gpt-plan-list">${planItems}</div>

        <div class="gpt-section-label">
          Access Token<span class="gpt-label-extra">选填</span>
        </div>
        <textarea
          class="gpt-token-input"
          id="__gpt_token__"
          placeholder="支持完整 JSON / 键值对 / 纯 Token 三种格式&#10;不填则自动获取当前账号"
          spellcheck="false"
        ></textarea>
        <div class="gpt-token-hint">
          可在
          <a href="https://chatgpt.com/api/auth/session" target="_blank" rel="noopener">chatgpt.com/api/auth/session</a>
          获取。填写他人 Token 可为其代生成长链支付链接。
        </div>

        <div class="gpt-info-banner" id="__gpt_long_hint__" style="display:none">
          <span class="gpt-info-banner-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
          </span>
          <span>长链可直接发送给他人付款，无需对方登录 ChatGPT，适合代付场景。</span>
        </div>

        <button class="gpt-generate-btn" id="__gpt_gen__">
          <span>生成支付链接</span>
        </button>
        <div id="__gpt_result__"></div>
      </div>
    `;
  }

  function bindEvents(btn, panel) {
    let isOpen = false;
    let selectedMode = 'short';
    let selectedPlan = PLANS[0].id;

    function togglePanel() {
      isOpen = !isOpen;
      panel.classList.toggle('open', isOpen);
      btn.classList.toggle('is-open', isOpen);
    }

    btn.addEventListener('click', togglePanel);

    panel.addEventListener('click', e => {
      const modeTab = e.target.closest('.gpt-mode-tab');
      if (modeTab) {
        selectedMode = modeTab.dataset.mode;
        panel.querySelectorAll('.gpt-mode-tab').forEach(t => t.classList.toggle('active', t === modeTab));
        updatePlanDisabled();
        const hint = panel.querySelector('#__gpt_long_hint__');
        hint.style.display = selectedMode === 'long' ? 'flex' : 'none';
        const plan = PLANS.find(p => p.id === selectedPlan);
        if (selectedMode === 'long' && plan && !plan.hasLong) {
          const first = PLANS.find(p => p.hasLong);
          if (first) selectPlan(first.id);
        }
        return;
      }

      const planItem = e.target.closest('.gpt-plan-item');
      if (planItem && !planItem.classList.contains('disabled')) {
        selectPlan(planItem.dataset.plan);
        return;
      }

      if (e.target.id === '__gpt_copy__') {
        const url = panel.querySelector('#__gpt_url_text__')?.textContent;
        if (url) {
          navigator.clipboard.writeText(url).then(() => {
            e.target.textContent = '已复制';
            setTimeout(() => { e.target.textContent = '复制链接'; }, 1800);
          });
        }
        return;
      }

      if (e.target.id === '__gpt_open__') {
        const url = panel.querySelector('#__gpt_url_text__')?.textContent;
        if (url) window.open(url, '_blank');
        return;
      }
    });

    function selectPlan(id) {
      selectedPlan = id;
      panel.querySelectorAll('.gpt-plan-item').forEach(el => {
        el.classList.toggle('active', el.dataset.plan === id);
      });
    }

    function updatePlanDisabled() {
      panel.querySelectorAll('.gpt-plan-item').forEach(el => {
        const plan = PLANS.find(p => p.id === el.dataset.plan);
        const disabled = selectedMode === 'long' && plan && !plan.hasLong;
        el.classList.toggle('disabled', disabled);
      });
    }

    selectPlan(selectedPlan);

    const genBtn = panel.querySelector('#__gpt_gen__');
    genBtn.addEventListener('click', async () => {
      const plan = PLANS.find(p => p.id === selectedPlan);
      if (!plan) return;
      if (selectedMode === 'long' && !plan.hasLong) {
        showResult(null, '该套餐暂无长链支持');
        return;
      }
      const tokenRaw = panel.querySelector('#__gpt_token__').value;
      genBtn.disabled = true;
      genBtn.innerHTML = '<span class="gpt-spinner"></span><span>生成中</span>';
      try {
        const { url } = await generateLink(plan, selectedMode, tokenRaw);
        showResult(url, null, selectedMode);
        if (selectedMode === 'short') {
          setTimeout(() => { window.location.href = url; }, 500);
        }
      } catch (err) {
        showResult(null, err.message || String(err));
      } finally {
        genBtn.disabled = false;
        genBtn.innerHTML = '<span>生成支付链接</span>';
      }
    });

    function showResult(url, errMsg, mode) {
      const resultEl = panel.querySelector('#__gpt_result__');
      if (errMsg) {
        resultEl.innerHTML = `
          <div class="gpt-result gpt-result-error">
            <div class="gpt-result-header">生成失败</div>
            <div class="gpt-result-url">${escHtml(errMsg)}</div>
          </div>`;
      } else {
        resultEl.innerHTML = `
          <div class="gpt-result gpt-result-success">
            <div class="gpt-result-header">链接已生成${mode === 'short' ? ' · 即将跳转' : ''}</div>
            <div class="gpt-result-url" id="__gpt_url_text__">${escHtml(url)}</div>
            <div class="gpt-result-actions">
              <button class="gpt-result-btn" id="__gpt_copy__">复制链接</button>
              <button class="gpt-result-btn" id="__gpt_open__">打开链接</button>
            </div>
          </div>`;
      }
    }
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ─── 轮询注入防覆盖 ─────────────────────────────────────────────
  function ensureInjected() { inject(); }

  if (document.body) {
    ensureInjected();
  } else {
    document.addEventListener('DOMContentLoaded', ensureInjected);
  }

  setInterval(() => {
    if (!document.getElementById(BTN_ID)) ensureInjected();
  }, 1000);

  const observer = new MutationObserver(() => {
    if (!document.getElementById(BTN_ID)) ensureInjected();
  });
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: false });
  }

})();