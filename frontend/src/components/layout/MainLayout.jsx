// import React, { useEffect, useState } from 'react'; // Added useEffect, useState
// import { Link, useNavigate } from 'react-router-dom';
// import { ModeToggle } from '@/components/mode-toggle';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
// import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
// import { MenuIcon, BellIcon, SearchIcon, LogOutIcon, HomeIcon, CalendarIcon, ArchiveIcon, UsersIcon, MessageCircleIcon, SettingsIcon } from 'lucide-react';
// import useAuthStore from '@/store/authStore';
// import authService from '@/services/authService';
// import notificationService from '@/services/notificationService'; // NEW: Import notification service
// import { useToast } from "@/hooks/use-toast"; // NEW: For showing errors in navbar context
// import { Toaster } from "@/components/ui/toaster"; // NEW: For showing errors in navbar context

// const MainLayout = ({ children }) => {
//   const { user: collegeUser, logout, setError } = useAuthStore(); // Added setError
//   const navigate = useNavigate();
//   const { toast } = useToast(); // Initialize useToast

//   const [notifications, setNotifications] = useState([]); // State for notifications
//   const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0); // State for unread count

//   // Construct URL for college logo in Navbar
//   const logoUrl = collegeUser && collegeUser.logo
//     ? `${import.meta.env.VITE_BACKEND_URL.replace('/api', '')}${collegeUser.logo}`
//     : null;

//   // Fetch notifications on component mount and periodically
//   useEffect(() => {
//     let intervalId;
//     if (collegeUser) { // Only fetch if logged in
//       const fetchNotifications = async () => {
//         try {
//           const fetchedNotifications = await notificationService.getNotifications();
//           setNotifications(fetchedNotifications);
//           const unreadCount = await notificationService.getUnreadNotificationCount();
//           setUnreadNotificationsCount(unreadCount);
//         } catch (err) {
//           console.error('Failed to fetch notifications:', err);
//           const message = err.response?.data?.message || err.message;
//           setError(message); // Set error in Zustand store

//           // If token is invalid or expired (401), force logout
//           if (err.response?.status === 401) {
//             logout();
//             navigate('/login');
//             toast({
//               title: "Session Expired",
//               description: "Please log in again.",
//               variant: "destructive",
//             });
//           }
//         }
//       };

//       fetchNotifications(); // Initial fetch

//       // Fetch notifications every 30 seconds
//       intervalId = setInterval(fetchNotifications, 30000);
//     }

//     // Cleanup interval on unmount or collegeUser change
//     return () => {
//       if (intervalId) clearInterval(intervalId);
//     };
//   }, [collegeUser, navigate, logout, setError, toast]);

//   const handleLogout = () => {
//     authService.logout();
//     logout();
//     navigate('/login');
//   };

//   // Handler for clicking a notification
//   const handleNotificationClick = async (notificationId, link) => {
//     try {
//       await notificationService.markNotificationAsRead(notificationId);
//       // Optimistically update local state
//       setNotifications(prev =>
//         prev.map(n => (n._id === notificationId ? { ...n, read: true } : n))
//       );
//       setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
//       if (link) {
//         navigate(link);
//       }
//     } catch (err) {
//       console.error('Failed to mark notification as read:', err);
//       toast({
//         title: "Notification Error",
//         description: "Failed to mark as read.",
//         variant: "destructive",
//       });
//     }
//   };

//   // Handler for marking all notifications as read
//   const handleMarkAllRead = async () => {
//     try {
//       await notificationService.markAllNotificationsAsRead();
//       setNotifications(prev => prev.map(n => ({ ...n, read: true })));
//       setUnreadNotificationsCount(0);
//       toast({
//         title: "Notifications Cleared",
//         description: "All notifications marked as read.",
//       });
//     } catch (err) {
//       console.error('Failed to mark all notifications as read:', err);
//       toast({
//         title: "Error",
//         description: "Failed to mark all as read.",
//         variant: "destructive",
//       });
//     }
//   };


