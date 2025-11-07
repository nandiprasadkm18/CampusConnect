import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check if user info (and token) is in localStorage
  const userInfo = localStorage.getItem('user');

  // If logged in, render the component (via <Outlet />)
  // If not, redirect to the /login page
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;