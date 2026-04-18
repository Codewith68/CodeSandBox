import { StatusCodes } from 'http-status-codes';
import { verifyAccessToken } from '../utils/tokenUtility.js';
import { errorResponse } from '../utils/apiResponse.js';
import { findUserById } from '../repository/userRepository.js';

/**
 * Middleware to protect routes — verifies JWT access token from Authorization header
 * Attaches decoded user info to req.user
 */
export const isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                'Access denied. No token provided.'
            );
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return errorResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                'Access denied. Token is malformed.'
            );
        }

        // Verify the access token
        const decoded = verifyAccessToken(token);

        // Fetch the user from DB to ensure they still exist
        const user = await findUserById(decoded.userId);
        if (!user) {
            return errorResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                'User no longer exists.'
            );
        }

        // Attach user info to the request object
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            username: user.username,
            avatar: user.avatar,
            provider: user.provider,
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return errorResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                'Access token expired. Please refresh your token.'
            );
        }
        if (error.name === 'JsonWebTokenError') {
            return errorResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                'Invalid access token.'
            );
        }
        return errorResponse(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Authentication failed',
            error
        );
    }
};
