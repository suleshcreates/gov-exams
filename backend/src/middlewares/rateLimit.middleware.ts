import rateLimit from 'express-rate-limit';
import env from '../config/env';

const isDev = env.NODE_ENV === 'development';

/**
 * Rate limiter for signup endpoint
 */
export const signupLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: isDev ? 500 : 10, // Strict in production, relaxed in dev
    message: {
        success: false,
        error: 'Too many signup attempts from this IP. Please try again after 5 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for login endpoint
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDev ? 100 : 15, // Strict in production, relaxed in dev
    message: {
        success: false,
        error: 'Too many login attempts. Please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * General API rate limiter
 * Max 100 requests per IP per 15 minutes
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDev ? 500 : 100,
    message: {
        success: false,
        error: 'Too many requests from this IP. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict rate limiter for sensitive operations (password reset, etc.)
 * Max 3 requests per IP per hour
 */
export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        success: false,
        error: 'Too many requests. Please try again after an hour.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export default {
    signupLimiter,
    loginLimiter,
    apiLimiter,
    strictLimiter,
};
