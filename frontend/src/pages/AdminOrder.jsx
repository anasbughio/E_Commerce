import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../AuthProvider';
import AdminNavbar from '../components/AdminNavbar';
import '../styles/AdminOrders.css'; // ✅ Link to external CSS

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const { loading } = useContext(AuthContext);

  useEffect(() => {
    if (loading) return;

    axios
      .get('/admin/orders', { withCredentials: true })
      .then((res) => setOrders(res.data.orders))
      .catch((err) => console.error('Error fetching orders:', err));
  }, [loading]);

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`/admin/orders/${id}`, { status }, { withCredentials: true });
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-orders-page">
      <AdminNavbar />
      <div className="orders-container">
        <h2 className="orders-title">Admin Order Management</h2>

        {loading ? (
          <p className="loading">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="no-orders">No orders found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Address</th> {/* ✅ Added for order.address */}
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.user?.username || 'N/A'}</td>

                    {/* ✅ Show address (simple string) */}
                    <td>{order.address || 'N/A'}</td>

                    <td>${order.totalPrice.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className="status-dropdown"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
