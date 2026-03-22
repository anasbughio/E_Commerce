const express = require('express');
const { getUserCart, addItemToCart, updateQuantity, removeFromCart,clearCart } = require('../controllers/cart');
const {requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/',requireAuth,getUserCart);
router.post('/add',  requireAuth,addItemToCart);
router.put('/update', requireAuth, updateQuantity);
router.delete('/remove', requireAuth,removeFromCart);
router.delete('/clear', requireAuth,clearCart);



module.exports = router;