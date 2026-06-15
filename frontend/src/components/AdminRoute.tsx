import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdminUser } from '../utils/authSession';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('accessToken');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdminUser()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
