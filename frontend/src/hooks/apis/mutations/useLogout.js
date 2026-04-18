import { useMutation } from '@tanstack/react-query';
import { logoutApi } from '../../../apis/auth';
import useAuthStore from '../../../store/authStore';

export const useLogout = () => {
    const accessToken = useAuthStore((state) => state.accessToken);
    const clearAuth = useAuthStore((state) => state.clearAuth);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: () => logoutApi(accessToken),
        onSuccess: () => {
            clearAuth();
        },
        onError: (error) => {
            console.error('Logout failed:', error);
            // Clear auth anyway on logout failure
            clearAuth();
        },
    });

    return {
        logoutMutation: mutateAsync,
        isPending,
    };
};