//   return (
//     <div className="min-h-screen flex flex-col bg-background text-foreground">
//       {/* Navbar */}
//       <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-lg transition-all duration-300">
//         <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8 w-full">
//           {/* Brand/Logo (Left) */}
//           <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-primary-foreground hover:text-primary transition-colors">
//             {/* Styled "C" */}
//             <span className="text-blue-600 dark:text-blue-400 text-3xl font-extrabold -mr-1">C</span>
//             <span className="text-gray-800 dark:text-gray-100 text-2xl md:text-xl font-semibold">ollegeConnect</span>
//           </Link>

//           {/* Search Bar (Immediately to the right of brand) */}
//           <div className="flex-1 max-w-sm ml-4 mr-auto hidden sm:block">
//             <div className="relative">
//               <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 type="search"
//                 placeholder="Search colleges, events, resources..."
//                 className="w-full pl-9 pr-4 rounded-full bg-gray-100 dark:bg-gray-700 border-transparent focus:border-blue-500 focus:ring-blue-500 shadow-inner transition-all duration-200 text-foreground placeholder:text-muted-foreground"
//                 // Add onChange for search functionality later
//               />
//             </div>
//           </div>

//           {/* Primary Navigation Links (Desktop - Pushed to far right and spaced from search bar) */}
//           <nav className="hidden lg:flex items-center space-x-6 ml-12">
//             <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:scale-105 flex items-center gap-1">
//               <HomeIcon className="h-4 w-4" /> Home
//             </Link>
//             <Link to="/events" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:scale-105 flex items-center gap-1">
//               <CalendarIcon className="h-4 w-4" /> Events
//             </Link>
//             <Link to="/resources" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:scale-105 flex items-center gap-1">
//               <ArchiveIcon className="h-4 w-4" /> Resources
//             </Link>
//             <Link to="/forum" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:scale-105 flex items-center gap-1">
//               <MessageCircleIcon className="h-4 w-4" /> Forum
//             </Link>
//             <Link to="/colleges" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:scale-105 flex items-center gap-1">
//               <UsersIcon className="h-4 w-4" /> Colleges
//             </Link>
//           </nav>

//           {/* College Profile & Actions (Rightmost, after nav links) */}
//           <div className="flex items-center space-x-2 md:space-x-4 ml-6 lg:ml-8">
//             {/* Notification Button */}
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="icon" className="relative hover:bg-accent focus-visible:ring-0 focus-visible:ring-offset-0">
//                   <BellIcon className="h-5 w-5 text-muted-foreground" />
//                   {/* Display unread count badge */}
//                   {unreadNotificationsCount > 0 && (
//                     <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold animate-pulse">
//                       {unreadNotificationsCount}
//                     </span>
//                   )}
//                   <span className="sr-only">Notifications</span>
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-72 shadow-xl rounded-md">
//                 <div className="px-4 py-2 font-semibold border-b border-border text-foreground">Notifications</div>
//                 {notifications.length > 0 ? (
//                   notifications.map(notification => (
//                     <DropdownMenuItem
//                       key={notification._id}
//                       className="block w-full text-left py-2 px-4 hover:bg-accent cursor-pointer"
//                       onClick={() => handleNotificationClick(notification._id, notification.link)}
//                     >
//                       <p className={`${notification.read ? 'text-muted-foreground' : 'font-medium'}`}>
//                         {notification.message}
//                       </p>
//                       {notification.sender?.name && (
//                         <p className="text-xs text-muted-foreground">
//                           from {notification.sender.name}
//                         </p>
//                       )}
//                       <p className="text-xs text-muted-foreground">
//                         {new Date(notification.createdAt).toLocaleString()}
//                       </p>
//                     </DropdownMenuItem>
//                   ))
//                 ) : (
//                   <DropdownMenuItem className="text-muted-foreground text-center py-4">No notifications</DropdownMenuItem>
//                 )}
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem
//                   className="block w-full text-center text-sm text-primary hover:text-primary/80 cursor-pointer"
//                   onClick={handleMarkAllRead}
//                 >
//                   Mark all as read
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>


