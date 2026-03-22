import React, { useContext, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../AuthProvider';

const PrivateController = () => {
  const { accessToken, loading } = useContext(AuthContext);

  useEffect(() => {
    console.log('PrivateController: accessToken:', accessToken ? accessToken.slice(0, 10) + '...' : null, 'loading:', loading);
  }, [accessToken, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return accessToken ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateController;