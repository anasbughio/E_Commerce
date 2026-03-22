const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ⚠️ IMPORTANT: Keep express.raw() here, NOT express.json()
router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const userId = session.metadata.userId;
      const address = session.metadata.address;
      const totalPrice = Number(session.metadata.totalPrice) || 0;

      // ✅ Parse items safely
      const cartItems = JSON.parse(session.metadata.cartItems || "[]");

      // ✅ Format items for Order model
      const orderItems = cartItems.map((item) => ({
        product: mongoose.Types.ObjectId.isValid(item.id) ? item.id : undefined,
        name: item.name,
        price: item.price,
        quantity: item.qty,
      }));

      // ✅ Save order to DB
      const newOrder = await Order.create({
        user: mongoose.Types.ObjectId.isValid(userId) ? userId : undefined,
        address,
        totalPrice,
        items: orderItems,
      });

      console.log("✅ Order saved successfully:", newOrder._id);

      // ✅ Reduce stock for each purchased product
      for (const item of cartItems) {
        if (mongoose.Types.ObjectId.isValid(item.id)) {
          await Product.findByIdAndUpdate(item.id, {
            $inc: { stock: -item.qty },
          });
        }
      }

      // ✅ Clear user's cart after successful payment
      if (mongoose.Types.ObjectId.isValid(userId)) {
        await Cart.deleteOne({ userId });
        console.log("🧹 Cart cleared for user:", userId);
      }
    }

    res.status(200).send("Webhook received");
  } catch (err) {
    console.error("⚠️ Webhook Error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;