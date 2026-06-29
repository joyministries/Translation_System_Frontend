import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const USE_MOCKS = false;

// Stateful local mocks
let mockBooks = [
    { id: 1, title: 'C - Certificate Biology', language: 'English', file_type: 'pdf', uploadedBy: 'Admin', extractionStatus: 'completed' },
    { id: 2, title: 'D - Diploma Engineering', language: 'Spanish', file_type: 'docx', uploadedBy: 'Admin', extractionStatus: 'completed' },
    { id: 3, title: 'B - Bachelor Calculus', language: 'French', file_type: 'epub', uploadedBy: 'Admin', extractionStatus: 'completed' },
    { id: 4, title: 'Introduction to History', language: 'German', file_type: 'txt', uploadedBy: 'Admin', extractionStatus: 'completed' }
];

let mockExams = [
    { id: 11, title: 'C - Chemistry midterm', created_at: '2026-06-25T12:00:00Z' },
    { id: 12, title: 'D - Data Structures exam', created_at: '2026-06-24T12:00:00Z' },
    { id: 13, title: 'B - Advanced Physics exam', created_at: '2026-06-23T12:00:00Z' },
    { id: 14, title: 'General Knowledge quiz', created_at: '2026-06-22T12:00:00Z' }
];

export const axiosInstance = axios.create({ 
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
    timeout: 300000, // Increased to 5 minutes (300000ms) for heavy tasks like book uploads
    withCredentials: false, // Set to true if backend sends cookies
    adapter: async (config) => {
        if (!USE_MOCKS) {
            // Find default adapter
            const defaultAdapter = axios.defaults.adapter;
            if (typeof defaultAdapter === 'function') {
                return defaultAdapter(config);
            }
            // If not found, use standard adapter resolver
            const xhrAdapter = axios.getAdapter ? axios.getAdapter('xhr') : null;
            if (xhrAdapter) return xhrAdapter(config);
            throw new Error('No default adapter found');
        }

        const url = config.url || '';
        const method = config.method?.toLowerCase();
        
        if (url.includes('/auth/login')) {
            return {
                data: { access_token: 'mock-token', token: 'mock-token' },
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            };
        }
        if (url.includes('/auth/me')) {
            return {
                data: { role: 'admin', email: 'admin@example.com', user_role: 'admin', name: 'Admin' },
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            };
        }
        if (url.includes('/admin/translations/stats') || url.includes('/admin/stats')) {
            return {
                data: {
                    overview: {
                        total_translations: mockBooks.length + mockExams.length,
                        success_rate: '100%'
                    },
                    jobs: {
                        active: 0
                    }
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            };
        }
        if (url.includes('/admin/content/books') || url.includes('/admin/books/')) {
            if (method === 'delete') {
                const parts = url.split('/');
                const idToDelete = parseInt(parts[parts.length - 1], 10);
                mockBooks = mockBooks.filter(b => b.id !== idToDelete);
                return {
                    data: { message: 'Deleted' },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config,
                };
            }
            return {
                data: {
                    items: mockBooks
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            };
        }
        if (url.includes('/admin/content/exams') || url.includes('/admin/content/exams/') || url.includes('/admin/exams') || url.includes('/admin/exams/')) {
            if (method === 'delete') {
                const parts = url.split('/');
                const idToDelete = parseInt(parts[parts.length - 1], 10);
                mockExams = mockExams.filter(e => e.id !== idToDelete);
                return {
                    data: { message: 'Deleted' },
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config,
                };
            }
            return {
                data: {
                    items: mockExams
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            };
        }
        if (url.includes('/admin/content/languages')) {
            return {
                data: {
                    languages: [
                        { id: 'en', name: 'English', isActive: true },
                        { id: 'es', name: 'Spanish', isActive: true }
                    ]
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            };
        }
        if (url.includes('/translations/book/') || url.includes('/translations/exam/')) {
            return {
                data: [],
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            };
        }

        // Fallback
        const defaultAdapter = axios.defaults.adapter;
        if (typeof defaultAdapter === 'function') {
            return defaultAdapter(config);
        }
        const xhrAdapter = axios.getAdapter ? axios.getAdapter('xhr') : null;
        if (xhrAdapter) return xhrAdapter(config);
        throw new Error('Default adapter not found');
    }
 });


axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        
        // Add Authorization header
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // For FormData requests, remove Content-Type header to let axios set it automatically
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    }, (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    }, (error) => {
        // Handle CORS errors
        if (!error.response && error.message === 'Network Error') {
            console.error('CORS or Network Error:', {
                url: error.config?.url,
                method: error.config?.method,
                message: 'Check if backend has CORS enabled and is running'
            });
            return Promise.reject(new Error(
                'Unable to connect to the server. Please check your internet connection and try again.'
            ));
        }

        // Handle timeout errors
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            return Promise.reject(new Error(
                'The request took too long to complete. Please try again.'
            ));
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            // Clear invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirect to login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
            
            return Promise.reject(new Error('Session expired. Please login again.'));
        }

        // Decipher other errors to be user-friendly and informative
        const status = error.response?.status;
        const data = error.response?.data;
        
        let serverMessage = '';
        if (data) {
            if (typeof data === 'string') {
                serverMessage = data;
            } else if (typeof data === 'object') {
                if (typeof data.message === 'string') {
                    serverMessage = data.message;
                } else if (typeof data.detail === 'string') {
                    serverMessage = data.detail;
                } else if (Array.isArray(data.detail)) {
                    serverMessage = data.detail.map(d => {
                        if (typeof d === 'string') return d;
                        if (d && typeof d === 'object') {
                            return `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg || JSON.stringify(d)}`;
                        }
                        return JSON.stringify(d);
                    }).join('; ');
                } else if (typeof data.error === 'string') {
                    serverMessage = data.error;
                } else if (Array.isArray(data.non_field_errors)) {
                    serverMessage = data.non_field_errors.join(' ');
                } else if (typeof data.non_field_errors === 'string') {
                    serverMessage = data.non_field_errors;
                } else {
                    // Extract key-value field errors
                    const fieldErrors = [];
                    for (const key of Object.keys(data)) {
                        const val = data[key];
                        if (Array.isArray(val)) {
                            fieldErrors.push(`${key}: ${val.join(', ')}`);
                        } else if (typeof val === 'string') {
                            fieldErrors.push(`${key}: ${val}`);
                        }
                    }
                    if (fieldErrors.length > 0) {
                        serverMessage = fieldErrors.join('; ');
                    } else {
                        serverMessage = JSON.stringify(data);
                    }
                }
            }
        }
        
        // Ensure serverMessage is string and clean it up
        serverMessage = typeof serverMessage === 'string' ? serverMessage.trim() : '';
        
        const serverMessageLower = serverMessage.toLowerCase();
        const errorMsgLower = String(error.message).toLowerCase();
        
        // Check duplicate/already exists errors
        if (status === 409 || 
            serverMessageLower.includes('already exists') || 
            serverMessageLower.includes('already present') || 
            serverMessageLower.includes('already uploaded') || 
            serverMessageLower.includes('duplicate') ||
            serverMessageLower.includes('unique constraint') ||
            errorMsgLower.includes('already exists') || 
            errorMsgLower.includes('already present') || 
            errorMsgLower.includes('already uploaded') || 
            errorMsgLower.includes('duplicate')
        ) {
            return Promise.reject(new Error('The book or exam was already uploaded.'));
        }

        // HTTP specific friendly deciphering
        if (status === 400) {
            return Promise.reject(new Error(serverMessage || 'Invalid request. Please check the fields and try again.'));
        }
        if (status === 403) {
            return Promise.reject(new Error('Access denied. You do not have permission to perform this action.'));
        }
        if (status === 404) {
            return Promise.reject(new Error('The requested resource was not found.'));
        }
        if (status === 500) {
            return Promise.reject(new Error('Internal server error. Please try again later or contact support.'));
        }
        if (status === 503 || status === 502 || status === 504) {
            return Promise.reject(new Error('The translation service is temporarily unavailable. Please try again in a few moments.'));
        }

        const errorMessage = serverMessage || error.message || 'An unexpected error occurred. Please try again.';
        return Promise.reject(new Error(errorMessage));
    }
);
