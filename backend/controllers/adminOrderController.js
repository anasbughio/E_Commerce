const Order = require('../models/order');

// 🟢 Get all orders (for admin dashboard)
const getAllOrders = async (req, res) => {
  try {
     const orders = await Order.find({ status: { $ne: "Delivered" } }).populate("user")
      .sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// 🟡 Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update order' });
  }
};

// 🔴 Delete order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete order' });
  }
};

module.exports = { getAllOrders, updateOrderStatus, deleteOrder };
