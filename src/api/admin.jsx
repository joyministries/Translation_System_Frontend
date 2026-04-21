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
    answerkeys: '/admin/content/answer-keys',
    answerkeyImport: '/admin/answer-keys/import',
    languages: '/admin/content/languages',
    languagesActivate: '/admin/languages/{language_id}/activate',
    languagesDeactivate: '/admin/languages/{language_id}/deactivate',
    jobs: '/admin/jobs',
    users: '/admin/users',
    institutions: '/admin/institutions',
    all: '/admin/content',
    resetPassword: '/auth/reset-password',
}

// Helper function to trigger translations to all active languages
const triggerTranslationForContent = async (contentId, contentType) => {
    try {
        // Get all active languages
        const languagesResponse = await axiosInstance.get(adminEndpoints.languages);
        const activeLanguages = languagesResponse.data?.filter(lang => lang.isActive) || [];

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
        // Don't throw - translation is a secondary process
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

            const response = await axiosInstance.post(adminEndpoints.booksUpload, formData, config);

            // Trigger translation after successful upload
            if (response.data?.id) {
                await triggerTranslationForContent(response.data.id, 'book');
            }

            return response.data;
        },
        delete: (id) => axiosInstance.delete(`${adminEndpoints.books}/${id}`),
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
    },
    answerkeys: {
        list: async (page = 1, limit = 10) => {
            const response = await axiosInstance.get(adminEndpoints.answerkeys, {
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

            const response = await axiosInstance.post(adminEndpoints.answerkeyImport, formData, config);

            // Trigger translation after successful upload
            if (response.data?.id) {
                await triggerTranslationForContent(response.data.id, 'answerKey');
            }

            return response.data;
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
        create: (languageData) => axiosInstance.post(adminEndpoints.languages, languageData),
        get: (languageId) => axiosInstance.get(`${adminEndpoints.languages}/${languageId}`),
        update: (languageId, languageData) => axiosInstance.patch(`${adminEndpoints.languages}/${languageId}`, languageData),
        delete: (languageId) => axiosInstance.delete(`${adminEndpoints.languages}/${languageId}`),
        activate: (languageId) => axiosInstance.post(`${adminEndpoints.languages}/${languageId}/activate`),
        deactivate: (languageId) => axiosInstance.post(`${adminEndpoints.languages}/${languageId}/deactivate`),
        toggle: (languageId) => {
            // This will determine whether to activate or deactivate based on current state
            return axiosInstance.post(`${adminEndpoints.languages}/${languageId}/toggle`);
        },
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
        list: async (page = 1, limit = 10, role = null, institution_id = null) => {
            const response = await axiosInstance.get(adminEndpoints.users, {
                params: { page, limit, role, institution_id }
            });
            return response.data;
        }
    },

    // Institutions
    institutions: {
        list: async (page = 1, limit = 10) => {
            return axiosInstance.get(adminEndpoints.institutions, {
                params: { page, limit }
            });
        },
        create: (institutionData) => axiosInstance.post(adminEndpoints.institutions, institutionData),
        update: (institutionId, institutionData) => axiosInstance.put(`${adminEndpoints.institutions}/${institutionId}`, institutionData),
        delete: (institutionId) => axiosInstance.delete(`${adminEndpoints.institutions}/${institutionId}`),
        assignBooks: (institutionId, bookIds) => axiosInstance.post(`${adminEndpoints.institutions}/${institutionId}/books`, { bookIds }),
    },
    allContent: {
        list: async (skip = 0, limit = 100) => {
            return axiosInstance.get(adminEndpoints.all, {
                params: { skip, limit }
            });
        },
        listByType: (contentType, skip = 0, limit = 100) => {
            return axiosInstance.get(adminEndpoints.all, {
                params: { content_type: contentType, skip, limit }
            });
        },
    },
};