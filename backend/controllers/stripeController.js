const Stripe = require("stripe");
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
      success_url: `${process.env.CLIENT_URL}/success`,
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

module.exports = { createCheckoutSession };