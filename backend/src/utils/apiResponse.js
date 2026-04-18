import { getReasonPhrase } from 'http-status-codes';

/**
 * Send a standardized success response
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code (use StatusCodes enum)
 * @param {string} message - Success message
 * @param {*} [data=null] - Response payload
 */
export const successResponse = (res, statusCode, message, data = null) => {
    const response = {
        success: true,
        message,
        statusCode,
        statusPhrase: getReasonPhrase(statusCode),
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

/**
 * Send a standardized error response
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code (use StatusCodes enum)
 * @param {string} message - Error message
 * @param {*} [error=null] - Error details (only included in non-production)
 */
export const errorResponse = (res, statusCode, message, error = null) => {
    const response = {
        success: false,
        message,
        statusCode,
        statusPhrase: getReasonPhrase(statusCode),
    };

    if (error !== null && process.env.NODE_ENV !== 'production') {
        response.error = typeof error === 'object' ? error.message || error : error;
    }

    return res.status(statusCode).json(response);
};
