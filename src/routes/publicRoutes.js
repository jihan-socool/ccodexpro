const express = require("express");
const {
  getProducts,
  getPublishedContent,
  getStatus,
  getSiteConfig,
  trackVisitor,
} = require("../controllers/publicController");

const router = express.Router();

router.get("/products", getProducts);
router.get("/content", getPublishedContent);
router.get("/ai-status", getStatus);
router.get("/site-config", getSiteConfig);
router.post("/visitors/track", trackVisitor);

module.exports = router;
