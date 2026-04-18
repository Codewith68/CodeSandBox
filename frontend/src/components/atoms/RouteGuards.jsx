import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * ProtectedRoute — redirects to /login if user is not authenticated.
 * Shows nothing while auth state is loading (checking refresh token).
 */
export const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);

    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0b10',
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(99, 102, 241, 0.2)',
                    borderTopColor: '#6366f1',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }} />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

/**
 * PublicRoute — redirects to / if user IS already authenticated.
 * Used for login/register pages so logged-in users don't see them.
 */
export const PublicRoute = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);

    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0b10',
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(99, 102, 241, 0.2)',
                    borderTopColor: '#6366f1',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }} />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};
