import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Loading clinical session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    if (user?.role === 'doctor') {
      return <Navigate to="/doctor" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Patient profile completion check
  if (
    user?.role === 'patient' &&
    !user?.profileCompleted &&
    location.pathname !== '/onboarding'
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;
