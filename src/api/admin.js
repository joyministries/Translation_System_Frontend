import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL

const axiosInstance = axios.create({ baseURL: API_URL })

export const adminEndpoints = {
    stats: '/admin/stats',
    books: '/admin/books',
    translations: '/admin/translations',
    languages: '/admin/languages',
    jobs: '/admin/jobs',
}

export const adminAPI = {
    stats: {
        get: async () => {
            try {
                const response = await axiosInstance.get(adminEndpoints.stats)
                return response.data
            } catch (error) {
                console.error('Error fetching admin stats:', error)
                throw error
            }
        },
    },
    books: {
        get: async () => {
            // TODO: Implement get books
        },
        create: async (data) => {
            // TODO: Implement create book
        },
        update: async (id, data) => {
            // TODO: Implement update book
        },
        delete: async (id) => {
            // TODO: Implement delete book
        },
    },
    translations: {
        get: async () => {
            // TODO: Implement get translations
        },
        create: async (data) => {
            // TODO: Implement create translation
        },
        update: async (id, data) => {
            // TODO: Implement update translation
        },
        delete: async (id) => {
            // TODO: Implement delete translation
        },
    },
    languages: {
        get: async () => {
            // TODO: Implement get languages
        },
        create: async (data) => {
            // TODO: Implement create language
        },
        update: async (id, data) => {
            // TODO: Implement update language
        },
        delete: async (id) => {
            // TODO: Implement delete language
        },
    },
    jobs: {
        get: async () => {
            // TODO: Implement get jobs
        },
        create: async (data) => {
            // TODO: Implement create job
        },
        update: async (id, data) => {
            // TODO: Implement update job
        },
        delete: async (id) => {
            // TODO: Implement delete job
        },
    },
}
