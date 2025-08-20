import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaLock, FaExclamationTriangle } from 'react-icons/fa';

const RoleBasedRoute = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/dashboard',
  showAccessDenied = true 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    if (showAccessDenied) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <FaLock className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-sm mb-4">
                You don't have permission to access this page. 
                This page is restricted to: <strong>{allowedRoles.join(', ')}</strong>
              </p>
              <p className="text-xs text-red-600">
                Your current role: <strong>{user.role}</strong>
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleBasedRoute;

