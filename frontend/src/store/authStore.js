import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true, // true initially — we check for refresh token on app load

    /**
     * Set auth data after login/register/refresh
     */
    setAuth: (user, accessToken) => {
        set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
        });
    },

    /**
     * Clear auth data on logout or token failure
     */
    clearAuth: () => {
        set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
        });
    },

    /**
     * Set loading state
     */
    setLoading: (isLoading) => {
        set({ isLoading });
    },
}));

export default useAuthStore;
