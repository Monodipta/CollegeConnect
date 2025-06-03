import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Register college
const register = async (collegeData) => {
    // collegeData will now be a FormData object
    const response = await axios.post(`${API_URL}/auth/register`, collegeData, {
        headers: {
            'Content-Type': 'multipart/form-data', // Important for file uploads
        },
    });

    if (response.data.token) {
        localStorage.setItem('collegeUser', JSON.stringify(response.data)); // Updated storage key
    }
    return response.data;
};

// Login college
const login = async (loginData) => {
    const response = await axios.post(`${API_URL}/auth/login`, loginData);
    if (response.data.token) {
        localStorage.setItem('collegeUser', JSON.stringify(response.data)); // Updated storage key
    }
    return response.data;
};

const forgotPasswordRequest = async (email) => {
  const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
  return response.data;
};

// Confirm password reset with token and new password
const resetPasswordConfirm = async (token, newPassword) => {
  // ⭐⭐⭐ THIS IS THE CORRECTED LINE ⭐⭐⭐
  // It MUST start and end with BACKTICKS (`), not single or double quotes.
  // Variables MUST be enclosed in ${}.
  const response = await axios.put(`${API_URL}/auth/reset-password/${token}`, { password: newPassword });
  return response.data;
};

// Logout college
const logout = () => {
    localStorage.removeItem('collegeUser'); // Updated storage key
};

const authService = {
    register,
    login,
    logout,
    forgotPasswordRequest,
    resetPasswordConfirm
};

export default authService;