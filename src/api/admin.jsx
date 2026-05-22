import { axiosInstance } from "./baseapi"

export const adminEndpoints = {
    stats: '/admin/stats',
    books: '/admin/content/books',
    booksUpload: '/admin/books/upload',
    translations: '/admin/translations',
    translationStats: '/admin/translations/stats',
    translationTranslate: '/admin/translations/translate',
    exams: '/admin/content/exams',
    examsImport: '/admin/content/exams/import',
    languages: '/admin/content/languages',
    languagesActivate: '/admin/languages/{language_id}/activate',
    languagesDeactivate: '/admin/languages/{language_id}/deactivate',
    jobs: '/admin/jobs',
    users: '/admin/users',
    all: '/admin/content',
    bookTranslations: (bookId) => `/translations/book/${bookId}`,
    examTranslations: (examId) => `/translations/exam/${examId}`,
}

// Helper function to trigger translations to all active languages
const triggerTranslationForContent = async (contentId, contentType) => {
    try {
        // Get all active languages
        const languagesResponse = await axiosInstance.get(adminEndpoints.languages);
        const rawData = languagesResponse.data;
        const languagesArray = Array.isArray(rawData) ? rawData : (rawData?.items || rawData?.languages || rawData?.data || []);
        const activeLanguages = languagesArray.filter(lang => lang.isActive || lang.is_active) || [];

        // Trigger translation for each active language
        const translationPromises = activeLanguages.map(lang =>
            axiosInstance
                .post(adminEndpoints.translationTranslate, null, {
                    params: {
                        content_id: contentId,
                        content_type: contentType, // 'book', 'exam', or 'answerKey'
                        language_id: lang.id,
                    },
                })
                .catch(err => {
                    console.warn(`Translation to ${lang.name} failed:`, err.message);
                    return null;
                })
        );

        await Promise.all(translationPromises);
    } catch (error) {
        console.warn('Failed to trigger automatic translation:', error.message);
    }
};

