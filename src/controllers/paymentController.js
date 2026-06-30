const { updateOrder, formatTime } = require("../services/orderService");
const { verifyCallback } = require("../services/paymentService");

async function handlePaymentCallback(req, res) {
  try {
    const { provider } = req.params;

    const result = await verifyCallback(provider, req.rawBody, req.headers);

    if (!result.ok) {
      return res.status(400).json({ error: result.error || "回调验签失败" });
    }

    const updated = updateOrder(result.orderId, {
      status: "待交付",
      paidAt: formatTime(),
      gatewayTradeNo: result.tradeNo,
    });

    if (!updated) {
      return res.status(404).json({ error: "订单不存在" });
    }

    // 根据不同支付渠道返回不同格式
    if (provider === "wechat") {
      res.json({ code: "SUCCESS", message: "成功" });
    } else {
      res.json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || "回调处理失败" });
  }
}

module.exports = {
  handlePaymentCallback,
};
