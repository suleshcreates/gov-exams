import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import env from '../config/env';

/**
 * Global error handler middleware
 * MUST be registered as the LAST middleware in Express app
 */
export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Log error details for debugging
    logger.error('Global error handler caught:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });

    // Determine if we're in production
    const isProd = env.NODE_ENV === 'production';

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    // Send error response
    res.status(statusCode).json({
        success: false,
        message: isProd ? 'Internal Server Error' : err.message,
        error: isProd ? undefined : err.message,
        ...(isProd ? {} : { stack: err.stack }), // Stack trace only in development
    });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    res.status(404).json({
        success: false,
        error: `Route not found: ${req.method} ${req.path}`,
    });
};

export default {
    globalErrorHandler,
    notFoundHandler,
};
