import { axiosInstance } from "./baseapi";

export const authEndpoints = {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    refresh: '/auth/refresh',
    me: '/auth/me',
    forgotPassword: '/auth/change-password',
}

export const authAPI = {
    login: async (email, password) => {
        try {
            const response = await axiosInstance.post(authEndpoints.login, { email, password });
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    getMe: async () => {
        try {
            const response = await axiosInstance.get(authEndpoints.me);
            return response.data;
        } catch (error) {
            console.error('Get user info error:', error);
            throw error;
        }
    },
    logout: async () => {
        try {
            await axiosInstance.post(authEndpoints.logout);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },
    register: async (email, password, role) => {
        try { 
            const response = await axiosInstance.post(authEndpoints.register, { email, password, role });
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },
    refresh: async () => {
        try {
            const response = await axiosInstance.post(authEndpoints.refresh);
            return response.data;
        } catch (error) {
            console.error('Token refresh error:', error);
            throw error;
        }
    },
    forgotPassword: async (email) => {
        try {
            // This is a mock implementation.
            // In a real app, this would send a request to your backend.
            console.log(`Password reset requested for ${email}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            return { message: 'Password reset link sent.' };
        } catch (error) {
            console.error('Forgot password error:', error);
            throw new Error('Failed to send password reset link.');
        }
    }
}