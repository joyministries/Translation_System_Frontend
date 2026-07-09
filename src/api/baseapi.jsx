import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

let tokenProvider = () => null;

export const registerTokenProvider = (provider) => {
    tokenProvider = provider;
};

export const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
    timeout: 300000,
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = tokenProvider();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Omitting Content-Type lets the browser set the correct multipart boundary.
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    }, (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response && error.message === 'Network Error') {
            return Promise.reject(new Error(
                'Unable to connect to the server. Please check your internet connection and try again.'
            ));
        }

        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            return Promise.reject(new Error(
                'The request took too long to complete. Please try again.'
            ));
        }

        if (error.response?.status === 401) {
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }

            return Promise.reject(new Error('Session expired. Please login again.'));
        }

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
                    const fieldErrors = [];
                    for (const key of Object.keys(data)) {
                        const val = data[key];
                        if (Array.isArray(val)) {
                            fieldErrors.push(`${key}: ${val.join(', ')}`);
                        } else if (typeof val === 'string') {
                            fieldErrors.push(`${key}: ${val}`);
                        }
                    }
                    serverMessage = fieldErrors.length > 0 ? fieldErrors.join('; ') : JSON.stringify(data);
                }
            }
        }

        serverMessage = typeof serverMessage === 'string' ? serverMessage.trim() : '';

        const serverMessageLower = serverMessage.toLowerCase();
        const errorMsgLower = String(error.message).toLowerCase();

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

        if (status === 400) return Promise.reject(new Error(serverMessage || 'Invalid request. Please check the fields and try again.'));
        if (status === 403) return Promise.reject(new Error('Access denied. You do not have permission to perform this action.'));
        if (status === 404) return Promise.reject(new Error('The requested resource was not found.'));
        if (status === 500) return Promise.reject(new Error('Internal server error. Please try again later or contact support.'));
        if (status === 503 || status === 502 || status === 504) return Promise.reject(new Error('The translation service is temporarily unavailable. Please try again in a few moments.'));

        return Promise.reject(new Error(serverMessage || error.message || 'An unexpected error occurred. Please try again.'));
    }
);

