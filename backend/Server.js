const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const protectedRoutes = require('./routes/protectedRoutes');
const isProduction = process.env.NODE_ENV === 'production';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const app = express();

const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors({
  origin: isProduction ? [clientUrl, /\.vercel\.app$/] : clientUrl,
  credentials: true,
}));

app.use(helmet());

// ✅ Stripe Webhook must come BEFORE express.json()
app.use("/api/webhook", require("./routes/stripeWebhook"));

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

// ✅ Your app routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', protectedRoutes);
app.use('/api/products', require('./routes/productRoutes'));
app.use('/uploads', express.static('uploads'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin/orders', require('./routes/adminOrderRoutes'));
app.use('/api/admin/orders/history', require('./routes/adminOrderHistoryRoutes'));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/stripe", require("./routes/stripeRoutes"));

// ✅ Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ Database connection error:", err));

// ✅ Start server locally, or export app for Vercel serverless
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

module.exports = app;
