import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CalendarIcon, Trash2Icon, EyeIcon, SearchIcon, ArrowLeftIcon } from 'lucide-react';

import useAuthStore from '@/store/authStore';
import eventService from '@/services/eventService';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const ManageEventsPage = () => {
  const { user: currentUserCollege, logout, setError } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEventType, setFilterEventType] = useState('all');

  const eventTypes = ['Workshop', 'Seminar', 'Cultural Fest', 'Sports Event', 'Webinar', 'Conference', 'Other'];

  useEffect(() => {
    if (!currentUserCollege || currentUserCollege.role !== 'admin') {
      navigate('/');
      toast({
        title: "Access Denied",
        description: "You do not have administrative privileges.",
        variant: "destructive",
      });
      return;
    }
    fetchEvents();
  }, [currentUserCollege, navigate, logout, setError, toast]);

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const data = await eventService.getEvents(); // Admin fetches ALL events
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events for admin:', err);
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message;
      setError(message);
      toast({
        title: "Error Loading Events",
        description: message,
        variant: "destructive",
      });
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await eventService.deleteEvent(eventId); // Admin has delete access to any event
      toast({
        title: "Event Deleted",
        description: `Event "${eventTitle}" has been removed.`,
      });
      fetchEvents();
    } catch (err) {
      console.error('Failed to delete event:', err);
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message;
      setError(message);
      toast({
        title: "Deletion Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredEvents = events.filter(event => {
    const matchesType = filterEventType === 'all' ? true : event.eventType === filterEventType;
    const matchesSearch = searchTerm
      ? event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizingCollege?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesType && matchesSearch;
  });

  if (isLoadingEvents) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="w-12 h-12 mb-4 text-blue-600 animate-spin dark:text-blue-400" />
        <p className="text-xl font-medium text-gray-700 dark:text-gray-300">Loading Events...</p>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto md:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-extrabold text-center text-gray-800 dark:text-gray-100">
        Admin: Manage <span className="text-red-600 dark:text-red-400">Events</span>
      </h1>

      <div className="flex items-center justify-between mb-6">
        <Button onClick={() => navigate('/admin')} variant="outline" className="flex items-center gap-2">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Admin Dashboard
        </Button>
        <div className="relative w-full max-w-sm ml-auto">
          <SearchIcon className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-4 rounded-md pl-9"
          />
        </div>
        <Select value={filterEventType} onValueChange={setFilterEventType} className="ml-2">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {eventTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterEventType('all'); }} className="ml-2">
          Reset Filters
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="py-10 text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg">No events found yet.</p>
        </div>
      ) : (
        <Card className="border border-gray-100 shadow-lg dark:border-gray-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Title</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Type</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Location</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Date & Time</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Organized By</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-center uppercase text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-card dark:divide-gray-700">
                  {filteredEvents.map(event => (
                    <tr key={event._id}>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-foreground">{event.title}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-muted-foreground">{event.eventType}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-muted-foreground">{event.location}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-muted-foreground">{formatDateTime(event.dateTime)}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-muted-foreground">{event.organizingCollege?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alert(`View details for ${event.title}`)} // Placeholder for view details
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteEvent(event._id, event.title)}
                            className="flex items-center gap-1"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      <Toaster />
    </div>
  );
};

export default ManageEventsPage;