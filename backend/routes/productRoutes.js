const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  deleteProduct,
  productDetails,
  updateProduct,
  addReview,
  getAllReviews,
  deleteReview,
} = require("../controllers/productContorller"); // ✅ small typo fix: productController not Contorller
const { requireAuth, requireRole } = require("../middleware/auth");
const upload = require("../upload");

// 🟢 Public routes
router.get("/", requireAuth,getAllProducts);
router.get("/:id",requireAuth, productDetails);
router.post("/:id/reviews",requireAuth, addReview);
// 🔒 Admin-only routes
router.post("/create", requireAuth, requireRole("admin"), upload.single("image"), createProduct);
router.put("/:id", requireAuth, requireRole("admin"), upload.single("image"), updateProduct);
router.delete("/:id", requireAuth, requireRole("admin"), deleteProduct);
router.get('/admin/reviews', requireAuth, requireRole('admin'), getAllReviews);
router.delete(
  '/admin/reviews/:productId/:reviewId',
  requireAuth,
  requireRole('admin'),
  deleteReview
);

module.exports = router;
