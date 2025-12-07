import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';

/**
 * Get active plans for the authenticated user
 */
export const getUserPlansController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.auth_user_id;
        const userPhone = (req as any).user?.phone;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }

        logger.info(`[PLANS] Fetching plans for user: ${userPhone}`);

        const now = new Date().toISOString();
        const { data, error } = await supabaseAdmin
            .from('user_plans')
            .select('*')
            .eq('auth_user_id', userId)
            .eq('is_active', true)
            .or(`expires_at.is.null,expires_at.gt."${now}"`)
            .order('purchased_at', { ascending: false });

        if (error) {
            logger.error('[PLANS] Error fetching user plans:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch plans',
            });
        }

        logger.info(`[PLANS] Found ${data?.length || 0} active plans for user ${userPhone}`);

        return res.status(200).json({
            success: true,
            plans: data || [],
        });
    } catch (error) {
        logger.error('[PLANS] Unexpected error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

/**
 * Check if user has access to a specific exam
 */
export const checkExamAccessController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.auth_user_id;
        const { examId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }

        if (!examId) {
            return res.status(400).json({
                success: false,
                error: 'Exam ID required',
            });
        }

        const now = new Date().toISOString();
        const { data, error } = await supabaseAdmin
            .from('user_plans')
            .select('id, plan_name, exam_ids')
            .eq('auth_user_id', userId)
            .eq('is_active', true)
            .or(`expires_at.is.null,expires_at.gt."${now}"`);

        if (error) {
            logger.error('[PLANS] Error checking exam access:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to check access',
            });
        }

        // Check if any plan includes this exam
        const hasAccess = (data || []).some(plan =>
            Array.isArray(plan.exam_ids) && plan.exam_ids.includes(examId)
        );

        return res.status(200).json({
            success: true,
            hasAccess,
            plans: hasAccess ? data : [],
        });
    } catch (error) {
        logger.error('[PLANS] Unexpected error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
