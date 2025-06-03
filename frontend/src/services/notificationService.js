import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Helper to get token from local storage
const getToken = () => {
  const user = JSON.parse(localStorage.getItem('collegeUser'));
  return user ? user.token : null;
};

// Get all notifications for the logged-in college
const getNotifications = async () => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/notifications`, config);
  return response.data;
};

// Get unread notification count
const getUnreadNotificationCount = async () => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/notifications/unread-count`, config);
  return response.data.count; // Return just the count
};

// Mark a single notification as read
const markNotificationAsRead = async (id) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(`<span class="math-inline">\{API\_URL\}/notifications/</span>{id}/read`, {}, config); // Empty body for PUT
  return response.data;
};

// Mark all notifications as read
const markAllNotificationsAsRead = async () => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(`${API_URL}/notifications/mark-all-read`, {}, config); // Empty body for PUT
  return response.data;
};

const notificationService = {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

export default notificationService;