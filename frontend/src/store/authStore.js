import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: localStorage.getItem('collegeUser') ? JSON.parse(localStorage.getItem('collegeUser')) : null, // Renamed storage key for clarity
  isLoading: false,
  error: null,
  setUser: (collegeUser) => set({ user: collegeUser, isLoading: false, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  logout: () => {
    localStorage.removeItem('collegeUser'); // Renamed storage key
    set({ user: null, isLoading: false, error: null });
  },
}));

export default useAuthStore;