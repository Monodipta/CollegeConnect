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
import { Loader2, MailIcon } from 'lucide-react'; // Added MailIcon, Loader2

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, setError } = useAuthStore(); // Only need user to redirect if logged in
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/'); // Redirect if already logged in
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await authService.forgotPasswordRequest(email);
      toast({
        title: "Password Reset Link Sent",
        description: response.data, // Backend sends success message in data
      });
      setEmail(''); // Clear email field
    } catch (err) {
      console.error('Forgot password request failed:', err);
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message;
      setError(message); // Store error in Zustand
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <CardTitle className="text-2xl font-bold text-gray-700 dark:text-gray-200 mt-2">Forgot Password?</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Enter your college email address to receive a password reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <MailIcon className="h-4 w-4 text-muted-foreground" /> College Email Address
              </Label>
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
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition-colors duration-200 ease-in-out"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Reset Link'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <Link to="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200 ease-in-out underline">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
};

export default ForgotPasswordPage;