import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import useAuthStore from '@/store/authStore';
import collegeService from '@/services/collegeService';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Label } from "@/components/ui/label";
import { Loader2, BuildingIcon, GlobeIcon, PhoneIcon, MapPinIcon, MailIcon } from 'lucide-react'; // Added MailIcon

const CollegeProfilePage = () => {
  const { user: collegeUser, logout, setError } = useAuthStore();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Construct URL for the college logo (which will be displayed in a circle)
  const collegeLogoUrl = profileData && profileData.logo
    ? `${import.meta.env.VITE_BACKEND_URL.replace('/api', '')}${profileData.logo}`
    : null;

  useEffect(() => {
    if (!collegeUser) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await collegeService.getMyProfile();
        setProfileData(data);
      } catch (err) {
        console.error('Failed to fetch college profile:', err);
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
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [collegeUser, navigate, logout, setError, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-blue-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
        <p className="text-xl text-gray-700 dark:text-gray-300 font-medium">Loading College Profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-blue-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
        <p className="text-xl text-destructive dark:text-red-400 font-medium mb-4">Could not load profile. Please try again.</p>
        <Button onClick={() => navigate('/')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600 px-6 py-3">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-blue-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl rounded-xl border border-gray-100 dark:border-gray-700 p-6 md:p-8">
        <CardHeader className="text-center space-y-4 pb-6">
          {/* Circular Logo Display */}
          <Avatar className="w-24 h-24 mx-auto mb-2 border-4 border-blue-600 dark:border-blue-400 shadow-md">
            {collegeLogoUrl ? (
              <AvatarImage src={collegeLogoUrl} alt={`${profileData.name} Logo`} />
            ) : (
              <AvatarFallback className="text-3xl font-semibold bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400">{profileData.name.charAt(0)}</AvatarFallback>
            )}
          </Avatar>

          <CardTitle className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">{profileData.name}</CardTitle>
          {/* Website just below the name */}
          <CardDescription className="text-md text-gray-600 dark:text-gray-300">
            {profileData.website ? (
              <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200">
                {profileData.website}
              </a>
            ) : 'N/A'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-left">
            {/* Email in the list */}
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <MailIcon className="h-4 w-4 text-muted-foreground" /> Email:
              </Label>
              <p className="text-base text-gray-800 dark:text-gray-100 pl-6">{profileData.email}</p>
            </div>
            {/* Location */}
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-muted-foreground" /> Location:
              </Label>
              <p className="text-base text-gray-800 dark:text-gray-100 pl-6">
                {[profileData.address, profileData.city, profileData.state, profileData.country]
                  .filter(Boolean)
                  .join(', ') || 'N/A'}
              </p>
            </div>
            {/* Contact Number */}
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-muted-foreground" /> Contact Number:
              </Label>
              <p className="text-base text-gray-800 dark:text-gray-100 pl-6">{profileData.contactNumber || 'N/A'}</p>
            </div>
            {/* Description takes full width on md and up */}
            <div className="space-y-1 col-span-1 md:col-span-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <BuildingIcon className="h-4 w-4 text-muted-foreground" /> Description:
              </Label>
              <p className="text-base text-gray-800 dark:text-gray-100 leading-relaxed pl-6">{profileData.description}</p>
            </div>
          </div>
          {/* Edit Profile and Back to Dashboard Buttons */}
          <div className="text-center mt-8 space-x-4">
            <Button
              onClick={() => navigate('/edit-profile')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-md shadow-md transition-colors duration-200 ease-in-out"
            >
              Edit Profile
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="px-6 py-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 font-semibold rounded-md shadow-md transition-colors duration-200 ease-in-out"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
};

export default CollegeProfilePage;