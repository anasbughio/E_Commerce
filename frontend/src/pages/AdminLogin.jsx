import React, { useState } from 'react';
import axios from '../api/axios';
import { useNavigate ,Link} from 'react-router-dom';
import '../styles/AdminLogin.css'; // ✅ Import external CSS file

const AdminLogin = ({ onLogin }) => {
  // const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', { email, password });
      if (res.data.roles.includes('admin')) {
        localStorage.setItem('adminToken', res.data.token);
        window.location.href = '/admin/dashboard';
        onLogin();
      } else {
        setError('Access denied: You are not an admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">
        <h2 className="admin-login-title">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="admin-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-input"
            required
          />
          <button type="submit" className="admin-login-btn">
            Sign in
          </button>
          {error && <p className="admin-error">{error}</p>}
        </form>

        <div className="admin-login-footer">
       <p className="login-link">
          Customer login <Link to="/">Login here</Link>
        </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
