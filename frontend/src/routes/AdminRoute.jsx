import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../AuthProvider';

export default function AdminRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>; // wait for refresh to finish
  if (!user) return <Navigate to="/login" replace />;
  if (!user.roles || !user.roles.includes('admin')) return <Navigate to="/admin" replace />;

  return children;
}
