import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Helper to get token from local storage
const getToken = () => {
  const user = JSON.parse(localStorage.getItem('collegeUser'));
  return user ? user.token : null;
};

// Upload a new resource
const uploadResource = async (resourceData) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data', // Important for file uploads
    },
  };
  const response = await axios.post(`${API_URL}/resources`, resourceData, config);
  return response.data;
};

// Get all resources
const getResources = async () => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/resources`, config);
  return response.data;
};

// Get a single resource by ID (if needed for a detail page)
const getResourceById = async (id) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`<span class="math-inline">\{API\_URL\}/resources/</span>{id}`, config);
  return response.data;
};

// Delete a resource
const deleteResource = async (id) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(`<span class="math-inline">\{API\_URL\}/resources/</span>{id}`, config);
  return response.data;
};

const downloadResource = async (id) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: 'blob', // Important: responseType must be 'blob' for file downloads
  };
  // ⭐⭐ THIS IS THE CORRECTED LINE ⭐⭐
  // It must start and end with BACKTICKS (`) and use ${} for variables.
  const response = await axios.get(`${API_URL}/resources/download/${id}`, config);
  return response; // Returns the full response object to handle headers in component
};

const resourceService = {
  uploadResource,
  getResources,
  getResourceById,
  deleteResource,
  downloadResource,
};

export default resourceService;