import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Helper to get token from local storage
const getToken = () => {
  const user = JSON.parse(localStorage.getItem('collegeUser'));
  return user ? user.token : null;
};

// Create a new forum post
const createForumPost = async (postData) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json', // Post data is JSON
    },
  };
  const response = await axios.post(`${API_URL}/forum`, postData, config);
  return response.data;
};

// Get all forum posts
const getForumPosts = async () => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/forum`, config);
  return response.data;
};

// Get a single forum post by ID (for future detail page)
const getForumPostById = async (id) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`<span class="math-inline">\{API\_URL\}/forum/</span>{id}`, config);
  return response.data;
};

// Update a forum post
const updateForumPost = async (id, postData) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  const response = await axios.put(`<span class="math-inline">\{API\_URL\}/forum/</span>{id}`, postData, config);
  return response.data;
};

// Delete a forum post
const deleteForumPost = async (id) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(`<span class="math-inline">\{API\_URL\}/forum/</span>{id}`, config);
  return response.data;
};

const forumService = {
  createForumPost,
  getForumPosts,
  getForumPostById,
  updateForumPost,
  deleteForumPost,
};

export default forumService;