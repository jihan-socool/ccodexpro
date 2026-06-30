const { getProduct } = require("../config/products");
const {
  createOrder,
  updateOrder,
  findOrderByIdentity,
  findOrdersByLookup,
  publicOrder,
  formatTime,
} = require("../services/orderService");
const { createPaymentForOrder } = require("../services/paymentService");

async function getOrders(req, res) {
  try {
    const lookup = String(req.query.lookup || "").trim();

    if (!lookup) {
      return res.status(400).json({ error: "请输入完整订单号或下单手机号/邮箱" });
    }

    const orders = findOrdersByLookup(lookup).map(publicOrder);
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message || "查询订单失败" });
  }
}

async function createNewOrder(req, res) {
  try {
    const { productId, contact, payment = "alipay" } = req.body;

    const product = getProduct(productId);
    if (!product) {
      return res.status(400).json({ error: "商品不存在" });
    }

    const contactStr = String(contact || "").trim();
    if (contactStr.length < 8 || !/(@|\d{8,})/.test(contactStr)) {
      return res.status(400).json({ error: "联系方式格式不正确" });
    }

    if (!["alipay", "wechat", "usdt"].includes(payment)) {
      return res.status(400).json({ error: "支付方式不支持" });
    }

    const order = createOrder({
      productId,
      productName: product.name,
      amount: product.price,
      contact: contactStr,
      payment,
      status: "待支付",
    });

    res.status(201).json({ order: publicOrder(order) });
  } catch (error) {
    res.status(500).json({ error: error.message || "创建订单失败" });
  }
}

async function createPaymentForOrderById(req, res) {
  try {
    const { orderId, provider, contact } = req.body;

    const order = findOrderByIdentity(orderId, contact);
    if (!order) {
      return res.status(404).json({ error: "订单不存在或联系方式不匹配" });
    }

    const paymentProvider = provider || order.payment || "alipay";
    if (!["alipay", "wechat", "usdt"].includes(paymentProvider)) {
      return res.status(400).json({ error: "支付方式不支持" });
    }

    const payment = await createPaymentForOrder(
      { ...order, payment: paymentProvider },
      paymentProvider
    );

    const updated = updateOrder(order.id, {
      payment: paymentProvider,
      paymentMode: payment.mode,
      gatewayPrepayId: payment.prepayId,
      status: "待支付",
    });

    res.json({ order: publicOrder(updated), payment });
  } catch (error) {
    res.status(500).json({ error: error.message || "创建支付失败" });
  }
}

async function markOrderAsPaid(req, res) {
  try {
    const { orderId } = req.params;
    const contact = String(req.body.contact || "").trim();

    if ((process.env.PAYMENT_MODE || "mock") === "live") {
      return res.status(403).json({ error: "真实支付模式下请等待支付回调确认" });
    }

    const order = findOrderByIdentity(orderId, contact);
    if (!order) {
      return res.status(404).json({ error: "订单不存在或联系方式不匹配" });
    }

    const updated = updateOrder(order.id, {
      status: "待交付",
      paidAt: formatTime(),
    });

    res.json({ order: publicOrder(updated) });
  } catch (error) {
    res.status(500).json({ error: error.message || "标记订单失败" });
  }
}

module.exports = {
  getOrders,
  createNewOrder,
  createPaymentForOrderById,
  markOrderAsPaid,
};
