import { axiosInstance } from './baseapi';

export const studentEndpoints = {
    books: '/student/content/books',
    exams: '/student/content/exams',
    answerKeys: '/student/content/answer-keys',
    translations: '/student/translations',
    profile: '/student/profile',
    triggerTranslate: '/student/translate',
    getTranslationStatus: '/student/translate/status',
    getTranslation: '/student/translate',
    downloadTranslation: '/student/translate',
    languages: '/student/content/languages',
    bookTranslations: (bookId) => `/translations/book/${bookId}`,
    examTranslations: (examId) => `/translations/exam/${examId}`,
}

export const studentAPI = {
    // Trigger a translation job
    triggerTranslation: async (content_type, content_id, language_id) => {
        try {
            const response = await axiosInstance.post(studentEndpoints.triggerTranslate, null, {
                params: {
                    content_type,
                    content_id,
                    language_id,
                },
            });
            return response.data; // Returns { job_id, status, ... }
        } catch (error) {
            console.error('Trigger translation error:', error);
            throw error;
        }
    },

    // Get translation job status
    getTranslationStatus: async (jobId) => {
        try {
            const response = await axiosInstance.get(`${studentEndpoints.getTranslationStatus}/${jobId}`);
            return response.data; // Returns { job_id, status, progress, ... }
        } catch (error) {
            console.error('Get translation status error:', error);
            throw error;
        }
    },

    // Get translation details (after completion)
    getTranslation: async (translationId) => {
        try {
            const response = await axiosInstance.get(`${studentEndpoints.getTranslation}/${translationId}`);
            return response.data;
        } catch (error) {
            console.error('Get translation error:', error);
            throw error;
        }
    },

    // Download translated file
    downloadTranslation: async (translationId) => {
        try {
            if (!translationId) {
                throw new Error('Translation ID is required for download');
            }
            const response = await axiosInstance.get(`${studentEndpoints.downloadTranslation}/${translationId}/download`, {
                responseType: 'blob',
            });
            let filename = null;
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition && contentDisposition.includes('attachment')) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }
            return {
                blob: response.data,
                filename: filename
            };
        } catch (error) {
            console.error('Download translation error:', error);
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: error.config,
            });
            throw error;
        }
    },

    // Download translated file from a given relative URL
    downloadFromUrl: async (url) => {
        try {
            const response = await axiosInstance.get(url, {
                responseType: 'blob',
            });
            let filename = null;
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition && contentDisposition.includes('attachment')) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }
            return {
                blob: response.data,
                filename: filename
            };
        } catch (error) {
            console.error('Download from URL error:', error);
            throw error;
        }
    },

    // Poll translation status until completion (helper method)
    pollTranslationStatus: async (jobId, maxAttempts = 60, interval = 1000) => {
        let attempts = 0;
        return new Promise((resolve, reject) => {
            const checkStatus = async () => {
                try {
                    const status = await studentAPI.getTranslationStatus(jobId);

                    if (status.status === 'completed') {
                        resolve(status);
                    } else if (status.status === 'failed') {
                        reject(new Error(`Translation job failed: ${status.error}`));
                    } else if (attempts >= maxAttempts) {
                        reject(new Error('Translation job timeout'));
                    } else {
                        attempts++;
                        setTimeout(checkStatus, interval);
                    }
                } catch (error) {
                    reject(error);
                }
            };
            checkStatus();
        });
    },

    // List of books
    getBooks: async () => {
        try {
            const response = await axiosInstance.get(studentEndpoints.books);
            return response.data.books;
        } catch (error) {
            console.error('Get books error:', error);
            return []; // Return empty array on error
        }
    },

    // Get single book by ID
    getBook: async (bookId) => {
        try {
            const response = await axiosInstance.get(`${studentEndpoints.books}/${bookId}`);
            return response.data;
        } catch (error) {
            console.error('Get book error:', error);
            return null; // Return null if book not found
        }
    },

    // List of exams
    getExams: async () => {
        try {
            const response = await axiosInstance.get(studentEndpoints.exams);

            return response.data?.exams || response.data?.data || response.data || []; // Handle various response formats
        } catch (error) {
            console.error('Get exams error:', error);
            return []; // Return empty array on error
        }
    },

    // Get single exam by ID
    getExam: async (examId) => {
        try {
            const response = await axiosInstance.get(`${studentEndpoints.exams}/${examId}`);
            return response.data; // Returns { id, title, subject, ... }
        } catch (error) {
            console.error('Get exam error:', error);
            return null; // Return null if exam not found
        }
    },

    // List answer keys
    getAnswerKeys: async () => {
        try {
            const response = await axiosInstance.get(studentEndpoints.answerKeys);
            // Handle various response formats
            const answerKeysArray = Array.isArray(response.data) ? response.data : (response.data?.answerKeys || response.data?.data || []);
            return answerKeysArray;
        } catch (error) {
            console.error('Get answer keys error:', error);
            return []; // Return empty array on error
        }
    },

    // Get single answer key by ID
    getAnswerKey: async (answerId) => {
        try {
            const response = await axiosInstance.get(`${studentEndpoints.answerKeys}/${answerId}`);
            return response.data; // Returns { id, content, ... }
        } catch (error) {
            console.error('Get answer key error:', error);
            return null; // Return null if answer key not found
        }
    },

    getAvailableLanguages: async () => {
        try {
            const response = await axiosInstance.get(studentEndpoints.languages);
            return response.data.languages; // Returns array of languages
        } catch (error) {
            console.error('Get available languages error:', error);
            return []; // Return empty array on error
        }
    },

    // Get all completed translations for a specific book
    getBookTranslations: async (bookId) => {
        try {
            const response = await axiosInstance.get(studentEndpoints.bookTranslations(bookId));
            // Normalise: accept array or wrapped object
            const raw = response.data;
            return Array.isArray(raw) ? raw : (raw?.translations || raw?.items || raw?.data || []);
        } catch (error) {
            console.error('Get book translations error:', error);
            return [];
        }
    },

    // Get all completed translations for a specific exam
    getExamTranslations: async (examId) => {
        try {
            const response = await axiosInstance.get(studentEndpoints.examTranslations(examId));
            const raw = response.data;
            return Array.isArray(raw) ? raw : (raw?.translations || raw?.items || raw?.data || []);
        } catch (error) {
            console.error('Get exam translations error:', error);
            return [];
        }
    },
}


