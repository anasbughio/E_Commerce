const express  = require('express');
const  {Register,Login, Refresh, Logout} = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();


router.post('/register',Register);
router.post('/login',Login);
router.post('/refresh',Refresh);
router.post('/logout',Logout);

module.exports = router;
