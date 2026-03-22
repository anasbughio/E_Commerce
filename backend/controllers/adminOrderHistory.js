
const Order = require("../models/order");
const adminOrderHistory = async (req,res)=>{
      try {
    const orders = await Order.find({ status: "Delivered" }).populate("user");
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching delivered orders" });
  }

}

module.exports = {adminOrderHistory};