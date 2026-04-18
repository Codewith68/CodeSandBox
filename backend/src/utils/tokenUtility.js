import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../config/serverConfig.js';

/**
 * Generate a short-lived access token (15 minutes)
 * @param {Object} payload - Data to encode in the token
 * @returns {string} Signed JWT access token
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

/**
 * Generate a long-lived refresh token (7 days)
 * @param {Object} payload - Data to encode in the token
 * @returns {string} Signed JWT refresh token
 */
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

/**
 * Verify an access token
 * @param {string} token - JWT access token to verify
 * @returns {Object} Decoded token payload
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */
export const verifyAccessToken = (token) => {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

/**
 * Verify a refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object} Decoded token payload
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
};
