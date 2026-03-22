// backend/routes/adminOrderRoutes.js
const express = require("express");
const router = express.Router();
const { getAllOrders, updateOrderStatus, deleteOrder } = require("../controllers/adminOrderController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get("/", requireAuth, requireRole('admin'), getAllOrders);
router.put("/:id", requireAuth, requireRole('admin'), updateOrderStatus);
router.delete("/:id", requireAuth, requireRole('admin'), deleteOrder);

module.exports = router;
