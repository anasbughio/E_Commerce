const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

const isProduction = process.env.NODE_ENV === 'production';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors({
  origin: isProduction ? [clientUrl, /\.vercel\.app$/] : clientUrl,
  credentials: true,
}));

// ✅ Lazy-load routes to prevent crash on import errors
try {
  // Stripe Webhook MUST come BEFORE express.json() and express.urlencoded()
  // because Stripe needs the raw request body to verify the signature.
  app.use("/api/webhook", require("./routes/stripeWebhook"));
} catch (err) {
  console.error("Failed to load stripeWebhook routes:", err.message);
}

// ✅ Now you can safely parse JSON for all other routes
app.use(express.json());
app.use(cookieParser());

// ✅ Health check endpoint (for debugging Vercel)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    nodeEnv: process.env.NODE_ENV,
    hasMongoUri: !!process.env.MONGO_URI,
    hasJwtAccess: !!process.env.JWT_ACCESS_SECRET,
    hasJwtRefresh: !!process.env.JWT_REFRESH_SECRET,
    hasClientUrl: !!process.env.CLIENT_URL,
    clientUrl: process.env.CLIENT_URL,
    timestamp: new Date().toISOString()
  });
});

try {
  app.use('/api/auth', require('./routes/authRoutes'));
} catch (err) {
  console.error("Failed to load authRoutes:", err.message);
}

try {
  const protectedRoutes = require('./routes/protectedRoutes');
  app.use('/api', protectedRoutes);
} catch (err) {
  console.error("Failed to load protectedRoutes:", err.message);
}

try {
  app.use('/api/products', require('./routes/productRoutes'));
} catch (err) {
  console.error("Failed to load productRoutes:", err.message);
}

try {
  app.use('/api/cart', require('./routes/cartRoutes'));
} catch (err) {
  console.error("Failed to load cartRoutes:", err.message);
}

try {
  app.use('/api/orders', require('./routes/orderRoutes'));
} catch (err) {
  console.error("Failed to load orderRoutes:", err.message);
}

try {
  app.use('/api/admin/orders', require('./routes/adminOrderRoutes'));
} catch (err) {
  console.error("Failed to load adminOrderRoutes:", err.message);
}

try {
  app.use('/api/admin/orders/history', require('./routes/adminOrderHistoryRoutes'));
} catch (err) {
  console.error("Failed to load adminOrderHistoryRoutes:", err.message);
}

try {
  app.use("/api/admin", require("./routes/adminRoutes"));
} catch (err) {
  console.error("Failed to load adminRoutes:", err.message);
}

try {
  app.use("/api/stripe", require("./routes/stripeRoutes"));
} catch (err) {
  console.error("Failed to load stripeRoutes:", err.message);
}

app.use('/uploads', express.static('uploads'));

// ✅ Connect DB (safely)
const mongoose = require('mongoose');
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.log("❌ Database connection error:", err));
} else {
  console.log("⚠️ MONGO_URI not set, skipping database connection");
}

// ✅ Start server locally, or export app for Vercel serverless
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

module.exports = app;

// ✅ VERCEL FIX: Tell Vercel NOT to automatically parse the body. 
// If Vercel parses it before it reaches Express, the Stripe webhook signature verification fails!
// Express middleware (express.json and express.raw) will now handle the parsing instead.
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
