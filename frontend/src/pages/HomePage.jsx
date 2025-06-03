import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import useAuthStore from '@/store/authStore';

const HomePage = () => {
  const { user: collegeUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!collegeUser) {
      navigate('/login'); // Redirect to login if not authenticated
    }
  }, [collegeUser, navigate]);

  return (
    // Applied consistent gradient background and increased overall padding
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-blue-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-6 md:p-16 lg:p-20 xl:p-24">
      {/* Increased max-w to fill more horizontal space, and adjusted inner padding */}
      <div className="text-center bg-card text-card-foreground p-8 md:p-12 lg:p-16 rounded-xl shadow-2xl max-w-5xl w-full transform transition-all duration-300 hover:scale-[1.005] hover:shadow-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100 mb-4 tracking-tight">
          Welcome to <span className="text-blue-600 dark:text-blue-400">CollegeConnect</span>, {collegeUser ? collegeUser.name : 'College'}!
        </h1>
        <p className="text-lg md:text-xl mb-8 text-gray-600 dark:text-gray-300 leading-relaxed">
          This is your central dashboard. Explore recent activities, shared resources, and connect with other colleges in your network.
        </p>

        {/* Enhanced Placeholder for Activity Feed */}
        <div className="bg-white dark:bg-gray-800 text-foreground p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mt-8">
  <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-50 mb-5">Recent Activities & Updates</h2>
  <p className="text-base text-gray-700 dark:text-gray-300 leading-normal">
    Stay informed with the latest events, newly shared resources, and active discussions from colleges across the platform. This section will soon feature a dynamic feed of real-time collaboration.
  </p>
  <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
    <Button
      onClick={() => navigate('/colleges')}
      className="px-6 py-3 text-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-300 ease-in-out transform hover:scale-105"
    >
      Browse Colleges
    </Button>
    <Button
      variant="outline"
      onClick={() => navigate('/events')}
      className="px-6 py-3 text-lg border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 font-semibold rounded-lg shadow-md transition-colors duration-300 ease-in-out transform hover:scale-105"
    >
      View All Events
    </Button>
  </div>
</div>

        <p className="mt-10 text-sm text-gray-500 dark:text-gray-400">
          Your gateway to inter-college collaboration and communication. Streamline your processes, share knowledge, and foster a connected academic community.
        </p>
      </div>
    </div>
  );
};

export default HomePage;