const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const { getDashboardStats } = require("../controllers/adminController");

router.get("/dashboard", requireAuth, requireRole("admin"), getDashboardStats);

module.exports = router;
