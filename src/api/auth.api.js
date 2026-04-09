import client from './client';

export const authAPI = {
  // Login endpoint: POST /auth/login
  login: async (email, password) => {
    try {
      const response = await client.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Logout endpoint
  logout: async () => {
    try {
      await client.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
};
