import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../hooks/apis/mutations/useRegister';
import { getGoogleAuthUrl } from '../apis/auth';
import './Auth.css';

const GoogleIcon = () => (
    <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { registerMutation, isPending } = useRegister();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.username || !formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await registerMutation({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });
            navigate('/');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        }
    };

    const handleGoogleSignup = () => {
        window.location.href = getGoogleAuthUrl();
    };

    return (
        <div className="auth-page">
            {/* Background orbs */}
            <div className="gradient-orbs">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
            </div>

            <div className="auth-card">
                {/* Brand */}
                <Link to="/" className="auth-brand">
                    <div className="auth-brand-logo">⚡</div>
                    <div className="auth-brand-name">
                        Code<span>Forge</span>
                    </div>
                </Link>

                <h1 className="auth-title">Create your account</h1>
                <p className="auth-subtitle">Start building in the cloud for free</p>

                {/* Google OAuth */}
                <button
                    className="google-auth-btn"
                    onClick={handleGoogleSignup}
                    type="button"
                    id="google-register-btn"
                >
                    <GoogleIcon />
                    Continue with Google
                </button>

                {/* Divider */}
                <div className="auth-divider">
                    <div className="auth-divider-line" />
                    <span className="auth-divider-text">or</span>
                    <div className="auth-divider-line" />
                </div>

                {/* Error */}
                {error && (
                    <div className="auth-error">
                        <span className="auth-error-icon">⚠</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <label className="auth-label" htmlFor="register-username">Username</label>
                        <input
                            id="register-username"
                            className="auth-input"
                            type="text"
                            name="username"
                            placeholder="johndoe"
                            value={formData.username}
                            onChange={handleChange}
                            autoComplete="username"
                        />
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label" htmlFor="register-email">Email</label>
                        <input
                            id="register-email"
                            className="auth-input"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label" htmlFor="register-password">Password</label>
                        <div className="auth-input-wrapper">
                            <input
                                id="register-password"
                                className="auth-input"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Min. 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? '🙈' : '👁'}
                            </button>
                        </div>
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label" htmlFor="register-confirm-password">
                            Confirm Password
                        </label>
                        <input
                            id="register-confirm-password"
                            className="auth-input"
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={isPending}
                        id="register-submit-btn"
                    >
                        {isPending ? (
                            <>
                                <span className="auth-spinner" />
                                <span>Creating account...</span>
                            </>
                        ) : (
                            <span>Create Account</span>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-footer-link">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};
