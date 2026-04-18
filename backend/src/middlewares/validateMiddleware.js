import { StatusCodes } from 'http-status-codes';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Generic Zod validation middleware factory
 * Uses safeParse (never throws) to avoid Express 5 error handler interference
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */
export const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            // Extract user-friendly error messages from ZodError
            const messages = result.error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            return errorResponse(
                res,
                StatusCodes.BAD_REQUEST,
                messages[0].message, // First error as the main message
                { validationErrors: messages }
            );
        }

        // Replace req.body with validated + transformed data (trimmed, lowercased, etc.)
        req.body = result.data;

        next();
    };
};
