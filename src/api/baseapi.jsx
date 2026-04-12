import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL

export const axiosInstance = axios.create({ 
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
    timeout: 30000,
    withCredentials: false, // Set to true if backend sends cookies
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
                'Network Error: The backend may not be accessible. Check CORS settings on backend.'
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

        // Handle other errors
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        return Promise.reject(new Error(errorMessage));
    }
);
