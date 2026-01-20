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

        // Fetch user from database - try students first, then admins
        let user = null;
        let isAdmin = false;

        // Try admins table first (by id, since admin JWT uses admin.id as userId)
        const { data: adminUser, error: adminError } = await supabaseAdmin
            .from('admins')
            .select('*')
            .eq('id', decoded.userId)
            .single();

        if (adminUser && !adminError) {
            user = adminUser;
            isAdmin = true;
            logger.debug(`[Auth] Admin user found: ${adminUser.email}`);
        } else {
            // Try students table (by auth_user_id)
            const { data: studentUser, error: studentError } = await supabaseAdmin
                .from('students')
                .select('*')
                .eq('auth_user_id', decoded.userId)
                .single();

            if (studentUser && !studentError) {
                user = studentUser;
            }
        }

        if (!user) {
            logger.warn(`User not found for userId: ${decoded.userId}`);
            res.status(401).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        // SINGLE-DEVICE ENFORCEMENT (if token has sessionId)
        // New tokens have sessionId, old tokens don't
        // We enforce single-device only for new tokens to allow graceful migration
        if (decoded.sessionId) {
            // Check if THIS SPECIFIC SESSION (from JWT) is still active
            const { data: session, error: sessionError } = await supabaseAdmin
                .from('sessions')
                .select('id, expires_at')
                .eq('id', decoded.sessionId)
                .eq('user_id', decoded.userId)
                .single();

            if (sessionError || !session) {
                logger.warn(`[Single Device] Session ${decoded.sessionId} not found for user: ${decoded.userId}`);
                res.status(401).json({
                    success: false,
                    error: 'Session expired. You have been logged in on another device.',
                    code: 'SESSION_INVALIDATED',
                });
                return;
            }

            // Check if session has expired
            if (new Date(session.expires_at) < new Date()) {
                logger.warn(`[Single Device] Session ${decoded.sessionId} expired`);
                res.status(401).json({
                    success: false,
                    error: 'Session expired.',
                    code: 'SESSION_EXPIRED',
                });
                return;
            }

            logger.debug(`[Auth] Session ${decoded.sessionId} validated for user: ${decoded.userId}`);
        } else {
            // Legacy token without sessionId - allow it but log for monitoring
            // Single-device enforcement won't work for these tokens
            // User will get new token with sessionId on next login
            logger.info(`[Auth] Legacy token (no sessionId) for user: ${decoded.userId} - allowing access`);
        }

        // Attach user to request object (with role indicator if admin)
        req.user = isAdmin ? { ...user, role: 'admin' } : user as Student;
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
