// middleware/isAdmin.js
module.exports = function (req, res, next) {
  try {
    if (!req.user || !req.user.roles.includes('admin')) {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
