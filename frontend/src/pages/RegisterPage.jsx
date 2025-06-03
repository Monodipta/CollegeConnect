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
import { Textarea } from "@/components/ui/textarea";

// Remember to install Textarea if you haven't: npx shadcn-ui@latest add textarea

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [logo, setLogo] = useState(null); // State for the logo file

  // New states for real-time validation feedback
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [emailError, setEmailError] = useState('');

  const { user, isLoading, error, setUser, setError, setLoading } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Effect to check password matching in real-time
  useEffect(() => {
    if (confirmPassword === '') {
      setPasswordsMatch(true); // No mismatch if confirm is empty
    } else {
      setPasswordsMatch(password === confirmPassword);
    }
  }, [password, confirmPassword]);

  // Effect to handle errors from authStore
  useEffect(() => {
    if (user) {
      navigate('/'); // Redirect if already logged in (as a college)
    }
    if (error) {
      toast({
        title: "Registration Error",
        description: error,
        variant: "destructive",
      });
      setError(null); // Clear error after showing
    }
  }, [user, error, navigate, toast, setError]);

  // Email validation function
  const validateEmail = (inputEmail) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (inputEmail && !emailRegex.test(inputEmail)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Final client-side checks before sending to backend
    if (!passwordsMatch) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match. Please check your password fields.",
        variant: "destructive",
      });
      return;
    }

    if (emailError) {
      toast({
        title: "Validation Error",
        description: emailError,
        variant: "destructive",
      });
      return;
    }

    // Basic required fields check
    if (!name || !email || !password || !confirmPassword || !address || !city || !state || !country || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('address', address);
    formData.append('city', city);
    formData.append('state', state);
    formData.append('country', country);
    formData.append('description', description);
    if (website) formData.append('website', website);
    if (contactNumber) formData.append('contactNumber', contactNumber);
    if (logo) formData.append('logo', logo); // Append the file

    try {
      const newCollege = await authService.register(formData);
      setUser(newCollege);
      toast({
        title: "Registration Successful",
        description: "Welcome! Your college account has been created.",
      });
      navigate('/'); // Redirect to home page or dashboard
    } catch (err) {
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      name &&
      email &&
      password &&
      confirmPassword &&
      address &&
      city &&
      state &&
      country &&
      description &&
      passwordsMatch &&
      !emailError
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-blue-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4 relative">
      {/* ModeToggle restored */}
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-lg border border-gray-100 dark:border-gray-700">
        <CardHeader className="space-y-3 text-center">
          {/* CollegeConnect logo text */}
          <div className="flex items-center justify-center mb-6">
            <span className="text-blue-600 dark:text-blue-400 text-5xl font-extrabold -mr-1">C</span>
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">ollegeConnect</h1>
          </div>
          {/* Registration title and description */}
          <CardTitle className="text-2xl font-bold text-gray-700 dark:text-gray-200 mt-2">Register Your College</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Enter your college details to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Basic Details */}
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-200">College Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your college name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-md py-2 px-3"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">Contact Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                onBlur={(e) => validateEmail(e.target.value)}
                required
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-md py-2 px-3"
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">Password</Label>
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
            <div className="grid gap-2">
              <Label htmlFor="confirm-password" className="text-gray-700 dark:text-gray-200">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-md py-2 px-3"
              />
              {confirmPassword !== '' && !passwordsMatch && (
                <p className="text-red-500 text-sm mt-1">Passwords do not match!</p>
              )}
              {confirmPassword !== '' && passwordsMatch && (
                <p className="text-green-600 text-sm mt-1">Passwords match!</p>
              )}
            </div>

            {/* Address Details */}
            <div className="grid gap-2">
              <Label htmlFor="address" className="text-gray-700 dark:text-gray-200">Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="House number, street, city
"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-md py-2 px-3"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city" className="text-gray-700 dark:text-gray-200">City</Label>
              <Input
                id="city"
                type="text"
                placeholder="Enter your city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-md py-2 px-3"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state" className="text-gray-700 dark:text-gray-200">State</Label>
              <Input
                id="state"
                type="text"
                placeholder="Enter your state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-md py-2 px-3"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country" className="text-gray-700 dark:text-gray-200">Country</Label>
              <Input
                id="country"
                type="text"
                placeholder="Enter your country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-md py-2 px-3"
              />
            </div>

            {/* Description and Optional Fields */}
            <div className="grid gap-2 col-span-1 md:col-span-2">
              <Label htmlFor="description" className="text-gray-700 dark:text-gray-200">College Description</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your college..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-md py-2 px-3"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="website" className="text-gray-700 dark:text-gray-200">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://www.yourcollege.edu"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-md py-2 px-3"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactNumber" className="text-gray-700 dark:text-gray-200">Contact Number (Optional)</Label>
              <Input
                id="contactNumber"
                type="tel"
                placeholder="+91 9876548765"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 rounded-md py-2 px-3"
              />
            </div>

            {/* Logo Upload */}
            <div className="grid gap-2 col-span-1 md:col-span-2">
              <Label htmlFor="logo" className="text-gray-700 dark:text-gray-200">College Logo (Image File)</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={(e) => setLogo(e.target.files[0])}
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded-md py-2 px-3"
              />
              {logo && <p className="text-sm text-gray-500">Selected file: {logo.name}</p>}
            </div>

            <div className="col-span-1 md:col-span-2 pt-4">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition-colors duration-200 ease-in-out"
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? 'Registering...' : 'Register College'}
              </Button>
            </div>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200 ease-in-out underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
};

export default RegisterPage;