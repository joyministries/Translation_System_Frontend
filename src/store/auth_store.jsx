import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  role: null,
  isAuthenticated: false,
  isInitializing: true,

  // Set token and user info after successful login
  setToken: (token, user) => {
    // Handle both 'role' and 'user_role' fields from different API responses
    const userRole = user?.user_role || user?.role || null;

    // Persist to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    set({
      token,
      user,
      role: userRole,
      isAuthenticated: true,
      isInitializing: false,
    });
  },

  // Clear token on logout
  clearToken: () => {
    set({
      token: null,
      user: null,
      role: null,
      isAuthenticated: false,
      isInitializing: false,
    });
  },

  // Logout action
  logout: () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    set({
      token: null,
      user: null,
      role: null,
      isAuthenticated: false,
      isInitializing: false,
    });
  },

  // Initialize auth from localStorage on app startup
  initializeAuth: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const userRole = user?.user_role || user?.role || null;

        set({
          token,
          user,
          role: userRole,
          isAuthenticated: true,
          isInitializing: false,
        });
      } catch (error) {
        // If localStorage is corrupted, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ isInitializing: false });
      }
    } else {
      set({ isInitializing: false });
    }
  },
}));
