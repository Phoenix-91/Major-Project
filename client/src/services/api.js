import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Custom hook to create an authenticated API client
 * Automatically includes Clerk auth token in all requests
 */
export function useApi() {
    const { getToken } = useAuth();

    const api = axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor to add auth token
    api.interceptors.request.use(
        async (config) => {
            try {
                const token = await getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error('Error getting auth token:', error);
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor for error handling
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                // Unauthorized - redirect to sign in
                console.error('Unauthorized request - please sign in');
                // You could trigger a sign-out here if needed
            }
            return Promise.reject(error);
        }
    );

    return api;
}

/**
 * Non-hook version for use outside of React components
 * Note: This won't include auth token automatically
 */
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
