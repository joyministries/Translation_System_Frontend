import { axiosInstance } from "./baseapi";

export const authEndpoints = {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    refresh: '/auth/refresh',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password/',
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
    getMe: async (token) => {
        try {
            const config = {};
            if (token) {
                config.headers = { Authorization: `Bearer ${token}` };
            }
            const response = await axiosInstance.get(authEndpoints.me, config);
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
            const response = await axiosInstance.post(authEndpoints.forgotPassword, { email });
            return response.data;
        } catch (error) {
            console.error('Forgot password error:', error);
            const message = error.response?.data?.message || error.response?.data?.detail || 'Failed to send password reset link.';
            throw new Error(message);
        }
    },
    updateProfile: async (payload) => {
        try {
            const response = await axiosInstance.patch(authEndpoints.me, payload);
            return response.data;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    },
    resetPassword: async (token, email, password, passwordConfirmation) => {
        try {
            const response = await axiosInstance.post(authEndpoints.resetPassword, {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation
            });
            return response.data;
        } catch (error) {
            console.error('Reset password error:', error);
            const message = error.response?.data?.message || error.response?.data?.detail || 'Failed to reset password.';
            throw new Error(message);
        }
    }
}