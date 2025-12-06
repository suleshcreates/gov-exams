import * as functions from 'firebase-functions';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './api/routes/auth.routes';

// Import middleware
import { globalErrorHandler, notFoundHandler } from './api/middlewares/error.middleware';

// Create Express app
const app = express();

// ==================== MIDDLEWARE ====================

// Security
app.use(helmet());

// CORS - allow all origins for Cloud Functions
app.use(cors({ origin: true, credentials: true }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP
    message: 'Too many requests from this IP, please try again later.',
});
app.use(generalLimiter);

// ==================== ROUTES ====================

// Health check (no rate limit, no auth)
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
    });
});

// API routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

// ==================== EXPORT AS CLOUD FUNCTION ====================

// Export Express app as Firebase Cloud Function
export const api = functions
    .region('asia-south1') // Mumbai region (closest to India)
    .runWith({
        timeoutSeconds: 60,
        memory: '512MB',
    })
    .https.onRequest(app);
