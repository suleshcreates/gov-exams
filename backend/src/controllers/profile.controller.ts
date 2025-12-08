import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';

/**
 * Get complete user profile data for the authenticated user
 */
export const getUserProfileController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.auth_user_id;
        const userPhone = (req as any).user?.phone;

        if (!userId || !userPhone) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
        }

        logger.info(`[PROFILE] Fetching profile data for user: ${userPhone}`);

        // Fetch student info
        const { data: student, error: studentError } = await supabaseAdmin
            .from('students')
            .select('*')
            .eq('phone', userPhone)
            .single();

        if (studentError) {
            logger.error('[PROFILE] Error fetching student:', studentError);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch student data',
            });
        }

        // Fetch exam results
        const { data: examResults, error: resultsError } = await supabaseAdmin
            .from('exam_results')
            .select('*')
            .eq('student_phone', userPhone)
            .order('created_at', { ascending: false });

        if (resultsError) {
            logger.error('[PROFILE] Error fetching exam results:', resultsError);
        }

        // Calculate analytics
        const totalExams = examResults?.length || 0;
        const averageScore = totalExams > 0
            ? (examResults?.reduce((acc: number, r: any) => acc + r.accuracy, 0) || 0) / totalExams
            : 0;
        const examsPassed = examResults?.filter((r: any) => r.accuracy >= 85).length || 0;

        // Calculate global rank
        const { data: allResults } = await supabaseAdmin
            .from('exam_results')
            .select('student_phone, accuracy');

        let globalRank = 1;
        if (allResults && allResults.length > 0) {
            const studentScores = new Map<string, { total: number; count: number }>();

            allResults.forEach((result: any) => {
                const existing = studentScores.get(result.student_phone) || { total: 0, count: 0 };
                existing.total += result.accuracy;
                existing.count += 1;
                studentScores.set(result.student_phone, existing);
            });

            const currentStudentData = studentScores.get(userPhone);
            if (currentStudentData) {
                const currentAverage = currentStudentData.total / currentStudentData.count;
                const averages = Array.from(studentScores.values()).map((data: any) => data.total / data.count);
                globalRank = averages.filter((avg: number) => avg > currentAverage).length + 1;
            }
        }

        logger.info(`[PROFILE] Successfully fetched profile for ${userPhone}`);

        return res.status(200).json({
            success: true,
            profile: {
                student,
                examResults: examResults || [],
                analytics: {
                    totalExams,
                    averageScore: Number(averageScore.toFixed(1)),
                    examsPassed,
                },
                globalRank,
            },
        });
    } catch (error) {
        logger.error('[PROFILE] Unexpected error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
