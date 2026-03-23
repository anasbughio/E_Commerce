import { useEffect, useState } from "react";
import api from "../api/axios";
import UserNavbar from "../components/UserNavbar";
import "../styles/Order.css"; // ✅ Import external stylesheet

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/orders/user-orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(res.data.orders);
      } catch (err) {
        console.error(err);
        alert("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading)
    return (
      <div className="orders-loading">
        <p>Loading your orders...</p>
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="orders-empty">
        <UserNavbar />
        <h2>No orders found</h2>
        <p>Go shopping and place your first order!</p>
      </div>
    );

  return (
    <div className="orders-page">
      <UserNavbar />
      <div className="orders-container">
        <h2 className="orders-heading">Your Orders</h2>

        {orders.map((order) => (
          <div className="order-card" key={order._id}>
            <div className="order-header">
              <div>
                <p>
                  <strong>Order placed:</strong>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Total:</strong> ${order.totalPrice.toFixed(2)}
                </p>
              </div>
              <div className="order-id">
                <p>
                  <strong>Order ID:</strong> {order._id}
                </p>
              </div>
            </div>

            <div className="order-body">
              {order.items.map((item, index) => (
                <div className="order-item" key={index}>
                  <img
                    src={item.imageUrl || "https://via.placeholder.com/100"}
                    alt={item.name}
                  />
                  <div className="order-item-details">
                    <p className="order-item-name">{item.name}</p>
                    <p className="order-item-qty">
                      Qty: {item.quantity} | Price: ${item.price}
                    </p>
                    <p className="order-status">
                      <strong>Status:</strong> {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <p>
                <strong>Shipping Address:</strong> {order.address}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
