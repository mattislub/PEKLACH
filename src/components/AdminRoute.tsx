import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { state } = useAuth();

  if (!state.isAuthenticated || !state.isAdmin) {
    // Redirect to admin login page
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
}