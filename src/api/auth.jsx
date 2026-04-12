import { axiosInstance } from "./baseapi";

export const authEndpoints = {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    refresh: '/auth/refresh',
    me: '/auth/me',
    setPassword: '/auth/set-password',
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
    setPassword: async (email, token, password) => {
        try {
            const response = await axiosInstance.post(authEndpoints.setPassword, {
                email,
                token,
                password,
            });
            return response.data;
        } catch (error) {
            console.error('Set password error:', error);
            throw error;
        }
    },
}