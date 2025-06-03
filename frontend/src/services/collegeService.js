import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Helper to get token from local storage
const getToken = () => {
  const user = JSON.parse(localStorage.getItem('collegeUser'));
  return user ? user.token : null;
};

// Get logged-in college's profile
const getMyProfile = async () => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/colleges/me`, config);
  return response.data;
};

// Update logged-in college's profile
const updateProfile = async (profileData) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data', // Important for file uploads
    },
  };
  const response = await axios.put(`${API_URL}/colleges/me`, profileData, config);

  // Update local storage with the new token and profile data if successful
  if (response.data.token) {
    localStorage.setItem('collegeUser', JSON.stringify(response.data));
  }
  return response.data;
};


// Get a specific college's profile by ID
const getCollegeProfileById = async (id) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/colleges/${id}`, config);
  return response.data;
};

// Get all colleges
const getAllColleges = async () => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/colleges`, config);
  return response.data;
};

const collegeService = {
  getMyProfile,
  updateProfile, // <-- Add this to exports
  getCollegeProfileById,
  getAllColleges,
};

export default collegeService;