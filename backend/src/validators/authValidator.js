import { z } from 'zod';

/**
 * Registration schema — validates username, email, and password
 */
export const registerSchema = z.object({
    username: z
        .string({
            required_error: 'Username is required',
            invalid_type_error: 'Username must be a string',
        })
        .trim()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters')
        .regex(
            /^[a-zA-Z0-9_@.-]+$/,
            'Username can only contain letters, numbers, underscores, dots, hyphens, and @'
        ),

    email: z
        .string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string',
        })
        .trim()
        .toLowerCase()
        .email('Please provide a valid email address'),

    password: z
        .string({
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string',
        })
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password must be at most 100 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});

/**
 * Login schema — validates email and password format
 */
export const loginSchema = z.object({
    email: z
        .string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string',
        })
        .trim()
        .toLowerCase()
        .email('Please provide a valid email address'),

    password: z
        .string({
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string',
        })
        .min(1, 'Password is required'),
});

/**
 * Forgot password schema — just the email
 */
export const forgotPasswordSchema = z.object({
    email: z
        .string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string',
        })
        .trim()
        .toLowerCase()
        .email('Please provide a valid email address'),
});

/**
 * Reset password schema — token + new password with strength rules
 */
export const resetPasswordSchema = z.object({
    token: z
        .string({
            required_error: 'Reset token is required',
            invalid_type_error: 'Token must be a string',
        })
        .min(1, 'Reset token is required'),

    password: z
        .string({
            required_error: 'New password is required',
            invalid_type_error: 'Password must be a string',
        })
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password must be at most 100 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});
