import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  role: null,
  isAuthenticated: false,

  // Set token and user info after successful login
  setToken: (token, user) => {
    // Handle both 'role' and 'user_role' fields from different API responses
    const userRole = user?.user_role || user?.role || null;

    set({
      token,
      user,
      role: userRole,
      isAuthenticated: true,
    });
  },

  // Clear token on logout
  clearToken: () => {
    set({
      token: null,
      user: null,
      role: null,
      isAuthenticated: false,
    });
  },

  // Logout action
  logout: () => {
    set({
      token: null,
      user: null,
      role: null,
      isAuthenticated: false,
    });
  },
}));
