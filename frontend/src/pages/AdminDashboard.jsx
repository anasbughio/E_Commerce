import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AdminNavbar from "../components/AdminNavbar";
import "../styles/AdminDashboard.css"; // ✅ linked separate CSS file

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    const res = await axios.get("/admin/dashboard", {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    });
    setStats(res.data);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (!stats) return <p className="loading">Loading...</p>;

  const monthlyData = stats.monthlySales.map((m) => ({
    month: new Date(2025, m._id - 1).toLocaleString("default", { month: "short" }),
    total: m.total,
  }));

  return (
    <div className="admin-dashboard">
      <AdminNavbar />
      <div className="dashboard-container">
        <h2 className="dashboard-title">Admin Analytics Dashboard</h2>

        <div className="stats-grid">
          <div className="stat-card blue">
            <h3>Total Orders</h3>
            <p>{stats.totalOrders}</p>
          </div>
          <div className="stat-card green">
            <h3>Total Sales</h3>
            <p>${stats.totalSales.toFixed(2)}</p>
          </div>
          <div className="stat-card yellow">
            <h3>Total Products</h3>
            <p>{stats.totalProducts}</p>
          </div>
          <div className="stat-card purple">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
        </div>

        <div className="chart-section">
          <h3>Monthly Revenue</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#ff9900" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
