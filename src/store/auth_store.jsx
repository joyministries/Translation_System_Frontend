import { create } from 'zustand';
import { axiosInstance, registerTokenProvider } from '../api/baseapi';

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  role: null,
  isAuthenticated: false,
  isInitializing: true,

  setToken: (token) => {
    set({ token });
  },

  setAuthData: (user) => {
    const userRole = user?.role || null;
    set({
      user,
      role: userRole,
      isAuthenticated: true,
      isInitializing: false,
    });
  },

  clearAuth: () => {      
    set({
      token: null,
      user: null,
      role: null,
      isAuthenticated: false,
      isInitializing: false,
    });
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      // Gracefully handle backend errors during cleanup
    } finally {
      set({
        token: null,
        user: null,
        role: null,
        isAuthenticated: false,
        isInitializing: false,
      });
    }
  },

  initializeAuth: async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      const user = response.data?.user || response.data;
      const userRole = user?.role || null;
      set({
        user,
        role: userRole,
        isAuthenticated: true,
      });
    } catch (error) {
      set({
        token: null,
        user: null,
        role: null,
        isAuthenticated: false,
      });
    } finally {
      set({ isInitializing: false });
    }
  },
}));

registerTokenProvider(() => useAuthStore.getState().token);

