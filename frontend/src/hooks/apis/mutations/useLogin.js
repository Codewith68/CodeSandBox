import { useMutation } from '@tanstack/react-query';
import { loginApi } from '../../../apis/auth';
import useAuthStore from '../../../store/authStore';

export const useLogin = () => {
    const setAuth = useAuthStore((state) => state.setAuth);

    const { mutateAsync, isPending, isSuccess, error } = useMutation({
        mutationFn: loginApi,
        onSuccess: (data) => {
            setAuth(data.data.user, data.data.accessToken);
        },
        onError: (error) => {
            console.error('Login failed:', error);
        },
    });

    return {
        loginMutation: mutateAsync,
        isPending,
        isSuccess,
        error,
    };
};
