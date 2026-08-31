import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

const useManagerStore = create((set, get) => ({
  turbines: [],
  farmDetails: null,
  isLoading: false,
  error: null,

  fetchTurbines: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/api/manager/getAllTurbines`, {
        withCredentials: true
      });

      set({
        turbines: response.data.turbines || [],
        farmDetails: response.data.farmDetails || null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch wind farm data'
      });
      console.error('Error fetching turbines:', error);
    }
  },

  addTurbine: async (turbineData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/manager/turbines`,
        turbineData,
        { withCredentials: true }
      );

      const newTurbine = response.data.turbine;
      set((state) => ({
        turbines: [newTurbine, ...state.turbines],
        isLoading: false,
        error: null
      }));
      return { success: true, turbine: newTurbine };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add turbine';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  updateTurbine: async (id, updatedData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/manager/turbines/${id}`,
        updatedData,
        { withCredentials: true }
      );

      const updatedTurbine = response.data.turbine;
      set((state) => ({
        turbines: state.turbines.map((t) => (t._id === id ? updatedTurbine : t)),
        isLoading: false,
        error: null
      }));
      return { success: true, turbine: updatedTurbine };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update turbine';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  deleteTurbine: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_BASE_URL}/api/manager/turbines/${id}`, {
        withCredentials: true
      });

      set((state) => ({
        turbines: state.turbines.filter((t) => t._id !== id),
        isLoading: false,
        error: null
      }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete turbine';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  clearManagerData: () =>
    set({
      turbines: [],
      farmDetails: null,
      error: null
    })
}));

export default useManagerStore;