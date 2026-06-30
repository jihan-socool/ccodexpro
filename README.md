# NEXAI20X 充值站

这是一个参考 gpt20x.com 信息架构后重新设计的原创版本，包含前端页面、帮助中心、后端订单查询和支付接口适配层。

## 已实现

- 更完整的首页视觉、套餐卡片和进入动画
- ChatGPT Plus / Pro、Claude Pro / Max、Codex 套餐购买流程
- 后端订单创建、订单查询、支付状态更新
- 支付宝、微信支付、USDT-BEP20 支付入口
- 支付接口适配层：默认 mock，预留支付宝 OpenAPI 与微信支付 V3 live 模式
- FAQ、售后政策、隐私政策、服务条款，内容覆盖原站全部主题并更全面
- 客服浮窗、企业采购入口、移动端适配

## 技术栈

### 后端
- **Express.js** - Web 框架
- **Node.js** - 运行环境
- 文件式数据存储 (JSON)
- 原生支付宝、微信支付接口适配

### 前端
- 原生 HTML/CSS/JavaScript
- 响应式设计

## 安装与运行

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制环境变量模板：

```bash
cp .env.example .env
```

根据需要修改 `.env` 文件中的配置。

### 3. 启动服务器

开发模式（自动重启）：

```bash
npm run dev
```

生产模式：

```bash
npm start
```

或者使用项目自带启动脚本：

```bash
./start.sh
```

### 4. 访问应用

```text
http://0.0.0.0:4173
```

局域网设备访问时，请把 `0.0.0.0` 换成运行服务器这台电脑的局域网 IP，例如 `http://192.168.1.23:4173`。

订单会保存到：

```text
data/orders.json
```

## 接口

- `GET /api/health`
- `POST /api/orders`
- `GET /api/orders?lookup=完整订单号或完整下单联系方式`
- `POST /api/payments/create`
- `POST /api/orders/:id/mark-paid`
- `POST /api/payments/callback/alipay`
- `POST /api/payments/callback/wechat`

## 支付配置

默认是 `PAYMENT_MODE=mock`，不会发起真实收款。

支付宝 live 模式需要：

```text
PAYMENT_MODE=live
ALIPAY_APP_ID=
ALIPAY_PRIVATE_KEY=
ALIPAY_PUBLIC_KEY=
ALIPAY_NOTIFY_URL=
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
```

微信支付 live 模式需要：

```text
PAYMENT_MODE=live
WECHAT_MCH_ID=
WECHAT_APP_ID=
WECHAT_API_V3_KEY=
WECHAT_PRIVATE_KEY=
WECHAT_SERIAL_NO=
WECHAT_NOTIFY_URL=
WECHAT_PLATFORM_PUBLIC_KEY=
```

当前代码会生成请求结构、签名和回调验签入口。生产接入时建议替换为官方 SDK，完成平台证书更新、回调解密、金额校验、幂等处理、HTTPS 和后台权限控制。
