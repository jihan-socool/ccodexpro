const express = require("express");
const {
  getProducts,
  getPublishedContent,
  getStatus,
  getSiteConfig,
  getHelpContent,
  trackVisitor,
} = require("../controllers/publicController");

const router = express.Router();

router.get("/products", getProducts);
router.get("/content", getPublishedContent);
router.get("/ai-status", getStatus);
router.get("/site-config", getSiteConfig);
router.get("/help-content", getHelpContent);
router.post("/visitors/track", trackVisitor);

module.exports = router;
