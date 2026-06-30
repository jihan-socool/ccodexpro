const express = require("express");
const {
  getOrders,
  createNewOrder,
  createPaymentForOrderById,
  markOrderAsPaid,
} = require("../controllers/orderController");

const router = express.Router();

router.get("/orders", getOrders);
router.post("/orders", createNewOrder);
router.post("/payments/create", createPaymentForOrderById);
router.post("/orders/:orderId/mark-paid", markOrderAsPaid);

module.exports = router;
