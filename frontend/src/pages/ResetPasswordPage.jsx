import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from '../config/axiosConfig';
import './Auth.css';

export const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.password) {
            setError('Please enter a new password');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!/[A-Z]/.test(formData.password)) {
            setError('Password must contain at least one uppercase letter');
            return;
        }

        if (!/[0-9]/.test(formData.password)) {
            setError('Password must contain at least one number');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post('/api/v1/auth/reset-password', {
                token,
                password: formData.password,
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
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
                        <div className="auth-success-icon">✅</div>
                        <h1 className="auth-title">Password reset!</h1>
                        <p className="auth-subtitle" style={{ marginBottom: '2rem' }}>
                            Your password has been updated successfully. You can now sign in with your new password.
                        </p>
                        <Link
                            to="/login"
                            className="auth-submit-btn"
                            style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}
                        >
                            <span>Sign In</span>
                        </Link>
                    </div>
                ) : (
                    /* Form state */
                    <>
                        <div style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
                        <h1 className="auth-title">Set new password</h1>
                        <p className="auth-subtitle">
                            Must be at least 6 characters with uppercase letter and number.
                        </p>

                        {error && (
                            <div className="auth-error">
                                <span className="auth-error-icon">⚠</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="auth-input-group">
                                <label className="auth-label" htmlFor="reset-password">New Password</label>
                                <div className="auth-input-wrapper">
                                    <input
                                        id="reset-password"
                                        className="auth-input"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Min. 6 characters"
                                        value={formData.password}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        autoFocus
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
                                <label className="auth-label" htmlFor="reset-confirm-password">
                                    Confirm New Password
                                </label>
                                <input
                                    id="reset-confirm-password"
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
                                disabled={isSubmitting}
                                id="reset-password-btn"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="auth-spinner" />
                                        <span>Resetting...</span>
                                    </>
                                ) : (
                                    <span>Reset Password</span>
                                )}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <Link to="/login" className="auth-footer-link">
                                ← Back to Sign In
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
