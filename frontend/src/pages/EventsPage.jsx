import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CalendarPlusIcon, CalendarIcon, MapPinIcon, LinkIcon, MailIcon, PhoneIcon, Trash2Icon, EditIcon } from 'lucide-react'; // Icons

import useAuthStore from '@/store/authStore';
import eventService from '@/services/eventService';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const EventsPage = () => {
  const { user: collegeUser, logout, setError } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for Create Event Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState(''); // ISO string format
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  // State for Events List
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  const eventTypes = ['Workshop', 'Seminar', 'Cultural Fest', 'Sports Event', 'Webinar', 'Conference', 'Other'];

  useEffect(() => {
    if (!collegeUser) {
      navigate('/login');
      return;
    }
    fetchEvents();
  }, [collegeUser, navigate, logout, setError, toast]);

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
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

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!title || !description || !eventType || !location || !dateTime) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required event details.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingEvent(true);
    try {
      // Ensure dateTime is a valid ISO string
      const eventDateTime = new Date(dateTime).toISOString();

      await eventService.createEvent({
        title,
        description,
        eventType,
        location,
        dateTime: eventDateTime,
        contactEmail: contactEmail || undefined, // Send undefined if empty string
        contactPhone: contactPhone || undefined,
        registrationLink: registrationLink || undefined,
      });
      toast({
        title: "Event Created",
        description: "Your event has been successfully posted.",
      });
      // Clear form and re-fetch events
      setTitle('');
      setDescription('');
      setEventType('');
      setLocation('');
      setDateTime('');
      setContactEmail('');
      setContactPhone('');
      setRegistrationLink('');
      fetchEvents();
    } catch (err) {
      console.error('Failed to create event:', err);
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message;
      setError(message);
      toast({
        title: "Event Creation Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      return;
    }
    try {
      await eventService.deleteEvent(eventId);
      toast({
        title: "Event Deleted",
        description: `"${eventTitle}" has been removed.`,
      });
      fetchEvents(); // Re-fetch list after deletion
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

  // Helper to format date and time
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-8 text-center">
        College <span className="text-blue-600 dark:text-blue-400">Events</span>
      </h1>

      {/* Create New Event Section */}
      <Card className="mb-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <CalendarPlusIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" /> Create New Event
          </CardTitle>
          <CardDescription>Announce your college's upcoming events to the network.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Select value={eventType} onValueChange={setEventType} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 col-span-full">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Provide a detailed description of the event..." value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-muted-foreground" /> Location (Physical Address or Link):
              </Label>
              <Input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dateTime" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" /> Date & Time:
              </Label>
              {/* Using type="datetime-local" for convenient date/time input */}
              <Input id="dateTime" type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactEmail" className="flex items-center gap-2">
                <MailIcon className="h-4 w-4 text-muted-foreground" /> Contact Email (Optional):
              </Label>
              <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactPhone" className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-muted-foreground" /> Contact Phone (Optional):
              </Label>
              <Input id="contactPhone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
            <div className="grid gap-2 col-span-full">
              <Label htmlFor="registrationLink" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" /> Registration Link (Optional):
              </Label>
              <Input id="registrationLink" type="url" value={registrationLink} onChange={(e) => setRegistrationLink(e.target.value)} placeholder="https://example.com/register-event" />
            </div>
            <div className="col-span-full flex justify-end">
              <Button type="submit" disabled={isCreatingEvent} className="px-6 py-2">
                {isCreatingEvent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarPlusIcon className="mr-2 h-4 w-4" />}
                {isCreatingEvent ? 'Creating Event...' : 'Post Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Events List Section */}
      <Card className="shadow-lg border border-gray-100 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" /> All Upcoming Events
          </CardTitle>
          <CardDescription>Discover events hosted by colleges across the network.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingEvents ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="ml-2 text-lg text-gray-600 dark:text-gray-300">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <p className="text-lg">No events found.</p>
              <p className="text-sm mt-2">Be the first to post an event!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <Card key={event._id} className="shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between border border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold truncate">{event.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Type: {event.eventType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 text-sm text-gray-700 dark:text-gray-300 pb-3 space-y-2">
                    <p className="line-clamp-3">{event.description}</p>
                    <p className="flex items-center gap-1 text-xs">
                      <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                      {formatDateTime(event.dateTime)}
                    </p>
                    <p className="flex items-center gap-1 text-xs">
                      <MapPinIcon className="h-3 w-3 text-muted-foreground" />
                      {event.location}
                    </p>
                    {event.registrationLink && (
                      <a
                        href={event.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                      >
                        <LinkIcon className="h-3 w-3" /> Register Here
                      </a>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Organized by: {event.organizingCollege?.name || 'Unknown'} on {new Date(event.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <div className="p-4 border-t flex justify-end items-center bg-muted/20">
                    {event.organizingCollege?._id === collegeUser?._id && (
                      <div className="space-x-2">
                        {/* Future: Add Update Event Button */}
                        {/* <Button variant="outline" size="sm" onClick={() => alert('Edit Event')}>
                          <EditIcon className="h-4 w-4 mr-1" /> Edit
                        </Button> */}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEvent(event._id, event.title)}
                          className="flex items-center gap-1"
                        >
                          <Trash2Icon className="h-4 w-4" /> Delete
                        </Button>
                      </div>
                    )}
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

export default EventsPage;