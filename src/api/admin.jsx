import { axiosInstance } from "./baseapi"

export const adminEndpoints = {
    stats: '/admin/stats',
    books: '/admin/books',
    booksUpload: '/admin/books/upload',
    translations: '/admin/translations',
    translationStats: '/admin/translations/stats',
    translationTranslate: '/admin/translations/translate',
    exams: '/admin/exams',
    examsImport: '/admin/exams/import',
    answerkeys: '/admin/answer-keys',
    answerkeyImport: '/admin/answer-keys/import',
    languages: '/admin/languages',
    languagesActivate: '/admin/languages/{language_id}/activate',
    languagesDeactivate: '/admin/languages/{language_id}/deactivate',
    jobs: '/admin/jobs',
    users: '/admin/users',
    institutions: '/admin/institutions',
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
        console.log(`Translation triggered for ${contentType} ${contentId} to ${activeLanguages.length} languages`);
    } catch (error) {
        console.warn('Failed to trigger automatic translation:', error.message);
        // Don't throw - translation is a secondary process
    }
};

export const adminAPI = {
    getStats: async () => {
        const response = await axiosInstance.get(adminEndpoints.stats);
        return response.data;
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
    },

    // Jobs
    jobs: {
        list: () => axiosInstance.get(adminEndpoints.jobs),
    },

    // Legacy methods for backward compatibility
    getStats: () => axiosInstance.get(adminEndpoints.stats),
    getBooks: () => axiosInstance.get(adminEndpoints.books),
    uploadBook: async (file) => adminAPI.books.upload(file),
    deleteBook: (bookId) => adminAPI.books.delete(bookId),
    getExams: () => axiosInstance.get(adminEndpoints.exams),
    importExam: async (file) => adminAPI.exams.import(file),
    getAnswerKeys: () => axiosInstance.get(adminEndpoints.answerkeys),
    importAnswerKey: async (file) => adminAPI.answerKeys.import(file),
    getLanguages: () => axiosInstance.get(adminEndpoints.languages),
    createLanguage: (languageData) => axiosInstance.post(adminEndpoints.languages, languageData),
    getLanguage: (languageId) => axiosInstance.get(`${adminEndpoints.languages}/${languageId}`),
    updateLanguage: (languageId, languageData) => axiosInstance.patch(`${adminEndpoints.languages}/${languageId}`, languageData),
    activateLanguage: (languageId) => axiosInstance.post(`${adminEndpoints.languages}/${languageId}/activate`),
    deactivateLanguage: (languageId) => axiosInstance.post(`${adminEndpoints.languages}/${languageId}/deactivate`),
    getTranslations: () => axiosInstance.get(adminEndpoints.translations),
    getTranslationStats: () => axiosInstance.get(adminEndpoints.translationStats),
    triggerTranslation: (translationData) => axiosInstance.post(adminEndpoints.translationTranslate, translationData),
    getJobs: () => axiosInstance.get(adminEndpoints.jobs),

    // Users
    users: {
        list: (page = 1, limit = 100) => {
            const skip = (page - 1) * limit;
            return axiosInstance.get(adminEndpoints.users, {
                params: { skip, limit }
            });
        },
        create: (userData) => {
            const { name, ...rest } = userData; // Exclude name from the request
            return axiosInstance.post(adminEndpoints.users, { ...rest, use_temp_password: true });
        },
        delete: (userId) => axiosInstance.delete(`${adminEndpoints.users}/${userId}`),
        update: (userId, userData) => axiosInstance.put(`${adminEndpoints.users}/${userId}`, userData),
    },

    // Institutions
    institutions: {
        list: (page = 1, limit = 100) => {
            const skip = (page - 1) * limit;
            return axiosInstance.get(adminEndpoints.institutions, {
                params: { skip, limit }
            });
        },
        create: (institutionData) => axiosInstance.post(adminEndpoints.institutions, institutionData),
        update: (institutionId, institutionData) => axiosInstance.put(`${adminEndpoints.institutions}/${institutionId}`, institutionData),
        delete: (institutionId) => axiosInstance.delete(`${adminEndpoints.institutions}/${institutionId}`),
        assignBooks: (institutionId, bookIds) => axiosInstance.post(`${adminEndpoints.institutions}/${institutionId}/books`, { bookIds }),
    },
};