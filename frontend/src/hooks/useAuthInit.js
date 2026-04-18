import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { refreshTokenApi } from '../apis/auth';

/**
 * Hook that runs on app mount to try to restore auth state
 * by refreshing the access token using the refresh token cookie
 */
export const useAuthInit = () => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const setLoading = useAuthStore((state) => state.setLoading);

    useEffect(() => {
        const initAuth = async () => {
            try {
                setLoading(true);
                const response = await refreshTokenApi();
                setAuth(response.data.user, response.data.accessToken);
            } catch (error) {
                // No valid refresh token — user needs to login
                clearAuth();
            }
        };

        initAuth();
    }, [setAuth, clearAuth, setLoading]);
};
