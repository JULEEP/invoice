// src/Pages/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredAccess }) => {
  // Check if user is admin (using adminId)
  const isAdmin = localStorage.getItem('adminId') !== null;
  
  // Get employee data if exists
  const employeeId = localStorage.getItem('employeeId');
  const pagesAccess = JSON.parse(localStorage.getItem('pagesAccess') || '[]');
  
  // If user is admin, allow access to everything
  if (isAdmin) {
    return children;
  }
  
  // If employee but no employee ID, redirect to login
  if (!employeeId) {
    return <Navigate to="/employee-login" replace />;
  }
  
  // Check if employee has access to the required page
  const hasAccess = pagesAccess.includes(requiredAccess);
  
  // If no access, redirect to first accessible page
  if (!hasAccess) {
    const accessiblePage = pagesAccess.includes('/dashboard') 
      ? '/dashboard' 
      : pagesAccess[0] || '/dashboard';
    return <Navigate to={accessiblePage} replace />;
  }
  
  // If has access, render the children
  return children;
};

export default ProtectedRoute;