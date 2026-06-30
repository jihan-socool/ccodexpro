# NEXAI20X 充值站

这是一个参考 gpt20x.com 信息架构后重新设计的原创版本，包含前端页面、帮助中心、后端订单查询和支付接口适配层。

## 已实现

- 更完整的首页视觉、套餐卡片和进入动画
- ChatGPT Plus / Pro 与 Codex 套餐购买流程
- 后端订单创建、订单查询、支付状态更新
- 支付宝、微信支付、USDT-BEP20 支付入口
- 支付接口适配层：默认 mock，预留支付宝 OpenAPI 与微信支付 V3 live 模式
- FAQ、售后政策、隐私政策、服务条款，内容覆盖原站全部主题并更全面
- 客服浮窗、企业采购入口、移动端适配

## 运行

无需安装第三方依赖。如果系统提示 `zsh: command not found: node`，请用项目自带启动脚本：

```bash
./start.sh
```

然后访问：

```text
http://0.0.0.0:4173
```

如果你的系统已经安装了 Node.js，也可以直接运行：

```bash
node server.js
```

订单会保存到：

```text
data/orders.json
```

## 接口

- `GET /api/health`
- `POST /api/orders`
- `GET /api/orders?keyword=订单号或联系方式`
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
