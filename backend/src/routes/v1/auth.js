import express from 'express';
import passport from 'passport';
import {
    register,
    login,
    refreshToken,
    logout,
    googleCallback,
    getCurrentUser,
    forgotPasswordHandler,
    resetPasswordHandler,
} from '../../controllers/authController.js';
import { isAuthenticated } from '../../middlewares/authMiddleware.js';
import { validate } from '../../middlewares/validateMiddleware.js';
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from '../../validators/authValidator.js';
import { authLimiter, strictLimiter } from '../../middlewares/rateLimiter.js';

const router = express.Router();

// Local auth routes — rate limited + Zod validated
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', isAuthenticated, logout);

// Password reset routes — strict rate limiting (5 per hour)
router.post('/forgot-password', strictLimiter, validate(forgotPasswordSchema), forgotPasswordHandler);
router.post('/reset-password', strictLimiter, validate(resetPasswordSchema), resetPasswordHandler);

// Protected route — get current user profile
router.get('/me', isAuthenticated, getCurrentUser);

// Google OAuth routes
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/google/failure`,
    }),
    googleCallback
);

export default router;
