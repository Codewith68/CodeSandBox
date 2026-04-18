import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { getMeApi } from '../apis/auth';
import './Auth.css';

/**
 * Google OAuth success callback page
 * Receives accessToken in URL params, fetches user, and redirects to home
 */
export const GoogleAuthSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        const handleGoogleSuccess = async () => {
            const accessToken = searchParams.get('accessToken');

            if (!accessToken) {
                navigate('/login');
                return;
            }

            try {
                // Fetch the user profile using the access token
                const response = await getMeApi(accessToken);
                setAuth(response.data.user, accessToken);
                navigate('/');
            } catch (error) {
                console.error('Google auth failed:', error);
                navigate('/login');
            }
        };

        handleGoogleSuccess();
    }, [searchParams, setAuth, navigate]);

    return (
        <div className="auth-page">
            <div className="gradient-orbs">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
            </div>
            <div className="auth-redirect">
                <div className="auth-redirect-spinner" />
                <p className="auth-redirect-text">Signing you in...</p>
            </div>
        </div>
    );
};

/**
 * Google OAuth failure callback page
 * Shows error and redirects to login
 */
export const GoogleAuthFailure = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/login');
        }, 3000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="auth-page">
            <div className="gradient-orbs">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
            </div>
            <div className="auth-redirect">
                <div className="auth-error" style={{ maxWidth: '400px' }}>
                    <span className="auth-error-icon">⚠</span>
                    <span>Google sign-in failed. Redirecting to login...</span>
                </div>
            </div>
        </div>
    );
};
