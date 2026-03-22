import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthProvider from './AuthProvider';
import AdminRoute from './routes/AdminRoute';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreateProduct from './pages/CreateProduct';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';

import AdminLogin from './pages/AdminLogin';
import AdminOrders from './pages/AdminOrder';
import AdminOrderHistory from './pages/AdminOrderHistory';
import { CartProvider } from './context/CartContext';
import AdminProducts from './pages/AdminProducts';
import AdminReviews from './pages/AdminReviews';
import AdminDashboard from './pages/AdminDashboard';
import SUccess from './pages/SUccess';
import Cancel from './pages/Cancel';

function App() {
  return (
    <CartProvider>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User protected pages */}
          <Route path="/products" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        
          <Route path="/products/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/success" element={<ProtectedRoute><SUccess /></ProtectedRoute>} />
          <Route path="/cancel" element={<ProtectedRoute><Cancel /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin/orders/history" element={<AdminRoute><AdminOrderHistory /></AdminRoute>} />
         <Route path="/create-product" element={<AdminRoute><CreateProduct /></AdminRoute>} />
         <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
         <Route path="/admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
         <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </CartProvider>
  );
}

export default App;
