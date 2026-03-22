import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/Register.css"; // 👈 import the CSS file

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNo, setPhoneNo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
        phoneNo,
      });
      if (res.status === 201) {
        alert("Registration successful! Please login.");
      } else {
        alert("Registration failed");
      }
    } catch (err) {
      console.error("Error during registration:", err);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Create Your Account</h2>
        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Phone Number</label>
          <input
            type="text"
            placeholder="Enter your phone number"
            value={phoneNo}
            onChange={(e) => setPhoneNo(e.target.value)}
            required
          />

          <button type="submit" className="reg">Register</button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
