import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/UserNavbar.css"; // ✅ Import external CSS

const UserNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // remove user token
    navigate("/");
  };

  return (
    <nav className="user-navbar">
      <div className="navbar-left">
        <h2 className="navbar-logo">MyShop 🛒</h2>
      </div>
      <div className="navbar-right">
        <Link to="/products" className="navbar-link">Home</Link>
        <Link to="/cart" className="navbar-link">Cart</Link>
        <Link to="/orders" className="navbar-link">My Orders</Link>
        <button onClick={handleLogout} className="navbar-logout">Logout</button>
      </div>
    </nav>
  );
};

export default UserNavbar;
