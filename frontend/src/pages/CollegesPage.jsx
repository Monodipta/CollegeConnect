// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input"; // For search bar
// import { Loader2, UsersIcon, SearchIcon, MapPinIcon, GlobeIcon, EyeIcon } from 'lucide-react'; // Icons // <-- ADD EyeIcon HERE

// import useAuthStore from '@/store/authStore';
// import collegeService from '@/services/collegeService';
// import { useToast } from "@/hooks/use-toast";
// import { Toaster } from "@/components/ui/toaster";

// const CollegesPage = () => {
//   const { user: currentUserCollege, logout, setError } = useAuthStore();
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   const [colleges, setColleges] = useState([]);
//   const [isLoadingColleges, setIsLoadingColleges] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     if (!currentUserCollege) {
//       navigate('/login');
//       return;
//     }
//     fetchColleges();
//   }, [currentUserCollege, navigate, logout, setError, toast]);

//   const fetchColleges = async () => {
//     setIsLoadingColleges(true);
//     try {
//       const data = await collegeService.getAllColleges();
//       // Filter out the currently logged-in college from the list
//       setColleges(data.filter(college => college._id !== currentUserCollege._id));
//     } catch (err) {
//       console.error('Failed to fetch colleges:', err);
//       const message = err.response && err.response.data && err.response.data.message
//         ? err.response.data.message
//         : err.message;
//       setError(message);
//       toast({
//         title: "Error Loading Colleges",
//         description: message,
//         variant: "destructive",
//       });
//       if (err.response && err.response.status === 401) {
//         logout();
//         navigate('/login');
//       }
//     } finally {
//       setIsLoadingColleges(false);
//     }
//   };

//   // Helper to construct logo URL
//   const constructLogoUrl = (logoPath) => {
//     return logoPath ? `${import.meta.env.VITE_BACKEND_URL.replace('/api', '')}${logoPath}` : null;
//   };

//   const filteredColleges = colleges.filter(college => {
//     return college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//            (college.city && college.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
//            (college.state && college.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
//            (college.country && college.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
//            (college.description && college.description.toLowerCase().includes(searchTerm.toLowerCase()));
//   });

//   return (
//     <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
//       <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-8 text-center">
//         Explore Other <span className="text-blue-600 dark:text-blue-400">Colleges</span>
//       </h1>

//       <Card className="mb-8 shadow-lg border border-gray-100 dark:border-gray-700">
//         <CardHeader className="flex flex-row items-center justify-between pb-4">
//           <CardTitle className="text-2xl font-bold flex items-center gap-2">
//             <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" /> College Directory
//           </CardTitle>
//           <div className="relative w-full max-w-sm">
//             <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//             <Input
//               type="text"
//               placeholder="Search colleges by name, city..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-9 pr-4 rounded-md"
//             />
//           </div>
//         </CardHeader>
//         <CardContent>
//           {isLoadingColleges ? (
//             <div className="flex justify-center items-center h-48">
//               <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
//               <p className="ml-2 text-lg text-gray-600 dark:text-gray-300">Loading colleges...</p>
//             </div>
//           ) : filteredColleges.length === 0 ? (
//             <div className="text-center py-10 text-gray-500 dark:text-gray-400">
//               <p className="text-lg">No other colleges found matching your criteria.</p>
//               <p className="text-sm mt-2">Try adjusting your search or check back later!</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filteredColleges.map(college => (
//                 <Card key={college._id} className="shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between border border-gray-200 dark:border-gray-700">
//                   <CardHeader className="pb-3 flex-row items-center space-x-3">
//                     <Avatar className="h-10 w-10 border-2">
//                       {college.logo ? (
//                         <AvatarImage src={constructLogoUrl(college.logo)} alt={`${college.name} Logo`} />
//                       ) : (
//                         <AvatarFallback className="bg-primary text-primary-foreground text-md font-semibold">{college.name.charAt(0)}</AvatarFallback>
//                       )}
//                     </Avatar>
//                     <div className="flex-1">
//                       <CardTitle className="text-lg font-semibold truncate">{college.name}</CardTitle>
//                       <CardDescription className="text-xs text-muted-foreground">
//                         <MapPinIcon className="inline-block h-3 w-3 mr-1" />
//                         {[college.city, college.state, college.country].filter(Boolean).join(', ')}
//                       </CardDescription>
//                     </div>
//                   </CardHeader>
//                   <CardContent className="flex-1 text-sm text-gray-700 dark:text-gray-300 pb-3 space-y-2">
//                     <p className="line-clamp-3">{college.description}</p>
//                     {college.website && (
//                       <a href={college.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400">
//                         <GlobeIcon className="h-3 w-3" /> Visit Website
//                       </a>
//                     )}
//                   </CardContent>
//                   <div className="p-4 border-t flex justify-end items-center bg-muted/20">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => navigate(`/colleges/${college._id}`)} // Link to individual college profile (future)
//                       className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
//                     >
//                       <EyeIcon className="h-4 w-4" /> View Profile
//                     </Button>
//                   </div>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//       <Toaster />
//     </div>
//   );
// };

