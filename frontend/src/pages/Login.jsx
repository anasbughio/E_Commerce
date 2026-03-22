import React, { useState, useContext } from "react";
import { AuthContext } from "../AuthProvider";
import { useNavigate,Link } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      console.log("Login component: Access token received:", res.data.accessToken);
      alert("Login successful!");
      navigate("/products");
    } catch (error) {
      console.error("Login component error:", error.response?.data || error.message);
      alert("Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Sign in</h1>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email">Email or mobile phone number</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <button type="submit" className="login-btn">Sign In</button>
        </form>

        <p className="login-help">
  By continuing, you agree to our{" "}
  <Link to="/terms">Terms of Use</Link> and{" "}
  <Link to="/privacy">Privacy Policy</Link>.
</p>

        <div className="divider">
          <span>New to our store?</span>
        </div>

        <button
          className="create-account-btn"
          onClick={() => navigate("/register")}
        >
          Create your account
        </button>
        <button
          className="create-account-btn"
          onClick={() => navigate("admin")}
        >
          Admin Login
        </button>
      </div>
    </div>
  );
};

export default Login;
