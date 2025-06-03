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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-blue-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4 relative">
      {/* ModeToggle restored */}
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-md mx-auto shadow-xl rounded-lg border border-gray-100 dark:border-gray-700">
        <CardHeader className="space-y-3 text-center">
          {/* Logo with a styled "C" and CollegeConnect text */}
          <div className="flex items-center justify-center mb-6">
            <span className="text-blue-600 dark:text-blue-400 text-5xl font-extrabold -mr-1">C</span>
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">ollegeConnect</h1>
          </div>
          {/* Sign In title and description */}
          <CardTitle className="text-2xl font-bold text-gray-700 dark:text-gray-200 mt-2">Sign In</CardTitle>
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
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-md py-2 px-3"
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
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-md py-2 px-3"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition-colors duration-200 ease-in-out"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200 ease-in-out underline">
              Register Your College
            </Link>
          </p>
          <p>
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200 ease-in-out underline">
              Forgot Password?
            </Link>
          </p>
        </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
};

export default LoginPage;