export const adminAPI = {
    resetPassword: async (email) => {
        try {
            const response = await axiosInstance.post(adminEndpoints.resetPassword, { email });
            return response.data;
        } catch (error) {
            console.error('Error resetting password:', error.message);
            throw error;
        }
    },

    books: {
        list: async (page = 1, limit = 10) => {
            const response = await axiosInstance.get(adminEndpoints.books, {
                params: { page, limit }
            });
            return response.data;
        },
        upload: async (file, metadata, images, handleProgress) => {
            const formData = new FormData();
            formData.append('file', file);
            Object.keys(metadata).forEach(key => {
                let value = metadata[key];
                if (key === 'first_content_page') {
                    value = parseInt(value, 10);
                }
                formData.append(key, value);
            });
            
            // Append images to FormData
            if (images && images.length > 0) {
                images.forEach((image) => {
                    formData.append('images', image);
                });
            }

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (handleProgress) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        handleProgress({
                            progress,
                            loaded: progressEvent.loaded,
                            total: progressEvent.total,
                        });
                    }
                },
            };
            console.log('Data sending to backend:', formData);

            const response = await axiosInstance.post(adminEndpoints.booksUpload, formData, config);

            // Trigger translation after successful upload
            if (response.data?.id) {
                await triggerTranslationForContent(response.data.id, 'book');
            }

            return response.data;
        },
        delete: (id) => axiosInstance.delete(`/admin/books/${id}`),
        // Get all completed translations for a specific book
        getTranslations: async (bookId) => {
            try {
                const response = await axiosInstance.get(adminEndpoints.bookTranslations(bookId));
                const raw = response.data;
                return Array.isArray(raw) ? raw : (raw?.translations || raw?.items || raw?.data || []);
            } catch (error) {
                console.error('Get book translations error:', error);
                return [];
            }
        },
        // Upload reference images for a book
        uploadReferences: async (bookId, files, onProgress) => {
            const formData = new FormData();
            if (files && files.length > 0) {
                files.forEach((file) => {
                    formData.append('images', file);
                });
            }

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (onProgress) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress({
                            progress,
                            loaded: progressEvent.loaded,
                            total: progressEvent.total,
                        });
                    }
                },
            };

            const response = await axiosInstance.post(`/admin/books/${bookId}/images`, formData, config);
            return response.data;
        },
    },
    exams: {
        list: async (page = 1, limit = 10) => {
            const response = await axiosInstance.get(adminEndpoints.exams, {
                params: { page, limit }
            });
            return response.data;
        },
        upload: async (file, metadata, onProgress) => {
            const formData = new FormData();
            formData.append('file', file);
            Object.keys(metadata).forEach(key => {
                formData.append(key, metadata[key]);
            });

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (onProgress) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress({
                            progress,
                            loaded: progressEvent.loaded,
                            total: progressEvent.total,
                        });
                    }
                },
            };

            const response = await axiosInstance.post(adminEndpoints.examsImport, formData, config);

            // Trigger translation after successful upload
            if (response.data?.id) {
                await triggerTranslationForContent(response.data.id, 'exam');
            }

            return response.data;
        },
        delete: (id) => axiosInstance.delete(`${adminEndpoints.exams}/${id}`),
        // Get all completed translations for a specific exam
        getTranslations: async (examId) => {
            try {
                const response = await axiosInstance.get(adminEndpoints.examTranslations(examId));
                const raw = response.data;
                return Array.isArray(raw) ? raw : (raw?.translations || raw?.items || raw?.data || []);
            } catch (error) {
                console.error('Get exam translations error:', error);
                return [];
            }
        },
    },

    // Languages
    languages: {
        list: (page = 1, limit = 100) => {
            const skip = (page - 1) * limit;
            return axiosInstance.get(adminEndpoints.languages, {
                params: { skip, limit }
            });
        },
        activate: (languageId) => axiosInstance.post(`${adminEndpoints.languages}/${languageId}/activate`),
        deactivate: (languageId) => axiosInstance.post(`${adminEndpoints.languages}/${languageId}/deactivate`),
    },

    // Translations
    translations: {
        list: () => axiosInstance.get(adminEndpoints.translations),
        getStats: () => axiosInstance.get(adminEndpoints.translationStats),
        trigger: (contentId, contentType, languageId) => {
            return axiosInstance.post(adminEndpoints.translationTranslate, null, {
                params: {
                    content_id: contentId,
                    content_type: contentType,
                    language_id: languageId,
                },
            });
        },
        triggerTranslation: (contentId, contentType, languageId) => {
            return axiosInstance.post(adminEndpoints.translationTranslate, null, {
                params: {
                    content_id: contentId,
                    content_type: contentType,
                    language_id: languageId,
                },
            });
        },
        download: async (translationId) => {
            const response = await axiosInstance.get(`${adminEndpoints.translations}/${translationId}/download`, {
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
        },
        translation: (translation_id) => {
            return axiosInstance.get(`${adminEndpoints.translations}/${translation_id}`);
        },
        getTranslation: (translation_id) => {
            return axiosInstance.get(`${adminEndpoints.translations}/${translation_id}`);
        },
        failed: () => axiosInstance.get(`${adminEndpoints.translations}/failed`),
    },

    // Jobs
    jobs: {
        list: () => axiosInstance.get(adminEndpoints.jobs),
    },

    // Users
    users: {
        create: async (userData) => {
            const response = await axiosInstance.post(adminEndpoints.users, userData);
            return response.data;
        },
        list: async (page = 1, limit = 10, role = null) => {
            const response = await axiosInstance.get(adminEndpoints.users, {
                params: { page, limit, role }
            });
            return response.data;
        },
        update: async (userId, userData) => {
            const response = await axiosInstance.put(`${adminEndpoints.users}/${userId}`, userData);
            return response.data;
        },
        delete: async (userId) => {
            const response = await axiosInstance.delete(`${adminEndpoints.users}/${userId}`);
            return response.data;
        },
    },
};
