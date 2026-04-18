import { useMutation } from '@tanstack/react-query';
import { registerApi } from '../../../apis/auth';
import useAuthStore from '../../../store/authStore';

export const useRegister = () => {
    const setAuth = useAuthStore((state) => state.setAuth);

    const { mutateAsync, isPending, isSuccess, error } = useMutation({
        mutationFn: registerApi,
        onSuccess: (data) => {
            setAuth(data.data.user, data.data.accessToken);
        },
        onError: (error) => {
            console.error('Registration failed:', error);
        },
    });

    return {
        registerMutation: mutateAsync,
        isPending,
        isSuccess,
        error,
    };
};
