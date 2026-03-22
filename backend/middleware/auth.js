const jwt = require("jsonwebtoken");
const User = require("../models/user"); // ✅ make sure this path is correct

const requireAuth = async (req, res, next) => {
  const auth = req.get("Authorization") || "";
  if (!auth.startsWith("Bearer"))
    return res.status(401).json({ message: "No token provided" });

  const token = auth.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    console.log("Decoded payload:", payload);

    // 🔍 fetch the actual user document to get name/email
    const user = await User.findById(payload.sub).select("name email roles");
console.log("Fetched user from DB:", user);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // attach full user info
   req.user = {
  id: user._id,
  name: user.username || user.name || user.email.split('@')[0] || 'Customer',
  email: user.email,
  roles: user.roles || ['customer'],
};

    console.log("Authenticated user:", req.user); // 👈 add this to confirm

    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ message: "Invalid token", error });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user || !req.user.roles.includes(role)) {
    return res
      .status(403)
      .json({ message: `Access denied: ${role} role required` });
  }
  next();
};

module.exports = { requireAuth, requireRole };
