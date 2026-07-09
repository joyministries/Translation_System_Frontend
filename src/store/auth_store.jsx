import { create } from 'zustand';

// Tab-scoped storage — safer than localStorage; cleared automatically when the tab closes.
const TOKEN_KEY = 'access_token';
const USER_KEY = 'auth_user';

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  role: null,
  isAuthenticated: false,
  isInitializing: true,

  setAuthData: (token, user) => {
    const userRole = user?.user_role || user?.role || null;
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    set({
      token,
      user,
      role: userRole,
      isAuthenticated: true,
      isInitializing: false,
    });
  },

  clearAuth: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    set({
      token: null,
      user: null,
      role: null,
      isAuthenticated: false,
      isInitializing: false,
    });
  },

  logout: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    set({
      token: null,
      user: null,
      role: null,
      isAuthenticated: false,
      isInitializing: false,
    });
  },

  initializeAuth: () => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const userStr = sessionStorage.getItem(USER_KEY);

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
      } catch {
        // Corrupted storage — clear and require re-login.
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
        set({ isInitializing: false });
      }
    } else {
      set({ isInitializing: false });
    }
  },
}));

