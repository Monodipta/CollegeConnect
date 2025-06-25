import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for logout redirect
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsersIcon, ArchiveIcon, CalendarIcon, MessageCircleIcon, LogOutIcon } from 'lucide-react'; // Import LogOutIcon
import { ModeToggle } from '@/components/mode-toggle'; // Import ModeToggle
import useAuthStore from '@/store/authStore'; // Import auth store for logout
import authService from '@/services/authService'; // Import auth service for logout

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore(); // Access logout function from store

  const handleLogout = () => {
    authService.logout(); // Call auth service logout
    logout(); // Clear Zustand state
    navigate('/admin-login'); // Redirect to admin login page
  };

  return (
    <div className="container relative px-4 py-8 mx-auto md:px-6 lg:px-8"> {/* Added relative for positioning */}
      {/* Light/Dark Mode Toggle (Top Right) */}
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <h1 className="mb-8 text-4xl font-extrabold text-center text-gray-800 dark:text-gray-100">
        Admin <span className="text-red-600 dark:text-red-400">Dashboard</span>
      </h1>

      <p className="mb-8 text-lg text-center text-gray-700 dark:text-gray-300">
        Welcome, Administrator! Use this dashboard to manage platform data.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Removed Manage Colleges Section */}
        {/* The 'Manage Colleges' card was here and is now removed */}

        <Card className="transition-shadow border border-gray-100 shadow-lg dark:border-gray-700 hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-bold">Manage Resources</CardTitle>
            <ArchiveIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">Oversee and manage all shared resources.</p>
            <Link to="/admin/manage-resources">
              <Button className="w-full">Go to Management</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="transition-shadow border border-gray-100 shadow-lg dark:border-gray-700 hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-bold">Manage Events</CardTitle>
            <CalendarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">Control and manage all listed events.</p>
            <Link to="/admin/manage-events">
              <Button className="w-full">Go to Management</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="transition-shadow border border-gray-100 shadow-lg dark:border-gray-700 hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-bold">Manage Forum Posts</CardTitle>
            <MessageCircleIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">Moderate and manage all forum discussions.</p>
            <Link to="/admin/manage-forum">
              <Button className="w-full">Go to Management</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Logout Button (Bottom Right or wherever visually appropriate) */}
      <div className="mt-8 text-center">
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="flex items-center gap-2 px-6 py-2 mx-auto"
        >
          <LogOutIcon className="w-5 h-5" /> Admin Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboardPage;