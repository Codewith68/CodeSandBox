import { StatusCodes } from 'http-status-codes';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    forgotPassword as forgotPasswordService,
    resetPassword as resetPasswordService,
} from '../service/authService.js';

// Cookie options for refresh token
const REFRESH_TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/',
};

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const register = async (req, res) => {
    try {
        // req.body is already validated & transformed by Zod middleware
        const { username, email, password } = req.body;

        const { user, accessToken, refreshToken } = await registerUser({
            username,
            email,
            password,
        });

        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

        return successResponse(res, StatusCodes.CREATED, 'User registered successfully', {
            user,
            accessToken,
        });
    } catch (error) {
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        return errorResponse(res, statusCode, error.message, error);
    }
};

/**
 * Login a user
 * POST /api/v1/auth/login
 */
export const login = async (req, res) => {
    try {
        // req.body is already validated & transformed by Zod middleware
        const { email, password } = req.body;

        const { user, accessToken, refreshToken } = await loginUser({ email, password });

        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

        return successResponse(res, StatusCodes.OK, 'Login successful', {
            user,
            accessToken,
        });
    } catch (error) {
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        return errorResponse(res, statusCode, error.message, error);
    }
};

/**
 * Refresh access token using refresh token from cookie
 * POST /api/v1/auth/refresh-token
 */
export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;

        if (!token) {
            return errorResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                'Refresh token not found. Please login again.'
            );
        }

        const { accessToken, refreshToken: newRefreshToken, user } =
            await refreshAccessToken(token);

        // Rotate the refresh token cookie
        res.cookie('refreshToken', newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

        return successResponse(res, StatusCodes.OK, 'Token refreshed successfully', {
            user,
            accessToken,
        });
    } catch (error) {
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        return errorResponse(res, statusCode, error.message, error);
    }
};

/**
 * Logout — clear refresh token from DB and cookie
 * POST /api/v1/auth/logout
 */
export const logout = async (req, res) => {
    try {
        await logoutUser(req.user.userId);

        // Clear the refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        return successResponse(res, StatusCodes.OK, 'Logged out successfully');
    } catch (error) {
        return errorResponse(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Logout failed',
            error
        );
    }
};

/**
 * Google OAuth callback handler
 * GET /api/v1/auth/google/callback
 */
export const googleCallback = async (req, res) => {
    try {
        // req.authInfo is set by passport strategy with tokens
        const { accessToken, refreshToken } = req.authInfo;

        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

        // Redirect to frontend with access token as query param
        // Frontend will extract the token and store it in memory/state
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(
            `${frontendURL}/auth/google/success?accessToken=${accessToken}`
        );
    } catch (error) {
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendURL}/auth/google/failure`);
    }
};

/**
 * Get current authenticated user profile
 * GET /api/v1/auth/me
 */
export const getCurrentUser = async (req, res) => {
    try {
        return successResponse(res, StatusCodes.OK, 'User profile fetched successfully', {
            user: req.user,
        });
    } catch (error) {
        return errorResponse(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Failed to fetch user profile',
            error
        );
    }
};

/**
 * Forgot Password — send reset email
 * POST /api/v1/auth/forgot-password
 */
export const forgotPasswordHandler = async (req, res) => {
    try {
        const { email } = req.body;

        await forgotPasswordService(email);

        // Always return success to prevent email enumeration attacks
        return successResponse(
            res,
            StatusCodes.OK,
            'If an account with that email exists, a password reset link has been sent.'
        );
    } catch (error) {
        // For Google-only accounts, we reveal the error
        if (error.statusCode === 400) {
            return errorResponse(res, StatusCodes.BAD_REQUEST, error.message);
        }
        return errorResponse(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Failed to process password reset request',
            error
        );
    }
};

/**
 * Reset Password — validate token and update password
 * POST /api/v1/auth/reset-password
 */
export const resetPasswordHandler = async (req, res) => {
    try {
        const { token, password } = req.body;

        await resetPasswordService(token, password);

        return successResponse(
            res,
            StatusCodes.OK,
            'Password has been reset successfully. You can now log in with your new password.'
        );
    } catch (error) {
        const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        return errorResponse(res, statusCode, error.message, error);
    }
};
