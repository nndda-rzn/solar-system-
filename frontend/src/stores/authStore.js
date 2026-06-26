import { create } from 'zustand';
import { authService } from '../services/authService';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(credentials);
      const payload = response.data ?? response;
      localStorage.setItem('token', payload.token);
      set({ user: payload.user, token: payload.token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, message: error.message };
    }
  },

  register: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await authService.register(userData);
      const payload = response.data ?? response;
      localStorage.setItem('token', payload.token);
      set({ user: payload.user, token: payload.token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, message: error.message };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const response = await authService.getMe();
      const payload = response.data ?? response;
      set({ user: payload.user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false });
    }
  }
}));

export default useAuthStore;