// export default CollegesPage;


import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // Added useSearchParams
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UsersIcon, SearchIcon, MapPinIcon, GlobeIcon, EyeIcon } from 'lucide-react';

import useAuthStore from '@/store/authStore';
import collegeService from '@/services/collegeService';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const CollegesPage = () => {
  const { user: currentUserCollege, logout, setError } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams(); // Get search parameters from URL

  const [colleges, setColleges] = useState([]);
  // Initialize searchTerm from URL param when component mounts
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [isLoadingColleges, setIsLoadingColleges] = useState(true);

  // Effect to update searchTerm state when URL search params change
  useEffect(() => {
    const param = searchParams.get('search');
    setSearchTerm(param || '');
  }, [searchParams]);

  useEffect(() => {
    if (!currentUserCollege) {
      navigate('/login');
      return;
    }
    fetchColleges();
  }, [currentUserCollege, navigate, logout, setError, toast]); // Added searchParams to deps if you want to refetch on search param change (not just update state)

  const fetchColleges = async () => {
    setIsLoadingColleges(true);
    try {
      const data = await collegeService.getAllColleges();
      setColleges(data.filter(college => college._id !== currentUserCollege._id));
    } catch (err) {
      console.error('Failed to fetch colleges:', err);
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message;
      setError(message);
      toast({
        title: "Error Loading Colleges",
        description: message,
        variant: "destructive",
      });
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setIsLoadingColleges(false);
    }
  };

  // Helper to construct logo URL (already correct)
  const constructLogoUrl = (logoPath) => {
    return logoPath ? `${import.meta.env.VITE_BACKEND_URL.replace('/api', '')}${logoPath}` : null;
  };

  // Filter colleges based on the current searchTerm
  const filteredColleges = colleges.filter(college => {
    return college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (college.city && college.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (college.state && college.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (college.country && college.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (college.description && college.description.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-8 text-center">
        Explore Other <span className="text-blue-600 dark:text-blue-400">Colleges</span>
      </h1>

      <Card className="mb-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" /> College Directory
          </CardTitle>
          <div className="relative w-full max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search colleges by name, city..."
              value={searchTerm} // Now controlled by local state, which is updated from URL
              onChange={(e) => setSearchTerm(e.target.value)} // Allows typing directly on this page
              className="w-full pl-9 pr-4 rounded-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingColleges ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="ml-2 text-lg text-gray-600 dark:text-gray-300">Loading colleges...</p>
            </div>
          ) : filteredColleges.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <p className="text-lg">No other colleges found matching your criteria.</p>
              <p className="text-sm mt-2">Try adjusting your search or check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredColleges.map(college => (
                <Card key={college._id} className="shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between border border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-3 flex-row items-center space-x-3">
                    <Avatar className="h-10 w-10 border-2">
                      {college.logo ? (
                        <AvatarImage src={constructLogoUrl(college.logo)} alt={`${college.name} Logo`} />
                      ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground text-md font-semibold">{college.name?.charAt(0) || 'C'}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold truncate">{college.name}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        <MapPinIcon className="inline-block h-3 w-3 mr-1" />
                        {[college.city, college.state, college.country].filter(Boolean).join(', ')}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 text-sm text-gray-700 dark:text-gray-300 pb-3 space-y-2">
                    <p className="line-clamp-3">{college.description}</p>
                    {college.website && (
                      <a href={college.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400">
                        <GlobeIcon className="h-3 w-3" /> Visit Website
                      </a>
                    )}
                  </CardContent>
                  <div className="p-4 border-t flex justify-end items-center bg-muted/20">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/colleges/${college._id}`)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <EyeIcon className="h-4 w-4" /> View Profile
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
};

export default CollegesPage;