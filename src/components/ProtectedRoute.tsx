import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles, children }: { allowedRoles?: string[], children?: React.ReactNode }) => {
  const { user, userData, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && userData && !allowedRoles.includes(userData.role)) return <Navigate to="/" />;

  return children ? <>{children}</> : <Outlet />;
};
