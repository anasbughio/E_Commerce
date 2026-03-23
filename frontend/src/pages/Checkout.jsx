import api from "../api/axios";
import UserNavbar from "../components/UserNavbar";
import { useState, useContext } from "react";
import { AuthContext } from "../AuthProvider";
import "../styles/Checkout.css"; // ✅ Import external CSS

const Checkout = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [address, setAddress] = useState("");
  const [cart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const user = currentUser || null;
      const res = await api.post("/stripe/create-checkout-session", {
        products: cart,
        userId: user?.id || "",
        address,
        totalPrice: totalPrice,
      });
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Stripe Checkout error:", err);
      setMessage("❌ Payment failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <UserNavbar />

      <div className="checkout-container">
        <h2 className="checkout-heading">Checkout</h2>

        {cart.length === 0 ? (
          <div className="checkout-empty">
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <div className="checkout-box">
            {/* Left side: Address form */}
            <div className="checkout-left">
              <div className="checkout-section">
                <h3>1. Delivery Address</h3>
                <textarea
                  placeholder="Enter your full delivery address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={4}
                ></textarea>
              </div>

              <div className="checkout-section">
                <h3>2. Review Items</h3>
                <ul>
                  {cart.map((item) => (
                    <li key={item._id} className="checkout-item">
                      <img
                        src={item.imageUrl || "https://via.placeholder.com/100"}
                        alt={item.name}
                      />
                      <div className="checkout-item-info">
                        <p className="checkout-item-name">{item.name}</p>
                        <p className="checkout-item-qty">
                          Qty: {item.quantity}
                        </p>
                        <p className="checkout-item-price">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right side: Summary + payment */}
            <div className="checkout-right">
              <div className="checkout-summary">
                <h3>Order Summary</h3>
                <p>
                  Items ({cart.length}):{" "}
                  <span>${totalPrice.toFixed(2)}</span>
                </p>
                <p>
                  Delivery: <span>FREE</span>
                </p>
                <hr />
                <h4>
                  Order Total: <span>${totalPrice.toFixed(2)}</span>
                </h4>

                <button
                  onClick={handleCheckout}
                  disabled={loading || !address}
                  className={`checkout-btn ${
                    loading || !address ? "disabled" : ""
                  }`}
                >
                  {loading ? "Redirecting..." : "Place your order with Stripe"}
                </button>

                {message && (
                  <p
                    className={`checkout-message ${
                      message.startsWith("✅")
                        ? "success"
                        : "error"
                    }`}
                  >
                    {message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
