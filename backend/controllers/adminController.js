const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");

const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalSalesAgg = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalSales = totalSalesAgg[0]?.total || 0;

    const monthlySales = await Order.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalPrice" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalSales,
      monthlySales,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard stats", error });
  }
};

module.exports = {
  getDashboardStats,
};