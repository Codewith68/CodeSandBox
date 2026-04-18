import axios from '../config/axiosConfig';

/**
 * Register a new user
 * @param {{ username: string, email: string, password: string }} data
 */
export const registerApi = async (data) => {
    try {
        const response = await axios.post('/api/v1/auth/register', data, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Login with email and password
 * @param {{ email: string, password: string }} data
 */
export const loginApi = async (data) => {
    try {
        const response = await axios.post('/api/v1/auth/login', data, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Refresh the access token using the refresh token cookie
 */
export const refreshTokenApi = async () => {
    try {
        const response = await axios.post('/api/v1/auth/refresh-token', {}, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Logout — clears refresh token
 * @param {string} accessToken
 */
export const logoutApi = async (accessToken) => {
    try {
        const response = await axios.post('/api/v1/auth/logout', {}, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get the current authenticated user profile
 * @param {string} accessToken
 */
export const getMeApi = async (accessToken) => {
    try {
        const response = await axios.get('/api/v1/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get the Google OAuth URL to redirect to
 */
export const getGoogleAuthUrl = () => {
    return `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/google`;
};
