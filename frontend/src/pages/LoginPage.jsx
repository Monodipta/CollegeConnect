import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from '@/components/mode-toggle'; // Restored ModeToggle import
import authService from '@/services/authService';
import useAuthStore from '@/store/authStore';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { user, isLoading, error, setUser, setError, setLoading } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
    if (error) {
      toast({
        title: "Login Error",
        description: error,
        variant: "destructive",
      });
      setError(null);
    }
  }, [user, error, navigate, toast, setError]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedInCollege = await authService.login({ email, password });
      setUser(loggedInCollege);
      toast({
        title: "Login Successful",
        description: "You have successfully logged in!",
      });
      navigate('/');
    } catch (err) {
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message;
      setError(message);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-200 via-purple-200 to-blue-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* ModeToggle restored */}
      <div className="absolute z-10 top-4 right-4">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-md mx-auto border border-gray-100 rounded-lg shadow-xl dark:border-gray-700">
        <CardHeader className="space-y-3 text-center">
          {/* Logo with a styled "C" and CollegeConnect text */}
          <div className="flex items-center justify-center mb-6">
            <span className="-mr-1 text-5xl font-extrabold text-blue-600 dark:text-blue-400">C</span>
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">ollegeConnect</h1>
          </div>
          {/* Sign In title and description */}
          <CardTitle className="mt-2 text-2xl font-bold text-gray-700 dark:text-gray-200">Sign In</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Access your college communication dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitHandler} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">College Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="px-3 py-2 bg-white border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-200"  >Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="px-3 py-2 bg-white border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full py-2 font-semibold text-white transition-colors duration-200 ease-in-out bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
            <p className="mb-2">Don't have an account?{" "}
              <Link to="/register" className="font-medium text-blue-600 underline transition-colors duration-200 ease-in-out hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Register Your College
              </Link>
            </p>
            <p>
              <Link to="/forgot-password" className="font-medium text-blue-600 underline transition-colors duration-200 ease-in-out hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Forgot Password?
              </Link>
            </p>
          </div>

          <div className="relative my-4"> {/* Separator */}
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-card text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full py-2 font-semibold text-gray-800 transition-colors duration-200 ease-in-out bg-white border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            onClick={() => navigate('/admin-login')} // NEW: Navigate to admin login page
          >
            Admin Login
          </Button>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
};

export default LoginPage;