import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, BuildingIcon, GlobeIcon, PhoneIcon, MapPinIcon, MailIcon, ArrowLeftIcon } from 'lucide-react'; // Icons

import useAuthStore from '@/store/authStore';
import collegeService from '@/services/collegeService';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const OtherCollegeProfilePage = () => {
  const { user: currentUserCollege, logout, setError } = useAuthStore();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams(); // Get the college ID from the URL
  const { toast } = useToast();

  // Construct URL for the college logo safely
  // Uses nullish coalescing (??) for even safer access to properties
  const collegeLogoUrl = profileData?.logo
    ? `${import.meta.env.VITE_BACKEND_URL.replace('/api', '')}${profileData.logo}`
    : null;

  useEffect(() => {
    if (!currentUserCollege) { // Ensure the user viewing is authenticated
      navigate('/login');
      return;
    }
    if (!id) { // If no ID in URL, redirect or show error
      navigate('/colleges'); // Go back to directory if no ID is provided
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        // It's crucial that collegeService.getCollegeProfileById(id) actually returns a valid object.
        console.log(id);
        const data = await collegeService.getCollegeProfileById(id);

        // --- CRUCIAL DEBUGGING LOG ---
        console.log('DEBUG: Data received from collegeService.getCollegeProfileById:', data);
        // --- END CRUCIAL DEBUGGING LOG ---

        // Check if data is valid and has at least the 'name' field
        if (data && typeof data === 'object' && data.name !== undefined && data.name !== null) {
          setProfileData(data);
        } else {
          // If no data, or name field is missing/null/undefined, treat as not found/incomplete
          setProfileData(null); // Explicitly set to null to trigger the "not found" state
          throw new Error('College profile data is incomplete or not found (missing name).');
        }
      } catch (err) {
        console.error('Failed to fetch other college profile:', err);
        const message = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : err.message;
        setError(message);
        toast({
          title: "Profile Error",
          description: message,
          variant: "destructive",
        });
        if (err.response && err.response.status === 401) {
          logout();
          navigate('/login');
        }
        setProfileData(null); // Ensure profileData is null on error to show "not found"
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, currentUserCollege, navigate, logout, setError, toast]); // Add 'id' to dependency array

  // Render Loader while fetching data
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
        <p className="text-xl text-gray-700 dark:text-gray-300 font-medium">Loading College Profile...</p>
      </div>
    );
  }

  // Render "Not Found" message if profileData is null after loading
  if (!profileData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <p className="text-xl text-destructive dark:text-red-400 font-medium mb-4">Could not load profile. College not found or data is incomplete.</p>
        <Button onClick={() => navigate('/colleges')} className="mt-4">
          <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to Directory
        </Button>
      </div>
    );
  }

  // Render the actual profile content once data is loaded and valid
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl rounded-xl border border-gray-100 dark:border-gray-700 p-6 md:p-8">
        <CardHeader className="text-center space-y-3 pb-6">
          {collegeLogoUrl ? (
            <Avatar className="w-24 h-24 mx-auto mb-2 border-4 border-blue-600 dark:border-blue-400 shadow-md">
              <AvatarImage src={collegeLogoUrl} alt={`${profileData.name ?? ''} Logo`} /> {/* Using ?? for alt text */}
              {/* Using nullish coalescing (??) for even safer access to charAt(0) */}
              <AvatarFallback>{profileData.name?.charAt(0) ?? '?'}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="w-24 h-24 mx-auto mb-2 border-4 border-blue-600 dark:border-blue-400 shadow-md">
              {/* Using nullish coalescing (??) for safer access to charAt(0) */}
              <AvatarFallback className="text-3xl font-semibold bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400">{profileData.name?.charAt(0) ?? '?'}</AvatarFallback>
            </Avatar>
          )}
          {/* Using nullish coalescing (??) for safer access and fallback string */}
          <CardTitle className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">{profileData.name ?? 'Unknown College'}</CardTitle>
          <CardDescription className="text-md text-gray-600 dark:text-gray-300">
            {profileData.website ? (
              <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200">
                {profileData.website}
              </a>
            ) : 'No Website Provided'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-left">
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <MailIcon className="h-4 w-4 text-muted-foreground" /> Email:
              </Label>
              <p className="text-base text-gray-800 dark:text-gray-100 pl-6">{profileData.email ?? 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-muted-foreground" /> Location:
              </Label>
              <p className="text-base text-gray-800 dark:text-gray-100 pl-6">
                {[profileData.address, profileData.city, profileData.state, profileData.country]
                  .filter(Boolean) // Filter out null, undefined, empty strings
                  .join(', ') || 'N/A'} {/* Fallback for empty address string */}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-muted-foreground" /> Contact Number:
              </Label>
              <p className="text-base text-gray-800 dark:text-gray-100 pl-6">{profileData.contactNumber ?? 'N/A'}</p>
            </div>
            <div className="space-y-1 col-span-full">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <BuildingIcon className="h-4 w-4 text-muted-foreground" /> Description:
              </Label>
              <p className="text-base text-gray-800 dark:text-gray-100 leading-relaxed pl-6">{profileData.description ?? 'No description provided.'}</p>
            </div>
          </div>
          <div className="text-center mt-6">
            <Button onClick={() => navigate('/colleges')}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to Directory
            </Button>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
};

export default OtherCollegeProfilePage;