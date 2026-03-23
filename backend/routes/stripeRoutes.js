const express = require("express");
const router = express.Router();
const { createCheckoutSession, verifySession } = require("../controllers/stripeController");

router.post("/create-checkout-session", createCheckoutSession);
router.post("/verify-session", verifySession);

module.exports = router;
