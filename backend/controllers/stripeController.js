const Stripe = require("stripe");
const mongoose = require("mongoose");
const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");

const dotenv = require("dotenv");
dotenv.config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  try {
    const { products, userId, address } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products provided" });
    }

    // ✅ Calculate total price
    const totalPrice = products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // ✅ Stripe line items
    const lineItems = products.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100), // cents
      },
      quantity: item.quantity,
    }));

    // ✅ Send consistent metadata for webhook
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        userId,
        address,
        totalPrice: totalPrice.toString(),
        cartItems: JSON.stringify(
          products.map((p) => ({
            id: p._id, // ✅ match webhook expectation
            name: p.name,
            price: p.price,
            qty: p.quantity, // ✅ renamed for consistency
          }))
        ),
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(400).json({ message: "Payment failed", error: err.message });
  }
};

const verifySession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: "No session ID provided" });

    // Fetch the session directly from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Check if we already created an order for this session
      const existingOrder = await Order.findOne({ sessionId });
      if (existingOrder) {
        return res.status(200).json({ message: "Order already saved", orderId: existingOrder._id });
      }

      // Create formatting
      const userId = session.metadata.userId;
      const address = session.metadata.address;
      const totalPrice = Number(session.metadata.totalPrice) || 0;
      const cartItems = JSON.parse(session.metadata.cartItems || "[]");

      const orderItems = cartItems.map((item) => ({
        product: mongoose.Types.ObjectId.isValid(item.id) ? item.id : undefined,
        name: item.name,
        price: item.price,
        quantity: item.qty,
      }));

      // Find user ID validity
      const validUserId = mongoose.Types.ObjectId.isValid(userId) ? userId : undefined;

      // Save order to DB
      const newOrder = await Order.create({
        user: validUserId,
        address,
        totalPrice,
        items: orderItems,
        sessionId: session.id,
      });

      console.log("✅ Order saved successfully via VerifySession:", newOrder._id);

      // Reduce stock
      for (const item of cartItems) {
        if (mongoose.Types.ObjectId.isValid(item.id)) {
          await Product.findByIdAndUpdate(item.id, {
            $inc: { stock: -item.qty },
          });
        }
      }

      // Clear user's cart
      if (validUserId) {
        await Cart.deleteOne({ userId: validUserId });
      }

      return res.status(200).json({ message: "Order processed", orderId: newOrder._id });
    } else {
      return res.status(400).json({ message: "Payment not completed" });
    }
  } catch (err) {
    console.error("Session verification error:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

module.exports = { createCheckoutSession, verifySession };