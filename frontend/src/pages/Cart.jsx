import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import UserNavbar from "../components/UserNavbar";
import "../styles/Cart.css"; // ✅ Import the CSS file

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotalPrice } =
    useCart();

  const validCart = cart.filter((item) => item && item._id);

  if (validCart.length === 0) {
    return (
      <div className="cart-empty-page">
        <UserNavbar />
        <div className="cart-empty-box">
          <h2>Your Amazon Cart is empty</h2>
          <p>Check your saved items or continue shopping.</p>
          <Link to="/products" className="cart-btn-yellow">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <UserNavbar />
      <div className="cart-container">
        {/* LEFT: Cart items */}
        <div className="cart-items-section">
          <h2>Shopping Cart</h2>

          {validCart.map((item) => (
            <div key={item._id} className="cart-item">
              <img
                src={item.imageUrl || "https://via.placeholder.com/120"}
                alt={item.name}
              />

              <div className="cart-item-info">
                <Link to={`/products/${item._id}`} className="cart-item-title">
                  {item.name}
                </Link>
                <p className="cart-stock">In stock — Eligible for FREE Delivery</p>
                <p className="cart-returns">FREE Returns</p>
                <p className="cart-price">${item.price}</p>

                <div className="cart-actions">
                  <label>Qty:</label>
                  <select
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item._id, parseInt(e.target.value) || 1)
                    }
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="cart-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="cart-subtotal">
            Subtotal ({validCart.length} items):{" "}
            <span>${getTotalPrice().toFixed(2)}</span>
          </div>
        </div>

        {/* RIGHT: Checkout summary */}
        <div className="cart-summary">
          <h3>
            Subtotal ({validCart.length} items):{" "}
            <span>${getTotalPrice().toFixed(2)}</span>
          </h3>
          <div className="cart-gift">
            <input type="checkbox" />
            <span>This order contains a gift</span>
          </div>

          <Link to="/checkout" className="cart-btn-yellow full">
            Proceed to Checkout
          </Link>

          <button onClick={clearCart} className="cart-btn-gray">
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
