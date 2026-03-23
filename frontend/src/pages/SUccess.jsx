import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../api/axios";
import "../styles/Success.css";

const SUccess = () => {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");
      
      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        await api.post("/stripe/verify-session", { sessionId });
        setStatus("success");
        clearCart();
      } catch (err) {
        console.error("Session verification failed:", err);
        setStatus("error");
      }
    };

    verifyPayment();
  }, [searchParams, clearCart]);

  if (status === "verifying") {
    return (
      <div className="success-container">
        <div className="success-box">
          <h2>Verifying your payment...</h2>
          <p>Please wait while we confirm your order.</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="success-container">
        <div className="success-box">
          <h2>Payment Verification Failed</h2>
          <p>We could not verify your payment session. If your card was charged, please contact support.</p>
          <button onClick={() => navigate("/products")} className="success-continue-btn">
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="success-container">
      <div className="success-box">
        <div className="success-icon">✅</div>
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase. Your order has been placed successfully.</p>
        <button onClick={() => navigate('/products')} className="success-continue-btn">
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default SUccess;
