import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom'; // Added useParams
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from '@/components/mode-toggle';
import authService from '@/services/authService';
import useAuthStore from '@/store/authStore';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from 'lucide-react'; // Added Loader2

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true); // State to check token validity (initial assumption)

  const { user, setError } = useAuthStore();
  const navigate = useNavigate();
  const { token } = useParams(); // Get token from URL
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/'); // Redirect if already logged in
    }
    // Basic check: if token is missing from URL
    if (!token) {
        setIsTokenValid(false);
        toast({
            title: "Invalid Link",
            description: "Password reset token is missing from the URL.",
            variant: "destructive",
        });
    }
  }, [user, navigate, token, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Please enter and confirm your new password.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.resetPasswordConfirm(token, password);
      toast({
        title: "Password Reset Successful",
        description: response.message, // Backend sends success message
      });
      navigate('/login'); // Redirect to login page
    } catch (err) {
      console.error('Password reset failed:', err);
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message;
      setError(message); // Store error in Zustand
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      // If token is invalid/expired, ensure it reflects on UI
      if (err.response && (err.response.status === 400 || err.response.status === 401)) {
          setIsTokenValid(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isTokenValid) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-blue-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4 relative">
              <div className="absolute top-4 right-4 z-10">
                  <ModeToggle />
              </div>
              <Card className="w-full max-w-md mx-auto shadow-xl rounded-lg border border-gray-100 dark:border-gray-700 text-center py-8">
                  <CardTitle className="text-2xl font-bold text-destructive">Invalid or Expired Link</CardTitle>
                  <CardDescription className="mt-4 text-gray-600 dark:text-gray-400">
                      The password reset link is invalid or has expired. Please request a new one.
                  </CardDescription>
                  <div className="mt-6">
                      <Link to="/forgot-password">
                          <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold">
                              Request New Link
                          </Button>
                      </Link>
                  </div>
              </Card>
              <Toaster />
          </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-blue-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4 relative">
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-md mx-auto shadow-xl rounded-lg border border-gray-100 dark:border-gray-700">
        <CardHeader className="space-y-3 text-center">
          <div className="flex items-center justify-center mb-6">
            <span className="text-blue-600 dark:text-blue-400 text-5xl font-extrabold -mr-1">C</span>
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">ollegeConnect</h1>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-700 dark:text-gray-200 mt-2">Reset Password</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-md py-2 px-3"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password" className="text-gray-700 dark:text-gray-200">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-md py-2 px-3"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition-colors duration-200 ease-in-out"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
};

export default ResetPasswordPage;