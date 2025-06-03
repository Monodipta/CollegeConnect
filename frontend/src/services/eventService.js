import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Helper to get token from local storage
const getToken = () => {
  const user = JSON.parse(localStorage.getItem('collegeUser'));
  return user ? user.token : null;
};

// Create a new event
const createEvent = async (eventData) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json', // Events data is JSON
    },
  };
  const response = await axios.post(`${API_URL}/events`, eventData, config);
  return response.data;
};

// Get all events
const getEvents = async () => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/events`, config);
  return response.data;
};

// Get a single event by ID (for future detail page)
const getEventById = async (id) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`<span class="math-inline">\{API\_URL\}/events/</span>{id}`, config);
  return response.data;
};

// Update an event
const updateEvent = async (id, eventData) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  const response = await axios.put(`<span class="math-inline">\{API\_URL\}/events/</span>{id}`, eventData, config);
  return response.data;
};

// Delete an event
const deleteEvent = async (id) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(`<span class="math-inline">\{API\_URL\}/events/</span>{id}`, config);
  return response.data;
};

const eventService = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};

export default eventService;