import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../config/axiosConfig';
import './Auth.css';

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post('/api/v1/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
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

                {success ? (
                    /* Success state */
                    <div className="auth-success-state">
                        <div className="auth-success-icon">📧</div>
                        <h1 className="auth-title">Check your email</h1>
                        <p className="auth-subtitle" style={{ marginBottom: '1rem' }}>
                            If an account exists for <strong style={{ color: '#a5b4fc' }}>{email}</strong>,
                            we've sent a password reset link. It expires in 15 minutes.
                        </p>
                        <p className="auth-subtitle" style={{ fontSize: '0.82rem', marginBottom: '2rem' }}>
                            Didn't receive it? Check your spam folder or{' '}
                            <button
                                onClick={() => { setSuccess(false); setEmail(''); }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#818cf8',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    fontSize: 'inherit',
                                    fontFamily: 'inherit',
                                    padding: 0,
                                }}
                            >
                                try again
                            </button>.
                        </p>
                        <Link to="/login" className="auth-submit-btn" style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                            <span>Back to Sign In</span>
                        </Link>
                    </div>
                ) : (
                    /* Form state */
                    <>
                        <div className="auth-success-icon" style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔑</div>
                        <h1 className="auth-title">Forgot password?</h1>
                        <p className="auth-subtitle">
                            No worries! Enter your email and we'll send you a reset link.
                        </p>

                        {error && (
                            <div className="auth-error">
                                <span className="auth-error-icon">⚠</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="auth-input-group">
                                <label className="auth-label" htmlFor="forgot-email">Email address</label>
                                <input
                                    id="forgot-email"
                                    className="auth-input"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                                    autoComplete="email"
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                className="auth-submit-btn"
                                disabled={isSubmitting}
                                id="forgot-password-btn"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="auth-spinner" />
                                        <span>Sending link...</span>
                                    </>
                                ) : (
                                    <span>Send Reset Link</span>
                                )}
                            </button>
                        </form>

                        <div className="auth-footer">
                            Remember your password?{' '}
                            <Link to="/login" className="auth-footer-link">
                                Sign in
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
