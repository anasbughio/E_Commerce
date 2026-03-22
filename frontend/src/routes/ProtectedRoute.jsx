import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../AuthProvider';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;

  // Optionally block admins from regular user pages:
  if (user.roles && user.roles.includes('admin')) {
    // if admins should not access user pages, redirect them to admin panel
    return <Navigate to="/admin/orders" replace />;
  }

  return children;
}
