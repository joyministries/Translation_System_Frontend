import client from './client';
import { mockAuthResponses, delay } from '../mocks/auth.mock';

export const authAPI = {
  // Login endpoint: POST /auth/login
  login: async (email, password) => {
    try {
      const response = await client.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      // Fallback to mock data when backend is not available
      if (error.code === 'ERR_NETWORK' || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        console.warn('Backend not available, using mock data for testing');
        await delay(500); // Simulate network delay

        // Return mock admin data if email contains 'admin'
        if (email.toLowerCase().includes('admin')) {
          return mockAuthResponses.admin;
        }
        // Return mock student data otherwise
        return mockAuthResponses.student;
      }
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
