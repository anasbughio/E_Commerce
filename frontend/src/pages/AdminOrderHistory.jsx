import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../AuthProvider';
import AdminNavbar from '../components/AdminNavbar';
import '../styles/AdminOrderHistory.css'; // ✅ External CSS

const AdminOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const { loading } = useContext(AuthContext);


  useEffect(() => {
    if (loading) return; // wait for AuthProvider
    axios
      .get('/admin/orders/history', { withCredentials: true })
      .then((res) => setOrders(res.data.orders))
      .catch((err) => console.error('Error fetching delivered orders:', err));
  }, [loading]);

  return (
    <div className="admin-history-page">
      <AdminNavbar />

      <div className="history-container">
        <h2 className="history-title">Delivered Orders (History)</h2>

        {orders.length === 0 ? (
          <p className="no-orders">No delivered orders found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Delivered At</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.user?.username || 'N/A'}</td>
                    <td>${order.totalPrice.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.updatedAt).toLocaleString()}</td>
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

export default AdminOrderHistory;
