import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from '@/components/mode-toggle';
import authService from '@/services/authService';
import useAuthStore from '@/store/authStore';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Loader2, UserIcon } from 'lucide-react';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, setError, setUser } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin'); // Redirect to admin dashboard if already logged in as admin
    } else if (user && user.role !== 'admin') {
      navigate('/'); // Redirect regular college users to home if they somehow land here
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const adminUser = await authService.adminLogin({ username, password });
      setUser(adminUser); // Set admin user in Zustand store
      toast({
        title: "Admin Login Successful",
        description: `Welcome, ${adminUser.name}!`,
      });
      navigate('/admin'); // Redirect to admin dashboard
    } catch (err) {
      console.error('Admin login failed:', err);
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message;
      setError(message); // Store error in Zustand
      toast({
        title: "Admin Login Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-200 via-purple-200 to-blue-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="absolute z-10 top-4 right-4">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-md mx-auto border border-gray-100 rounded-lg shadow-xl dark:border-gray-700">
        <CardHeader className="space-y-3 text-center">
          <div className="flex items-center justify-center mb-6">
            <span className="-mr-1 text-5xl font-extrabold text-blue-600 dark:text-blue-400">C</span>
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">ollegeConnect</h1>
          </div>
          <CardTitle className="mt-2 text-2xl font-bold text-gray-700 dark:text-gray-200">Admin Sign In</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Use your super administrator credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username" className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <UserIcon className="w-4 h-4 text-muted-foreground" /> Admin Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="e.g., superadmin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="px-3 py-2 bg-white border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">Admin Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="px-3 py-2 bg-white border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full py-2 font-semibold text-white transition-colors duration-200 ease-in-out bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Admin Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-sm text-center">
            <Link to="/login" className="font-medium text-blue-600 underline transition-colors duration-200 ease-in-out hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Back to College Login
            </Link>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
};

export default AdminLoginPage;