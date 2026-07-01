const express = require("express");
const { adminAuth } = require("../middleware/adminAuth");
const {
  loginAdmin,
  getAdminOverview,
  updateAdminProduct,
  searchAdminOrders,
  updateAdminOrder,
  listAdminContent,
  saveAdminContent,
  updateAdminSiteConfig,
  updateAdminHelpContent,
  getAdminSystemStatus,
  checkAdminSystemUpdates,
  runAdminSystemUpdate,
} = require("../controllers/adminController");

const router = express.Router();

router.post("/admin/login", loginAdmin);
router.use(adminAuth);
router.get("/admin/overview", getAdminOverview);
router.patch("/admin/products/:productId", updateAdminProduct);
router.get("/admin/orders", searchAdminOrders);
router.patch("/admin/orders/:orderId", updateAdminOrder);
router.get("/admin/content", listAdminContent);
router.post("/admin/content", saveAdminContent);
router.patch("/admin/site-config", updateAdminSiteConfig);
router.patch("/admin/help-content", updateAdminHelpContent);
router.get("/admin/system-status", getAdminSystemStatus);
router.post("/admin/system-status/check", checkAdminSystemUpdates);
router.post("/admin/system-status/run", runAdminSystemUpdate);

module.exports = router;
