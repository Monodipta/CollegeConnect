import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // For description
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For current logo display
import { Loader2, MailIcon, MapPinIcon, PhoneIcon, BuildingIcon, GlobeIcon } from 'lucide-react'; // Icons

import useAuthStore from '@/store/authStore';
import collegeService from '@/services/collegeService';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const EditProfilePage = () => {
  const { user: collegeUser, isLoading, error, setUser, setError, setLoading, logout } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // New password (optional)
  const [confirmPassword, setConfirmPassword] = useState(''); // Confirm new password
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [newLogo, setNewLogo] = useState(null); // State for new logo file
  const [currentLogoUrl, setCurrentLogoUrl] = useState(null); // State to display current logo

  const navigate = useNavigate();
  const { toast } = useToast();
  const [pageLoading, setPageLoading] = useState(true); // For initial data fetch

  const constructLogoUrl = (logoPath) => {
    return logoPath ? `${import.meta.env.VITE_BACKEND_URL.replace('/api', '')}${logoPath}` : null;
  };

  // Effect to fetch and pre-fill data
  useEffect(() => {
    if (!collegeUser) {
      navigate('/login');
      return;
    }

    const fetchAndPrefillProfile = async () => {
      try {
        setPageLoading(true);
        const data = await collegeService.getMyProfile();
        setName(data.name || '');
        setEmail(data.email || '');
        setAddress(data.address || '');
        setCity(data.city || '');
        setState(data.state || '');
        setCountry(data.country || '');
        setDescription(data.description || '');
        setWebsite(data.website || '');
        setContactNumber(data.contactNumber || '');
        setCurrentLogoUrl(constructLogoUrl(data.logo)); // Set current logo URL
      } catch (err) {
        console.error('Failed to fetch college profile for editing:', err);
        const message = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : err.message;
        setError(message);
        toast({
          title: "Error Loading Profile",
          description: message,
          variant: "destructive",
        });
        if (err.response && err.response.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setPageLoading(false);
      }
    };

    fetchAndPrefillProfile();
  }, [collegeUser, navigate, logout, setError, toast]);


  // Effect to show backend errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Update Error",
        description: error,
        variant: "destructive",
      });
      setError(null);
    }
  }, [error, toast, setError]);


  const submitHandler = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true); // For form submission
    const formData = new FormData();

    // Append all fields, even if not changed, to ensure backend gets complete data
    formData.append('name', name);
    formData.append('email', email);
    formData.append('address', address);
    formData.append('city', city);
    formData.append('state', state);
    formData.append('country', country);
    formData.append('description', description);
    formData.append('website', website);
    formData.append('contactNumber', contactNumber);

    if (password) { // Only append password if it's being changed
      formData.append('password', password);
    }

    // Handle logo upload:
    // If a new file is selected: append it
    if (newLogo) {
      formData.append('logo', newLogo);
    } else if (currentLogoUrl === null && collegeUser.logo !== '/uploads/default_college_logo.png') {
        // This is a complex scenario: if currentLogoUrl (from frontend state) is cleared (set to null)
        // AND the user previously had a non-default logo, it implies they want to clear it.
        // A simpler approach: if the file input is left empty, the backend keeps existing.
        // If the user *explicitly wants to remove* the logo, they need a "Remove Logo" button.
        // For now, if newLogo is null, we don't append 'logo' to FormData, and backend keeps existing.
        // If they want to remove it, they need to select a default image or we need a specific 'remove_logo' flag.
        // Let's assume for now, if newLogo is null, logo field is not touched in FormData.
        // To allow removing, we'd add a checkbox "Remove current logo" and send a flag.
        // For now, we'll make it so if a new logo isn't selected, the old one remains.
    }


    try {
      const updatedCollege = await collegeService.updateProfile(formData);
      setUser(updatedCollege); // Update Zustand store with new data
      toast({
        title: "Profile Updated",
        description: "Your college profile has been successfully updated!",
      });
      navigate('/profile'); // Go back to view profile
    } catch (err) {
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-blue-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
        <p className="text-xl text-gray-700 dark:text-gray-300 font-medium">Loading Profile for Editing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-blue-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-3xl mx-auto shadow-2xl rounded-xl border border-gray-100 dark:border-gray-700 p-6 md:p-8">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-3xl font-bold">Edit College Profile</CardTitle>
          <CardDescription>Update your college details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {/* Current Logo Display */}
            <div className="col-span-full flex flex-col items-center mb-4">
              <Label htmlFor="currentLogo" className="text-sm font-semibold mb-2">Current Logo:</Label>
              <Avatar className="w-24 h-24 border-4 border-blue-600 dark:border-blue-400 shadow-md">
                {currentLogoUrl ? (
                  <AvatarImage src={currentLogoUrl} alt={`${name} Logo`} />
                ) : (
                  <AvatarFallback className="text-3xl font-semibold bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400">{name.charAt(0) || 'C'}</AvatarFallback>
                )}
              </Avatar>
              {/* Option to clear logo (future feature if needed) */}
            </div>

            {/* Input Fields */}
            <div className="grid gap-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <BuildingIcon className="h-4 w-4 text-muted-foreground" /> College Name:
              </Label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <MailIcon className="h-4 w-4 text-muted-foreground" /> Contact Email:
              </Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            {/* Password Fields (Optional) */}
            <div className="grid gap-2">
              <Label htmlFor="password">New Password (Optional)</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>

            {/* Address Details */}
            <div className="grid gap-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-muted-foreground" /> Address:
              </Label>
              <Input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City:</Label>
              <Input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State:</Label>
              <Input id="state" type="text" value={state} onChange={(e) => setState(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country">Country:</Label>
              <Input id="country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} required />
            </div>

            {/* Description and Optional Fields */}
            <div className="grid gap-2 col-span-full">
              <Label htmlFor="description" className="flex items-center gap-2">
                <BuildingIcon className="h-4 w-4 text-muted-foreground" /> Description:
              </Label>
              <Textarea id="description" placeholder="Tell us about your college..." value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <GlobeIcon className="h-4 w-4 text-muted-foreground" /> Website (Optional):
              </Label>
              <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://www.yourcollege.edu" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactNumber" className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-muted-foreground" /> Contact Number (Optional):
              </Label>
              <Input id="contactNumber" type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="+1234567890" />
            </div>

            {/* New Logo Upload */}
            <div className="grid gap-2 col-span-full">
              <Label htmlFor="newLogo" className="flex items-center gap-2">
                <BuildingIcon className="h-4 w-4 text-muted-foreground" /> Upload New Logo (Optional):
              </Label>
              <Input id="newLogo" type="file" accept="image/*" onChange={(e) => setNewLogo(e.target.files[0])} />
              {newLogo && <p className="text-sm text-gray-500">Selected new file: {newLogo.name}</p>}
            </div>

            {/* Buttons */}
            <div className="col-span-full flex justify-center mt-6 space-x-4">
              <Button
                type="submit"
                className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-md shadow-md transition-colors duration-200 ease-in-out transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {isLoading ? 'Updating...' : 'Update Profile'}
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/profile')}
                variant="outline"
                className="px-8 py-3 text-lg border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 font-semibold rounded-md shadow-md transition-colors duration-200 ease-in-out transform hover:scale-105"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
};

export default EditProfilePage;