const { createPayment, verifyPaymentCallback } = require("../payment-adapters");

async function createPaymentForOrder(order, provider) {
  return await createPayment({ ...order, payment: provider }, provider);
}

async function verifyCallback(provider, rawBody, headers) {
  return await verifyPaymentCallback(provider, rawBody, headers);
}

module.exports = {
  createPaymentForOrder,
  verifyCallback,
};
