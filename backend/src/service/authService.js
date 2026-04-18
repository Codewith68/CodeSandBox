import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
    createUser,
    findUserByEmail,
    findUserByGoogleId,
    findUserById,
    findUserByIdWithRefreshToken,
    updateRefreshToken,
    clearRefreshToken,
    storeResetToken,
    findUserByResetToken,
    clearResetToken,
} from '../repository/userRepository.js';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from '../utils/tokenUtility.js';
import { sendPasswordResetEmail } from '../utils/emailUtility.js';
import { FRONTEND_URL } from '../config/serverConfig.js';

/**
 * Hash a refresh token before storing in DB
 * @param {string} token - Plain refresh token
 * @returns {Promise<string>} Hashed token
 */
const hashToken = async (token) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(token, salt);
};

/**
 * Generate both tokens and store hashed refresh token in DB
 * @param {Object} user - User document
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
const generateAndStoreTokens = async (user) => {
    const tokenPayload = { userId: user._id, email: user.email };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Hash the refresh token and store in DB for later verification
    const hashedRefreshToken = await hashToken(refreshToken);
    await updateRefreshToken(user._id, hashedRefreshToken);

    return { accessToken, refreshToken };
};

/**
 * Register a new user with email and password
 * @param {Object} param0 - { username, email, password }
 * @returns {Promise<{user: Object, accessToken: string, refreshToken: string}>}
 */
export const registerUser = async ({ username, email, password }) => {
    try {
        // Check if email already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            const error = new Error('User with this email already exists');
            error.statusCode = 409;
            throw error;
        }

        // Create user via repository (password gets hashed by pre-save hook)
        const user = await createUser({
            username,
            email,
            password,
            provider: 'local',
        });

        // Generate tokens
        const { accessToken, refreshToken } = await generateAndStoreTokens(user);

        return { user, accessToken, refreshToken };
    } catch (error) {
        throw error;
    }
};

/**
 * Login a user with email and password
 * @param {Object} param0 - { email, password }
 * @returns {Promise<{user: Object, accessToken: string, refreshToken: string}>}
 */
export const loginUser = async ({ email, password }) => {
    try {
        // Find user with password field included
        const user = await findUserByEmail(email, true);
        if (!user) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }

        // Google-only users can't login with password
        if (user.provider === 'google' && !user.password) {
            const error = new Error('This account uses Google Sign-In. Please login with Google.');
            error.statusCode = 400;
            throw error;
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }

        // Generate tokens
        const { accessToken, refreshToken } = await generateAndStoreTokens(user);

        return { user, accessToken, refreshToken };
    } catch (error) {
        throw error;
    }
};

/**
 * Refresh the access token using a valid refresh token
 * @param {string} oldRefreshToken - The refresh token from cookie
 * @returns {Promise<{accessToken: string, refreshToken: string, user: Object}>}
 */
export const refreshAccessToken = async (oldRefreshToken) => {
    try {
        // Verify the refresh token JWT signature
        const decoded = verifyRefreshToken(oldRefreshToken);

        // Find user with stored refresh token
        const user = await findUserByIdWithRefreshToken(decoded.userId);
        if (!user || !user.refreshToken) {
            const error = new Error('Invalid refresh token. Please login again.');
            error.statusCode = 401;
            throw error;
        }

        // Compare the provided token with the stored hash
        const isTokenValid = await bcrypt.compare(oldRefreshToken, user.refreshToken);
        if (!isTokenValid) {
            // Possible token reuse — clear all refresh tokens for safety
            await clearRefreshToken(user._id);
            const error = new Error('Refresh token reuse detected. Please login again.');
            error.statusCode = 401;
            throw error;
        }

        // Token rotation — generate new pair of tokens
        const { accessToken, refreshToken } = await generateAndStoreTokens(user);

        return { accessToken, refreshToken, user };
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            const err = new Error('Refresh token expired or invalid. Please login again.');
            err.statusCode = 401;
            throw err;
        }
        throw error;
    }
};

/**
 * Logout a user by clearing their refresh token
 * @param {string} userId - MongoDB ObjectId
 */
export const logoutUser = async (userId) => {
    try {
        await clearRefreshToken(userId);
    } catch (error) {
        throw error;
    }
};

/**
 * Handle Google OAuth — find or create user from Google profile
 * @param {Object} profile - Google profile object from Passport
 * @returns {Promise<{user: Object, accessToken: string, refreshToken: string}>}
 */
export const handleGoogleAuth = async (profile) => {
    try {
        // Check if user already exists with this Google ID
        let user = await findUserByGoogleId(profile.id);

        if (!user) {
            // Check if a local user exists with the same email
            const existingEmailUser = await findUserByEmail(profile.emails[0].value);

            if (existingEmailUser) {
                // Link Google account to existing local user
                existingEmailUser.googleId = profile.id;
                existingEmailUser.avatar = profile.photos?.[0]?.value || existingEmailUser.avatar;
                existingEmailUser.provider = existingEmailUser.password ? existingEmailUser.provider : 'google';
                user = await existingEmailUser.save();
            } else {
                // Create a new user from Google profile
                user = await createUser({
                    username: profile.displayName || profile.emails[0].value.split('@')[0],
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    avatar: profile.photos?.[0]?.value || undefined, // Falls back to default in schema
                    provider: 'google',
                });
            }
        }

        // Generate tokens
        const { accessToken, refreshToken } = await generateAndStoreTokens(user);

        return { user, accessToken, refreshToken };
    } catch (error) {
        throw error;
    }
};

/**
 * Forgot Password — generate reset token and send email
 * @param {string} email - User's email address
 */
export const forgotPassword = async (email) => {
    try {
        const user = await findUserByEmail(email);
        if (!user) {
            // Don't reveal if user exists — return success either way
            return;
        }

        // Google-only users can't reset password
        if (user.provider === 'google' && !user.password) {
            const error = new Error('This account uses Google Sign-In. Password reset is not available.');
            error.statusCode = 400;
            throw error;
        }

        // Generate a random 32-byte token
        const rawToken = crypto.randomBytes(32).toString('hex');

        // Hash the token with SHA-256 before storing in DB
        // (We use SHA-256, not bcrypt, because we need fast lookup by hash)
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        // Set expiry to 15 minutes from now
        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        // Store in DB
        await storeResetToken(user._id, hashedToken, expiry);

        // Build reset link — the raw (unhashed) token goes in the URL
        const resetLink = `${FRONTEND_URL}/reset-password/${rawToken}`;

        // Send the email
        await sendPasswordResetEmail(user.email, resetLink, user.username);
    } catch (error) {
        throw error;
    }
};

/**
 * Reset Password — validate token and update password
 * @param {string} token - Raw reset token from URL
 * @param {string} newPassword - New password
 */
export const resetPassword = async (token, newPassword) => {
    try {
        // Hash the incoming token to match against DB
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with matching token that hasn't expired
        const user = await findUserByResetToken(hashedToken);
        if (!user) {
            const error = new Error('Invalid or expired reset token. Please request a new one.');
            error.statusCode = 400;
            throw error;
        }

        // Update password — using save() to trigger the pre-save bcrypt hook
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();

        // Also clear any existing refresh tokens (force re-login with new password)
        await clearRefreshToken(user._id);
    } catch (error) {
        throw error;
    }
};

