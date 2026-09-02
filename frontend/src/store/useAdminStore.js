import { create } from 'zustand';
import api from '../api/axios'; // Adjust the import path to match your axios instance location

export const useAdminStore = create((set, get) => ({
  farms: [],
  users: [],
  loading: false,
  error: null,

  // Fetch all non-admin users (managers & engineers)
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/admin/users');
      set({ users: response.data.data, loading: false });
    } catch (err) {
      const message = err.response?.data?.message || 'Error fetching users';
      set({ error: message, loading: false });
    }
  },

  // Fetch all farms along with their assigned manager and engineers
  fetchFarms: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/admin/farms');
      set({ farms: response.data.data, loading: false });
    } catch (err) {
      const message = err.response?.data?.message || 'Error fetching farms';
      set({ error: message, loading: false });
    }
  },

  // Create a new wind farm and assign staff
  createFarm: async (farmData) => {
    set({ loading: true, error: null });
    try {
      await api.post('/api/admin/create-farm', farmData);
      // Synchronize both stores so staff assignments reflect immediately
      await Promise.all([get().fetchFarms(), get().fetchUsers()]);
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create farm';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  // Update farm details, reassign/replace manager, and sync engineers
  updateFarm: async (farmId, farmData) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/api/admin/update-farm/${farmId}`, farmData);
      // Synchronize both stores so reassigned staff reflect immediately
      await Promise.all([get().fetchFarms(), get().fetchUsers()]);
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update farm';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  // Clear any existing error state
  clearError: () => set({ error: null })
}));