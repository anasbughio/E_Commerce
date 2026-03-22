const {createOrder, userOrders} = require('../controllers/orderControllers.js');
const { requireAuth } = require('../middleware/auth.js');
const express = require('express');
const router = express.Router();

router.post('/create',requireAuth,createOrder);
router.get('/user-orders',requireAuth,userOrders);

module.exports = router;