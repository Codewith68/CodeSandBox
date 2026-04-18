import rateLimit from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';

/**
 * Global rate limiter — applies to all routes
 * Generous limit for general API usage
 */
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,               // 100 requests per window per IP
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests, please try again later.',
        statusCode: StatusCodes.TOO_MANY_REQUESTS,
    },
});

/**
 * Auth rate limiter — stricter, for login/register
 * Prevents brute-force attacks on credentials
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,                // 10 attempts per window per IP
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again after 15 minutes.',
        statusCode: StatusCodes.TOO_MANY_REQUESTS,
    },
});

/**
 * Strict rate limiter — for sensitive operations like password reset, OTP
 */
export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 5,                 // 5 attempts per hour per IP
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attempts, please try again after an hour.',
        statusCode: StatusCodes.TOO_MANY_REQUESTS,
    },
});
