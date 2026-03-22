const express  = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/profile', requireAuth, async (req, res) => {
  // req.user comes from middleware (decoded JWT payload)
  res.json({
    message: 'This is a protected route!',
    userId: req.user.id,
    roles: req.user.roles,
  });
});


module.exports = router;