import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider'; // import the AuthProvider

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // If there's no user, redirect to login
    return <Navigate to="/login" />;
  }

  return children;
};
