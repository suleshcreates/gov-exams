import { Response } from 'express';
import {
    updateStudentProfile,
    getUserPlans,
    getActivePlans,
    getExamResults,
    getExamProgress,
} from '../services/supabase.service';
import logger from '../utils/logger';
import { AuthRequest } from '../types';

/**
 * GET /api/user/profile
 */
export async function getProfileController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
            return;
        }

        res.status(200).json({
            success: true,
            user: {
                id: req.user.auth_user_id,
                email: req.user.email,
                username: req.user.username,
                name: req.user.name,
                phone: req.user.phone,
                avatar_url: req.user.avatar_url,
                is_verified: req.user.is_verified,
                email_verified: req.user.email_verified,
                created_at: req.user.created_at,
            },
        });
    } catch (error: any) {
        logger.error('Get profile controller error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred fetching profile',
        });
    }
}

/**
 * PUT /api/user/profile
 */
export async function updateProfileController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
            return;
        }

        const { name, phone, username } = req.body;
        const updates: any = {};

        if (name) updates.name = name;
        if (phone) updates.phone = phone;
        if (username) updates.username = username;

        const updatedStudent = await updateStudentProfile(req.user.phone, updates);

        if (!updatedStudent) {
            res.status(500).json({
                success: false,
                error: 'Failed to update profile',
            });
            return;
        }

        res.status(200).json({
            success: true,
            user: {
                id: updatedStudent.auth_user_id,
                email: updatedStudent.email,
                username: updatedStudent.username,
                name: updatedStudent.name,
                phone: updatedStudent.phone,
            },
        });
    } catch (error: any) {
        logger.error('Update profile controller error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred updating profile',
        });
    }
}

/**
 * GET /api/user/plans
 */
export async function getUserPlansController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
            return;
        }

        const plans = await getUserPlans(req.user.phone);

        res.status(200).json({
            success: true,
            plans,
        });
    } catch (error: any) {
        logger.error('Get user plans controller error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred fetching plans',
        });
    }
}

/**
 * GET /api/user/plans/active
 */
export async function getActivePlansController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
            return;
        }

        const activePlans = await getActivePlans(req.user.phone);

        res.status(200).json({
            success: true,
            plans: activePlans,
        });
    } catch (error: any) {
        logger.error('Get active plans controller error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred fetching active plans',
        });
    }
}

/**
 * GET /api/user/exam-history
 */
export async function getExamHistoryController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
            return;
        }

        const results = await getExamResults(req.user.phone);

        res.status(200).json({
            success: true,
            results,
        });
    } catch (error: any) {
        logger.error('Get exam history controller error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred fetching exam history',
        });
    }
}

/**
 * GET /api/user/exam-progress/:examId
 */
export async function getExamProgressController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
            return;
        }

        const { examId } = req.params;
        const progress = await getExamProgress(req.user.phone, examId);

        res.status(200).json({
            success: true,
            progress: progress || { completed_set_number: 0 },
        });
    } catch (error: any) {
        logger.error('Get exam progress controller error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred fetching exam progress',
        });
    }
}

export default {
    getProfileController,
    updateProfileController,
    getUserPlansController,
    getActivePlansController,
    getExamHistoryController,
    getExamProgressController,
};
