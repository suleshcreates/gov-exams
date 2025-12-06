import { Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';
import { AuthRequest } from '../types';

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
export async function getStatsController(
    _req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        // Get total students
        const { count: totalStudents } = await supabaseAdmin
            .from('students')
            .select('*', { count: 'exact', head: true });

        // Get total exams
        const { count: totalExams } = await supabaseAdmin
            .from('exams')
            .select('*', { count: 'exact', head: true });

        // Get total results
        const { count: totalResults } = await supabaseAdmin
            .from('exam_results')
            .select('*', { count: 'exact', head: true });

        res.json({
            success: true,
            stats: {
                totalStudents: totalStudents || 0,
                totalExams: totalExams || 0,
                totalResults: totalResults || 0,
            },
        });
    } catch (error: any) {
        logger.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get statistics',
        });
    }
}

export default {
    getStatsController,
};
