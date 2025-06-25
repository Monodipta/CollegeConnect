import React from 'react';
import { Navigate, Outlet } from 'react-router-dom'; // Outlet is used to render child routes
import useAuthStore from '@/store/authStore';
import { Loader2 } from 'lucide-react'; // For a loading indicator

const ProtectedAdminRoute = () => {
  const { user, isLoading } = useAuthStore(); // Access user and isLoading from store

  if (isLoading) {
    // Show a loading spinner or message while authentication status is being determined
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="ml-2 text-lg">Loading user session...</p>
      </div>
    );
  }

  // Check if user is logged in AND has the 'admin' role
  if (user && user.role === 'admin') {
    return <Outlet />; // Render the child route component
  } else {
    // If not authenticated or not admin, redirect to home
    return <Navigate to="/" replace />; // Redirect to home page
  }
};

export default ProtectedAdminRoute;