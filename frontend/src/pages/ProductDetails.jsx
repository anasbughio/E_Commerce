import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../api/axios";
import "../styles/ProductDetails.css"; // 👈 add CSS
import UserNavbar from "../components/UserNavbar";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  // Review state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProductDetails = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      const data = res.data.product || res.data;
      setProduct(data);
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Failed to load product details.");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  const fetchProductDetails = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      const data = res.data.product || res.data;
      setProduct(data);
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Failed to load product details.");
    } finally {
      setLoading(false);
    }
  };

  fetchProductDetails();
}, [id]);

  const handleSubmitReview = async () => {
    if (!rating || !comment.trim()) {
      alert("Please select a rating and write a comment.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.post(
        `/products/${id}/reviews`,
        { rating, comment },
        { withCredentials: true }
      );
      alert(res.data.message || "Review submitted!");
      setComment("");
      setRating(0);
      await fetchProductDetails();
    } catch (err) {
      console.error("Review submission failed:", err);
      alert(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading product details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="no-product">No product found.</div>;

  return (
    <>
    <UserNavbar />
    <div className="product-page">
    
      <div className="product-container">
        {/* Left Section — Image */}
        <div className="product-image">
          <img
            src={
              product.image?.url ||
              product.imageUrl ||
              "https://via.placeholder.com/400"
            }
            alt={product.name}
          />
        </div>

        {/* Right Section — Details */}
        <div className="product-info">
          <h2>{product.name}</h2>
          <p className="product-category">
            Category: <span>{product.category || "N/A"}</span>
          </p>

          <div className="product-price">
            <span>${product.price}</span>
          </div>

          <p className="product-description">
            {product.description || "No description available."}
          </p>

          <p className="product-stock">
            {product.stock > 0 ? (
              <span className="in-stock">In Stock</span>
            ) : (
              <span className="out-stock">Out of Stock</span>
            )}
          </p>

          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="add-to-cart-btn"
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h3>Customer Reviews</h3>

        {product.reviews?.length > 0 ? (
          product.reviews.map((r, index) => (
            <div className="review-card" key={index}>
              <strong>{r.name || "Anonymous"}</strong>
              <div className="review-rating">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </div>
              <p>{r.comment}</p>
              <small>{new Date(r.createdAt).toLocaleDateString()}</small>
            </div>
          ))
        ) : (
          <p>No reviews yet. Be the first to review!</p>
        )}

        {/* Add Review */}
        <div className="add-review">
          <h4>Leave a Review</h4>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                className={star <= rating ? "star selected" : "star"}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            placeholder="Write your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>

          <button
            onClick={handleSubmitReview}
            disabled={submitting}
            className="submit-review-btn"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProductDetails;
