import client from './client';

export const adminAPI = {
  // Books endpoints
  books: {
    list: async (page = 1, limit = 20) => {
      try {
        const response = await client.get(`/admin/books?page=${page}&limit=${limit}`);
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
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Upload failed' };
      }
    },

    delete: async (bookId) => {
      try {
        const response = await client.delete(`/admin/books/${bookId}`);
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Delete failed' };
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
        throw error.response?.data || { message: 'Toggle failed' };
      }
    },
  },

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

  // Exams endpoints
  exams: {
    import: async (file) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await client.post('/admin/exams/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || { message: 'Exam import failed' };
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
        throw error.response?.data || { message: 'Answer key import failed' };
      }
    },
  },
};
