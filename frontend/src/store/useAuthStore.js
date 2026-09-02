import { create } from 'zustand';
import api from '../api/authAxios'; // Axios instance with baseURL and withCredentials: true
import toast from 'react-hot-toast';

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isLoggingIn: false,
  isSigningUp: false,

  checkAuth: async () => {
    try {
      const res = await api.get('/check-auth');
      set({ authUser: res.data.user });
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (formData, navigate) => {
    set({ isSigningUp: true });
    try {
      await api.post('/signup', formData);
      toast.success('Account created successfully! Please log in.');
      navigate('/login'); // Direct redirect to login
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (formData) => {
    set({ isLoggingIn: true });
    try {
      const res = await api.post('/login', formData);
      set({ authUser: res.data.user });
      toast.success('Logged in successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
      set({ authUser: null });
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error('Logout failed');
    }
  }
}));