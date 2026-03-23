const mongoose = require("mongoose");
const Product = require('../models/product.js');
const Order = require('../models/order.js');
const Cart = require("../models/Cart");

const createOrder = async (req, res) => {
  try {
    const { items, totalPrice, address } = req.body;
    const userId = req.user.id; // ✅ Corrected

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // ✅ Check stock and reduce quantity
    for (const item of items) {
      const product = await Product.findById(item._id);

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }

      product.stock -= item.quantity;
      await product.save();
    }

    // ✅ Transform items for Order model
    const formattedItems = items.map((item) => ({
      product: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    // ✅ Create order
    const newOrder = new Order({
      user: userId,
      items: formattedItems,
      totalPrice,
      address,
    });

    await newOrder.save();

    // ✅ Clear user's cart after successful order
    await Cart.deleteOne({ userId: new mongoose.Types.ObjectId(userId) });

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: 'Failed to place order' });
  }
};

const userOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

module.exports = { createOrder, userOrders };
