// backend/routes/adminOrderRoutes.js
const express = require("express");
const router = express.Router();
const {adminOrderHistory} = require("../controllers/adminOrderHistory");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get("/", requireAuth, requireRole('admin'), adminOrderHistory);

module.exports = router;
