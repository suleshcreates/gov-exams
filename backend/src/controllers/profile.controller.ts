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
        const { data: regularResults, error: regularError } = await supabaseAdmin
            .from('exam_results')
            .select('*')
            .eq('student_phone', userPhone)
            .order('created_at', { ascending: false });

        if (regularError) logger.error('[PROFILE] Error fetching regular results:', regularError);

        // Fetch Special Exam Results
        let specialResults: any[] = [];
        try {
            let query = supabaseAdmin
                .from('special_exam_results')
                .select('*, special_exam:special_exams(title)')
                .order('created_at', { ascending: false });

            if (userId) {
                query = query.eq('user_auth_id', userId);
            } else {
                query = query.eq('user_email', userPhone); // Fallback to phone/email
            }

            const { data, error } = await query;

            if (error) {
                logger.error('[PROFILE] Error fetching special results:', error);
            } else {
                specialResults = data || [];
                console.log(`[ProfileController] Special Results found: ${specialResults.length}`);
            }
        } catch (e) {
            logger.error('[PROFILE] Unexpected error fetching special results:', e);
        }

        // Normalize and Group Special Exams
        const specialExamsMap = new Map<string, any>();

        (specialResults || []).forEach((item: any) => {
            const examId = item.special_exam_id;
            if (!specialExamsMap.has(examId)) {
                specialExamsMap.set(examId, {
                    id: `group_${examId}`,
                    // For profile list display, we can use the exam_id or special_exam_id
                    exam_id: examId,
                    exam_title: item.special_exam?.title || 'Special Exam',
                    is_special: true,
                    score: 0,
                    total_questions: 0,
                    time_minutes: 0,
                    created_at: item.created_at,
                    sets_count: 0
                });
            }

            const group = specialExamsMap.get(examId);
            group.score += (item.score || 0);
            group.total_questions += (item.total_questions || 0);
            const mins = Math.ceil((item.time_taken_seconds || 0) / 60);
            group.time_minutes += mins;
            group.sets_count += 1;

            if (new Date(item.created_at) > new Date(group.created_at)) {
                group.created_at = item.created_at;
            }
        });

        const groupedSpecialResults = Array.from(specialExamsMap.values()).map(group => ({
            ...group,
            accuracy: group.total_questions > 0 ? Math.round((group.score / group.total_questions) * 100) : 0,
            time_taken: `${group.time_minutes} min`
        }));

        // Combine and Sort
        const examResults = [
            ...(regularResults || []),
            ...groupedSpecialResults
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Calculate analytics
        const totalExams = examResults.length;
        const averageScore = totalExams > 0
            ? (examResults.reduce((acc: number, r: any) => acc + r.accuracy, 0) / totalExams)
            : 0;
        const examsPassed = examResults.filter((r: any) => r.accuracy >= 85).length;

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
