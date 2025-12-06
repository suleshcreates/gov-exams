import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';
import { AuthRequest, Student } from '../types';

/**
 * Middleware to verify JWT access token and attach user to request
 */
export const requireAuth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'No authorization token provided',
            });
            return;
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token signature and expiry
        const decoded = verifyToken(token);

        // Validate token type (must be access token)
        if (decoded.type !== 'access') {
            res.status(401).json({
                success: false,
                error: 'Invalid token type. Access token required.',
            });
            return;
        }

        // Fetch user from database
        const { data: user, error } = await supabaseAdmin
            .from('students')
            .select('*')
            .eq('auth_user_id', decoded.userId)
            .single();

        if (error || !user) {
            logger.warn(`User not found for auth_user_id: ${decoded.userId}`);
            res.status(401).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        // Attach user to request object
        req.user = user as Student;
        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({
                success: false,
                error: 'Token expired',
                code: 'TOKEN_EXPIRED',
            });
            return;
        }

        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({
                success: false,
                error: 'Invalid token',
            });
            return;
        }

        logger.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication failed',
        });
    }
};

export default requireAuth;
