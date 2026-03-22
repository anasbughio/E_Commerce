// src/pages/AdminReviews.jsx
import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/AdminReviews.css"; // ✅ Import CSS file
import AdminNavbar from "../components/AdminNavbar";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get("/products/admin/reviews", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const deleteReview = async (productId, reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`/products/admin/reviews/${productId}/${reviewId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchReviews();
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <>
    <AdminNavbar />
    <div className="admin-reviews-container">
      <h2 className="admin-reviews-title">📝 Product Reviews</h2>

      {reviews.length === 0 ? (
        <p className="no-reviews">No reviews found.</p>
      ) : (
        <div className="table-container">
          <table className="reviews-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>User</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((rev) => (
                <tr key={rev._id}>
                  <td>{rev.productName}</td>
                  <td>{rev.name}</td>
                  <td className="rating">{rev.rating} ⭐</td>
                  <td className="comment">{rev.comment}</td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => deleteReview(rev.productId, rev._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </>
  );
};

export default AdminReviews;
