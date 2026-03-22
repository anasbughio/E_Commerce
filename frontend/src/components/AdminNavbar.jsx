import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/AdminNavbar.css";

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-left">
        <h2 className="admin-logo">Amazon Admin</h2>
      </div>
      <div className="admin-navbar-right">
        <Link to="/admin/dashboard" className="admin-link">Dashboard</Link>
        <Link to="/admin/orders" className="admin-link">Active Orders</Link>
        <Link to="/admin/orders/history" className="admin-link">Order History</Link>
        <Link to="/admin/products" className="admin-link">Products</Link>
        <Link to="/admin/reviews" className="admin-link">Reviews</Link>
        <button onClick={handleLogout} className="admin-logout">Logout</button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