//             {/* College Profile Avatar & Dropdown */}
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" className="relative h-9 px-0 flex items-center space-x-2 hover:bg-accent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full">
//                   <Avatar className="h-8 w-8 border-2 border-primary/50">
//                     {logoUrl ? (
//                       <AvatarImage src={logoUrl} alt={`${collegeUser?.name} Logo`} />
//                     ) : (
//                       <AvatarFallback className="bg-primary text-primary-foreground font-semibold">{collegeUser?.name?.charAt(0) || 'C'}</AvatarFallback>
//                     )}
//                   </Avatar>
//                   <span className="hidden md:inline-block font-medium text-sm text-foreground">{collegeUser?.name}</span>
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-56 shadow-xl rounded-md">
//                 <div className="px-4 py-2 text-sm font-medium border-b border-border">
//                   <p className="truncate text-foreground">{collegeUser?.name}</p>
//                   <p className="text-xs text-muted-foreground truncate">{collegeUser?.email}</p>
//                 </div>
//                 <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer hover:bg-accent">
//                   <UsersIcon className="mr-2 h-4 w-4 text-muted-foreground" /> My College Profile
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 hover:bg-red-500/10">
//                   <LogOutIcon className="mr-2 h-4 w-4" /> Logout
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>

//             {/* Theme Toggle */}
//             <ModeToggle />

//             {/* Mobile Navigation (Hamburger Menu) */}
//             <Sheet>
//               <SheetTrigger asChild className="md:hidden ml-2">
//                 <Button variant="ghost" size="icon" className="hover:bg-accent">
//                   <MenuIcon className="h-6 w-6" />
//                   <span className="sr-only">Toggle navigation</span>
//                 </Button>
//               </SheetTrigger>
//               <SheetContent side="left" className="w-64 bg-background dark:bg-gray-900">
//                 <div className="flex flex-col space-y-4 pt-8">
//                   <Link to="/" className="text-lg font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent">
//                     <HomeIcon className="h-5 w-5" /> Dashboard
//                   </Link>
//                   <Link to="/events" className="text-lg font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent">
//                     <CalendarIcon className="h-5 w-5" /> Events
//                   </Link>
//                   <Link to="/resources" className="text-lg font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent">
//                     <ArchiveIcon className="h-5 w-5" /> Resources
//                   </Link>
//                   <Link to="/forum" className="text-lg font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent">
//                     <MessageCircleIcon className="h-5 w-5" /> Forum
//                   </Link>
//                   <Link to="/colleges" className="text-lg font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent">
//                     <UsersIcon className="h-5 w-5" /> Colleges
//                   </Link>
//                   <Button onClick={handleLogout} className="w-full justify-start text-lg font-medium flex items-center gap-2 px-4 py-2 rounded-md text-red-500 hover:bg-red-500/10">
//                     <LogOutIcon className="h-5 w-5" /> Logout
//                   </Button>
//                 </div>
//               </SheetContent>
//             </Sheet>
//           </div>
//         </div>
//       </header>

//       {/* Main Content Area */}
//       <main>
//         {children} {/* This is where your page components will be rendered */}
//       </main>

//       {/* Footer */}
//       <footer className="w-full border-t bg-muted text-muted-foreground py-6 text-center text-sm">
//         <div className="container px-4 md:px-6">
//           &copy; {new Date().getFullYear()} CollegeConnect. All rights reserved.
//           <p className="mt-1">Developed for BCA Final Year Project.</p>
//           {/* Optional: Add quick links here */}
//           {/* <div className="mt-2 space-x-4">
//             <Link to="/about" className="hover:underline">About</Link>
//             <Link to="/contact" className="hover:underline">Contact</Link>
//           </div> */}
//         </div>
//       </footer>
//       <Toaster /> {/* To display toasts from Navbar/Layout */}
//     </div>
//   );
// };

