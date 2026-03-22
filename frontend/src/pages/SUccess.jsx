import { useEffect } from "react";
// import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/Success.css";

const SUccess = () => {
  const { clearCart } = useCart();

  useEffect(() => {
    // 🧹 Clear frontend cart after successful order
    clearCart();
  }, [clearCart]);

  return (
    <div className="success-container">
      <div className="success-box">
        <div className="success-icon">✅</div>
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase. Your order has been placed successfully.</p>
     <button onClick={() => window.location.href = '/products'} className="success-continue-btn">
          Continue Shopping
       </button>
      </div>
    </div>
  );
};

export default SUccess;
