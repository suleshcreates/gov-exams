import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for signup endpoint
 * Max 50 signups per IP per hour (increased for testing)
 */
export const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Increased from 3 to 50 for testing
    message: {
        success: false,
        error: 'Too many signup attempts from this IP. Please try again after an hour.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for login endpoint
 * Max 100 login attempts per IP per 15 minutes (increased for development)
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased from 5 to 100 for development
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
    max: 100,
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
