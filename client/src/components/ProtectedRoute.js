import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0f0c29',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className="spinner-border text-danger mb-3"
          style={{ width: 48, height: 48 }} />
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>
          Loading CampusAlert...
        </p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirect = user.role === 'admin'
      ? '/admin'
      : user.role === 'staff'
      ? '/staff'
      : '/student';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default ProtectedRoute;