const express = require("express");
const { handlePaymentCallback } = require("../controllers/paymentController");

const router = express.Router();

router.post("/payments/callback/:provider", handlePaymentCallback);

module.exports = router;
