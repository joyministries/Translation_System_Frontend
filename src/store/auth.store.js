import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  role: null,
  isAuthenticated: false,

  // Set token and user info after successful login
  setToken: (token, user) => {
    set({
      token,
      user,
      role: user?.role || null,
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
