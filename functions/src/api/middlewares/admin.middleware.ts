import { Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';
import { AuthRequest } from '../types';

/**
 * Middleware to check if authenticated user is an admin
 * Must be used AFTER requireAuth middleware
 */
export const requireAdmin = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
            return;
        }

        // Check if user exists in admins table
        const { data: admin, error } = await supabaseAdmin
            .from('admins')
            .select('*')
            .eq('email', req.user.email)
            .single();

        if (error || !admin) {
            logger.warn(`Non-admin user attempted admin access: ${req.user.email}`);
            res.status(403).json({
                success: false,
                error: 'Forbidden - Admin access required',
            });
            return;
        }

        // User is admin, proceed
        next();
    } catch (error: any) {
        logger.error('Admin middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Authorization check failed',
        });
    }
};

export default requireAdmin;
