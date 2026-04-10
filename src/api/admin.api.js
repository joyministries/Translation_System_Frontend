import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_URL,
});

// Add request interceptor for JWT token
client.interceptors.request.use((config) => {
  // Get token from store
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for 401 handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  // Stats endpoints
  stats: {
    get: async () => {
      try {
        const response = await client.get('/admin/translations/stats');
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch stats' };
      }
    },
  },

  // Books endpoints
  books: {
    list: async (page = 1, limit = 100) => {
      try {
        const response = await client.get('/admin/books', {
          params: { page, limit },
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch books' };
      }
    },

    upload: async (file) => {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await client.post('/admin/books/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: () => {
            // Upload progress tracking available if needed
          },
        });
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message;
        if (message) {
          throw { message };
        }
        throw { message: error.message || 'Upload failed' };
      }
    },

    delete: async (bookId) => {
      try {
        const response = await client.delete(`/admin/books/${bookId}`);
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Failed to delete book' };
      }
    },
  },

  // Exams endpoints
  exams: {
    list: async (page = 1, limit = 100) => {
      try {
        const response = await client.get('/admin/exams', {
          params: { page, limit },
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch exams' };
      }
    },

    import: async (file) => {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await client.post('/admin/exams/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Failed to import exams' };
      }
    },
  },

  // Languages endpoints
  languages: {
    list: async () => {
      try {
        const response = await client.get('/admin/languages');
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch languages' };
      }
    },

    toggle: async (languageId) => {
      try {
        const response = await client.patch(`/admin/languages/${languageId}`);
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Failed to update language' };
      }
    },
  },

  // Answer keys endpoints
  answerKeys: {
    import: async (file) => {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await client.post('/admin/answer-keys/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Failed to import answer keys' };
      }
    },
  },

  // Institutions endpoints
  institutions: {
    list: async () => {
      try {
        const response = await client.get('/admin/institutions');
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch institutions' };
      }
    },

    updateBooks: async (institutionId, bookIds) => {
      try {
        const response = await client.put(`/admin/institutions/${institutionId}/books`, {
          bookIds,
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Failed to update book assignments' };
      }
    },
  },
};