// export default MainLayout;

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, BellIcon, SearchIcon, LogOutIcon, HomeIcon, CalendarIcon, ArchiveIcon, UsersIcon, MessageCircleIcon, SettingsIcon } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import authService from '@/services/authService';
import notificationService from '@/services/notificationService';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const MainLayout = ({ children }) => {
  const { user: collegeUser, logout, setError } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [navbarSearchTerm, setNavbarSearchTerm] = useState(''); // State for Navbar search input

  // Construct URL for college logo in Navbar
  const logoUrl = collegeUser && collegeUser.logo
    ? `${import.meta.env.VITE_BACKEND_URL.replace('/api', '')}${collegeUser.logo}`
    : null;

  // Fetch notifications on component mount and periodically
  useEffect(() => {
    let intervalId;
    if (collegeUser) {
      const fetchNotifications = async () => {
        try {
          const fetchedNotifications = await notificationService.getNotifications();
          setNotifications(fetchedNotifications);
          const unreadCount = await notificationService.getUnreadNotificationCount();
          setUnreadNotificationsCount(unreadCount);
        } catch (err) {
          console.error('Failed to fetch notifications:', err);
          const message = err.response?.data?.message || err.message;
          setError(message);

          if (err.response?.status === 401) {
            logout();
            navigate('/login');
            toast({
              title: "Session Expired",
              description: "Please log in again.",
              variant: "destructive",
            });
          }
        }
      };

      fetchNotifications();
      intervalId = setInterval(fetchNotifications, 30000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [collegeUser, navigate, logout, setError, toast]);

  const handleLogout = () => {
    authService.logout();
    logout();
    navigate('/login');
  };

  const handleNotificationClick = async (notificationId, link) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
      if (link) {
        navigate(link);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      toast({
        title: "Notification Error",
        description: "Failed to mark as read.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotificationsCount(0);
      toast({
        title: "Notifications Cleared",
        description: "All notifications marked as read.",
      });
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      toast({
        title: "Error",
        description: "Failed to mark all as read.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-lg transition-all duration-300">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8 w-full">
          {/* Brand/Logo (Left) */}
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-primary-foreground hover:text-primary transition-colors">
            <span className="text-blue-600 dark:text-blue-400 text-3xl font-extrabold -mr-1">C</span>
            <span className="text-gray-800 dark:text-gray-100 text-2xl md:text-xl font-semibold">ollegeConnect</span>
          </Link>

          {/* Search Bar (Immediately to the right of brand) */}
          <div className="flex-1 max-w-sm ml-4 mr-auto hidden sm:block">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search colleges, events, resources..."
                className="w-full pl-9 pr-4 rounded-full bg-gray-100 dark:bg-gray-700 border-transparent focus:border-blue-500 focus:ring-blue-500 shadow-inner transition-all duration-200 text-foreground placeholder:text-muted-foreground"
                value={navbarSearchTerm}
                onChange={(e) => setNavbarSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/colleges?search=${encodeURIComponent(navbarSearchTerm)}`);
                    setNavbarSearchTerm('');
                  }
                }}
              />
            </div>
          </div>

          {/* Primary Navigation Links (Desktop - Pushed to far right and spaced from search bar) */}
          <nav className="hidden lg:flex items-center space-x-6 ml-12">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:scale-105 flex items-center gap-1">
              <HomeIcon className="h-4 w-4" /> Home
            </Link>
            <Link to="/events" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:scale-105 flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" /> Events
            </Link>
            <Link to="/resources" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:scale-105 flex items-center gap-1">
              <ArchiveIcon className="h-4 w-4" /> Resources
            </Link>
            <Link to="/forum" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:scale-105 flex items-center gap-1">
              <MessageCircleIcon className="h-4 w-4" /> Forum
            </Link>
            <Link to="/colleges" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:scale-105 flex items-center gap-1">
              <UsersIcon className="h-4 w-4" /> Colleges
            </Link>
          </nav>

          {/* College Profile & Actions (Rightmost, after nav links) */}
          <div className="flex items-center space-x-2 md:space-x-4 ml-6 lg:ml-8">
            {/* Notification Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-accent focus-visible:ring-0 focus-visible:ring-offset-0">
                  <BellIcon className="h-5 w-5 text-muted-foreground" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold animate-pulse">
                      {unreadNotificationsCount}
                    </span>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 shadow-xl rounded-md">
                <div className="px-4 py-2 font-semibold border-b border-border text-foreground">Notifications</div>
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <DropdownMenuItem
                      key={notification._id}
                      className="block w-full text-left py-2 px-4 hover:bg-accent cursor-pointer"
                      onClick={() => handleNotificationClick(notification._id, notification.link)}
                    >
                      <p className={`${notification.read ? 'text-muted-foreground' : 'font-medium'}`}>
                        {notification.message}
                      </p>
                      {notification.sender?.name && (
                        <p className="text-xs text-muted-foreground">
                          from {notification.sender.name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem className="text-muted-foreground text-center py-4">No notifications</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="block w-full text-center text-sm text-primary hover:text-primary/80 cursor-pointer"
                  onClick={handleMarkAllRead}
                >
                  Mark all as read
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>


            {/* College Profile Avatar & Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 px-0 flex items-center space-x-2 hover:bg-accent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full">
                  <Avatar className="h-8 w-8 border-2 border-primary/50">
                    {logoUrl ? (
                      <AvatarImage src={logoUrl} alt={`${collegeUser?.name} Logo`} />
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">{collegeUser?.name?.charAt(0) || 'C'}</AvatarFallback>
                    )}
                  </Avatar>
                  <span className="hidden md:inline-block font-medium text-sm text-foreground">{collegeUser?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-xl rounded-md">
                <div className="px-4 py-2 text-sm font-medium border-b border-border">
                  <p className="truncate text-foreground">{collegeUser?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{collegeUser?.email}</p>
                </div>
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer hover:bg-accent">
                  <UsersIcon className="mr-2 h-4 w-4 text-muted-foreground" /> My College Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 hover:bg-red-500/10">
                  <LogOutIcon className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <ModeToggle />

            {/* Mobile Navigation (Hamburger Menu) */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden ml-2">
                <Button variant="ghost" size="icon" className="hover:bg-accent">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-background dark:bg-gray-900">
                <div className="flex flex-col space-y-4 pt-8">
                  <Link to="/" className="text-lg font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent">
                    <HomeIcon className="h-5 w-5" /> Dashboard
                  </Link>
                  <Link to="/events" className="text-lg font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent">
                    <CalendarIcon className="h-5 w-5" /> Events
                  </Link>
                  <Link to="/resources" className="text-lg font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent">
                    <ArchiveIcon className="h-5 w-5" /> Resources
                  </Link>
                  <Link to="/forum" className="text-lg font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent">
                    <MessageCircleIcon className="h-5 w-5" /> Forum
                  </Link>
                  <Link to="/colleges" className="text-lg font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent">
                    <UsersIcon className="h-5 w-5" /> Colleges
                  </Link>
                  <Button onClick={handleLogout} className="w-full justify-start text-lg font-medium flex items-center gap-2 px-4 py-2 rounded-md text-red-500 hover:bg-red-500/10">
                    <LogOutIcon className="h-5 w-5" /> Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-muted text-muted-foreground py-6 text-center text-sm shadow-inner">
        <div className="container px-4 md:px-6">
          &copy; {new Date().getFullYear()} CollegeConnect. All rights reserved.
          <p className="mt-1">Developed for BCA Final Year Project.</p>
        </div>
      </footer>
      <Toaster />
    </div>
  );
};

export default MainLayout;