import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import { corsConfig } from './config/cors';
import { apiLimiter } from './middlewares/rateLimit.middleware';
import { globalErrorHandler, notFoundHandler } from './middlewares/error.middleware';
import logger from './utils/logger';
import env from './config/env';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import paymentRoutes from './routes/payment.routes';
import plansRoutes from './routes/plans.routes';
import profileRoutes from './routes/profile.routes';
import studentRoutes from './routes/student.routes';
import publicRoutes from './routes/public.routes';

/**
 * Create and configure Express application
 */
function createApp(): Application {
    const app = express();

    // Trust proxy - required for Render/reverse proxies to get correct client IP
    app.set('trust proxy', 1);

    // ==================== SECURITY MIDDLEWARE ====================

    // Helmet - sets various HTTP headers for security
    app.use(helmet());

    // CORS - strict origin whitelisting
    app.use(corsConfig);

    // ==================== PARSING MIDDLEWARE ====================

    // Parse JSON bodies
    app.use(express.json({ limit: '10mb' }));

    // Parse URL-encoded bodies
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // ==================== RATE LIMITING ====================

    // Apply general rate limiting to all API routes
    app.use('/api', apiLimiter);

    // DEBUG: Log all requests
    app.use((req, _res, next) => {
        console.log(`[Request] ${req.method} ${req.url}`);
        next();
    });

    // ==================== ROUTES ====================

    // Health check endpoint (no rate limit, no auth)
    app.get('/health', (_req: Request, res: Response) => {
        res.status(200).json({
            success: true,
            message: 'Server is healthy',
            timestamp: new Date().toISOString(),
            environment: env.NODE_ENV,
        });
    });

    // Root endpoint - Friendly message instead of 404
    app.get('/', (_req: Request, res: Response) => {
        res.status(200).json({
            success: true,
            message: 'GovExams API is running! 🚀',
            docs: 'https://github.com/suleshcreates/gov-exams'
        });
    });

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/plans', plansRoutes);
    app.use('/api/profile', profileRoutes);
    app.use('/api/student', studentRoutes);
    app.use('/api/public', publicRoutes);
    // Add more routes here as needed:
    // app.use('/api/exam', examRoutes);

    // ==================== ERROR HANDLING ====================

    // 404 handler - must be AFTER all routes
    app.use(notFoundHandler);

    // Global error handler - must be LAST middleware
    app.use(globalErrorHandler);

    return app;
}

/**
 * Start the Express server
 */
function startServer(): void {
    const app = createApp();
    const port = env.PORT;

    app.listen(port, () => {
        logger.info(`🚀 Server running on port ${port}`);
        logger.info(`📝 Environment: ${env.NODE_ENV}`);
        logger.info(`🔒 CORS origins: ${env.ALLOWED_ORIGINS}`);
        logger.info(`✅ Health check: http://localhost:${port}/health`);
    });
}

// Start server if this file is run directly
if (require.main === module) {
    startServer();
}

export { createApp, startServer };
export default createApp;
