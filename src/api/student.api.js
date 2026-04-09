import client from './client';

export const studentAPI = {
  // Books endpoints
  books: {
    list: async (page = 1, limit = 20) => {
      try {
        const response = await client.get(`/student/books?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch books' };
      }
    },

    detail: async (bookId) => {
      try {
        const response = await client.get(`/student/books/${bookId}`);
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch book' };
      }
    },
  },

  // Languages endpoints
  languages: {
    list: async () => {
      try {
        const response = await client.get('/student/languages');
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch languages' };
      }
    },
  },

  // Translation endpoints
  translate: {
    trigger: async (bookId, targetLanguage) => {
      try {
        const response = await client.post('/student/translate', { bookId, targetLanguage });
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Translation trigger failed' };
      }
    },

    status: async (jobId) => {
      try {
        const response = await client.get(`/student/translate/status/${jobId}`);
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch status' };
      }
    },

    get: async (translationId) => {
      try {
        const response = await client.get(`/student/translations/${translationId}`);
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch translation' };
      }
    },

    download: async (translationId) => {
      try {
        const response = await client.get(`/student/translations/${translationId}/download`, {
          responseType: 'blob',
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Download failed' };
      }
    },
  },
};
