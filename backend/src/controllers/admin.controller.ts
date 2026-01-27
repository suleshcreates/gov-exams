import { Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';
import { AuthRequest } from '../types';

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
// ... (imports)

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

        // Get active plans count
        const { count: activePlans } = await supabaseAdmin
            .from('user_plans')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        // Get total exam results (Regular)
        const { count: totalResultsRegular, data: resultsRegular } = await supabaseAdmin
            .from('exam_results')
            .select('score', { count: 'exact' });

        // Get total exam results (Special)
        const { count: totalResultsSpecial, data: resultsSpecial } = await supabaseAdmin
            .from('special_exam_results')
            .select('score', { count: 'exact' });

        const totalResults = (totalResultsRegular || 0) + (totalResultsSpecial || 0);

        // Calculate average score (merging both)
        let totalScoreSum = 0;
        let countForAvg = 0;

        if (resultsRegular) {
            totalScoreSum += resultsRegular.reduce((acc, curr) => acc + (curr.score || 0), 0);
            countForAvg += resultsRegular.length;
        }
        if (resultsSpecial) {
            totalScoreSum += resultsSpecial.reduce((acc, curr) => acc + (curr.score || 0), 0);
            countForAvg += resultsSpecial.length;
        }

        const averageScore = countForAvg > 0 ? Math.round(totalScoreSum / countForAvg) : 0;

        // Get total revenue from user_plans
        const { data: planData } = await supabaseAdmin
            .from('user_plans')
            .select('price_paid, plan_name');

        // Get revenue from special exam purchases (user_premium_access joined with special_exams?)
        // Or better, track 'purchases' table if exists. 
        // For now, rely on user_plans as main revenue source or check 'user_premium_access' if it has price.
        // The previous code only checked user_plans. I will keep it simple for now or check 'user_premium_access' if requested.
        // User asked to "save and display this data" (meaning results).
        // I'll stick to updating RESULT stats.

        const totalRevenue = planData
            ? planData.reduce((acc, curr) => acc + (parseFloat(curr.price_paid) || 0), 0)
            : 0;

        // Calculate revenue by plan type
        const revenueByPlan: Record<string, number> = {};
        if (planData) {
            planData.forEach((plan) => {
                const planName = plan.plan_name || 'Unknown';
                revenueByPlan[planName] = (revenueByPlan[planName] || 0) + (parseFloat(plan.price_paid) || 0);
            });
        }

        res.json({
            success: true,
            stats: {
                totalStudents: totalStudents || 0,
                activePlans: activePlans || 0,
                totalResults: totalResults || 0,
                averageScore: averageScore,
                totalRevenue: totalRevenue,
                revenueByPlan: revenueByPlan,
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


export async function getRecentRegistrationsController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const limit = parseInt(req.query.limit as string) || 5;

        const { data, error } = await supabaseAdmin
            .from('students')
            .select('email, username, name, created_at')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        res.json({ success: true, data: data || [] });
    } catch (error: any) {
        logger.error('Get recent registrations error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get recent registrations',
        });
    }
}


export async function getRecentExamCompletionsController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const limit = parseInt(req.query.limit as string) || 10;

        // 1. Fetch Regular
        const { data: regular, error: regError } = await supabaseAdmin
            .from('exam_results')
            .select('id, student_name, exam_title, score, total_questions, accuracy, created_at')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (regError) throw regError;

        // 2. Fetch Special
        const { data: special, error: specError } = await supabaseAdmin
            .from('special_exam_results')
            .select('id, user_auth_id, score, total_questions, accuracy, created_at, special_exam:special_exams(title), student:students(name)')
            // Note: student relation might not exist directly if user_auth_id links to auth.users
            // We might need to fetch student name from 'students' table using user_email if available?
            // special_exam_results has 'user_email'.
            .order('created_at', { ascending: false })
            .limit(limit);

        if (specError) console.error("Error fetching special exams for dashboard", specError);

        // Normalize Special
        const normalizedSpecial = (special || []).map((item: any) => ({
            id: item.id,
            student_name: item.user_email || 'Student', // Fallback
            exam_title: item.special_exam?.title || 'Special Exam',
            score: item.score,
            total_questions: item.total_questions,
            accuracy: item.accuracy,
            created_at: item.created_at,
            is_special: true
        }));

        // Combine and Sort
        const combined = [...(regular || []), ...normalizedSpecial]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, limit);

        res.json({ success: true, data: combined });
    } catch (error: any) {
        logger.error('Get recent exam completions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get recent exam completions',
        });
    }
}

export async function getRecentPlanPurchasesController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const limit = parseInt(req.query.limit as string) || 5;

        const { data, error } = await supabaseAdmin
            .from('user_plans')
            .select('id, student_name, plan_name, price_paid, purchased_at')
            .order('purchased_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        res.json({ success: true, data: data || [] });
    } catch (error: any) {
        logger.error('Get recent plan purchases error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get recent plan purchases',
        });
    }
}

export async function getStudentsController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string || '';

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabaseAdmin
            .from('students')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (search) {
            query = query.or(`email.ilike.%${search}%,username.ilike.%${search}%,name.ilike.%${search}%`);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        res.json({
            success: true,
            data: {
                students: data || [],
                total: count || 0,
                page,
                totalPages: Math.ceil((count || 0) / limit),
            }
        });
    } catch (error: any) {
        logger.error('Get students error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get students',
        });
    }
}

export async function getSubjectsController(
    _req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const { data, error } = await supabaseAdmin
            .from('subjects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error: any) {
        logger.error('Get subjects error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get subjects',
        });
    }
}

export async function createSubjectController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const { name, description } = req.body;

        if (!name) {
            res.status(400).json({ success: false, error: 'Name is required' });
            return;
        }

        const { data, error } = await supabaseAdmin
            .from('subjects')
            .insert([{ name, description: description || '' }])
            .select()
            .single();

        if (error) throw error;

        logger.info(`Subject created: ${name}`);
        res.status(201).json({ success: true, data });
    } catch (error: any) {
        logger.error('Create subject error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create subject',
        });
    }
}

export async function updateSubjectController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const { data, error } = await supabaseAdmin
            .from('subjects')
            .update({ name, description })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        logger.info(`Subject updated: ${id}`);
        res.json({ success: true, data });
    } catch (error: any) {
        logger.error('Update subject error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update subject',
        });
    }
}

export async function deleteSubjectController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('subjects')
            .delete()
            .eq('id', id);

        if (error) throw error;

        logger.info(`Subject deleted: ${id}`);
        res.json({ success: true, message: 'Subject deleted' });
    } catch (error: any) {
        logger.error('Delete subject error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete subject',
        });
    }
}

export default {
    getStatsController,
    getSubjectsController,
    createSubjectController,
    updateSubjectController,
    deleteSubjectController,
};

export async function getExamResultsController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const examId = req.query.examId as string;
        const studentSearch = req.query.studentSearch as string;
        const dateFrom = req.query.dateFrom as string;
        const dateTo = req.query.dateTo as string;

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // 1. Query Regular Results
        let queryRegular = supabaseAdmin
            .from('exam_results')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to); // Limitation: pagination is per-table

        if (examId) queryRegular = queryRegular.eq('exam_id', examId);
        if (studentSearch) queryRegular = queryRegular.or(`student_name.ilike.%${studentSearch}%,student_phone.ilike.%${studentSearch}%`);
        if (dateFrom) queryRegular = queryRegular.gte('created_at', dateFrom);
        if (dateTo) queryRegular = queryRegular.lte('created_at', dateTo);

        // 2. Query Special Results
        let querySpecial = supabaseAdmin
            .from('special_exam_results')
            .select('*, special_exam:special_exams(title)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (examId) querySpecial = querySpecial.eq('special_exam_id', examId);
        if (studentSearch) querySpecial = querySpecial.or(`user_email.ilike.%${studentSearch}%`); // Approximate search
        if (dateFrom) querySpecial = querySpecial.gte('created_at', dateFrom);
        if (dateTo) querySpecial = querySpecial.lte('created_at', dateTo);

        const [regularRes, specialRes] = await Promise.all([queryRegular, querySpecial]);

        if (regularRes.error) throw regularRes.error;
        if (specialRes.error) console.error("Error fetching special results:", specialRes.error);

        // 3. Normalize Special Results
        const normalizedSpecial = (specialRes.data || []).map((item: any) => ({
            id: item.id,
            student_name: item.user_email?.split('@')[0] || 'Student', // Fallback name
            student_phone: item.user_email || 'N/A', // Phone often not in this table, use email
            exam_title: item.special_exam?.title || 'Special Exam',
            exam_id: item.special_exam_id,
            set_number: item.set_number,
            score: item.score,
            total_questions: item.total_questions,
            accuracy: item.accuracy,
            time_taken: item.time_taken_seconds, // Raw seconds, frontend handles formatting?
            created_at: item.created_at,
            user_answers: item.user_answers,
            // Add flag if needed
            is_special: true
        }));

        // 4. Merge and Sort
        // Note: This paging strategy (page X from A + page X from B) is imperfect but usable for administrative lists
        const combinedResults = [...(regularRes.data || []), ...normalizedSpecial]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Check Frontend expectation: 'time_taken' string vs number?
        // Regular: "5 min" (string)
        // Special: number (seconds)
        // Adjust Special to match string format if needed OR update frontend to handle both.
        // Frontend ExamResults.tsx: Math.floor(r.time_taken / 60). Expects NUMBER?
        // Let's check Regular data... `time_taken` in `exam_results` is string "X min" in controller `topic.controller.ts`.
        // BUT AdminService logs show it expects number?
        // ExamResults.tsx line 82: `Math.floor(r.time_taken / 60)` -> Assumes number.
        // Frontend `r.time_taken`.
        // `topic.controller.ts`: `time_taken: timeTakenStr` (string).
        // This suggests `ExamResults.tsx` might be broken for regular exams if they send "5 min".
        // Let's force everything to be a number (seconds) if possible, or frontend handles NaN.
        // I will normalize combined results time_taken.

        const finalResults = combinedResults.map(r => {
            let timeSeconds = 0;
            if (typeof r.time_taken === 'string') {
                // Parse "5 min" -> 300
                const mins = parseInt(r.time_taken.replace(/[^0-9]/g, '') || "0");
                timeSeconds = mins * 60;
            } else {
                timeSeconds = r.time_taken || 0;
            }
            return { ...r, time_taken: timeSeconds };
        });


        res.json({
            success: true,
            data: {
                results: finalResults,
                total: (regularRes.count || 0) + (specialRes.count || 0),
                page,
                totalPages: Math.ceil(((regularRes.count || 0) + (specialRes.count || 0)) / limit),
            }
        });
    } catch (error: any) {
        logger.error('Get exam results error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch exam results',
        });
    }
}


export async function getUserPlansController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const status = req.query.status as string;
        const studentSearch = req.query.studentSearch as string;

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabaseAdmin
            .from('user_plans')
            .select('*', { count: 'exact' })
            .order('purchased_at', { ascending: false })
            .range(from, to);

        if (status === 'active') {
            const now = new Date().toISOString();
            query = query.eq('is_active', true).or(`expires_at.is.null,expires_at.gt.${now}`);
        } else if (status === 'expired') {
            const now = new Date().toISOString();
            query = query.or(`is_active.eq.false,expires_at.lt.${now}`);
        }

        if (studentSearch) {
            query = query.or(`student_name.ilike.%${studentSearch}%,student_phone.ilike.%${studentSearch}%`);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        res.json({
            success: true,
            data: {
                plans: data || [],
                total: count || 0,
                page,
                totalPages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error: any) {
        logger.error('Get user plans error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch user plans',
        });
    }
}

export async function createUserPlanController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const {
            student_id,
            plan_name,
            price_paid,
            exam_access,
            expires_at
        } = req.body;

        if (!student_id || !plan_name) {
            res.status(400).json({ success: false, error: 'Student ID and Plan Name are required' });
            return;
        }

        // Fetch student details to populate plan info
        const { data: student, error: studentError } = await supabaseAdmin
            .from('students')
            .select('name, email, phone')
            .eq('id', student_id)
            .single();

        if (studentError || !student) {
            res.status(404).json({ success: false, error: 'Student not found' });
            return;
        }

        const { data, error } = await supabaseAdmin
            .from('user_plans')
            .insert([{
                student_id: student_id,
                student_name: student.name,
                student_phone: student.phone || student.email,
                plan_name: plan_name,
                price_paid: price_paid || 0,
                exam_access: exam_access || [],
                purchased_at: new Date().toISOString(),
                expires_at: expires_at,
                is_active: true,
            }])
            .select()
            .single();

        if (error) throw error;

        logger.info(`Manual plan created for student: ${student.email}`);
        res.status(201).json({ success: true, data });
    } catch (error: any) {
        logger.error('Create user plan error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create user plan',
        });
    }
}

export async function deactivateUserPlanController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('user_plans')
            .update({ is_active: false })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        logger.info(`User plan deactivated: ${id}`);
        res.json({ success: true, data });
    } catch (error: any) {
        logger.error('Deactivate user plan error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to deactivate user plan',
        });
    }
}

export async function getPlanTemplatesController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const includeInactive = req.query.includeInactive === 'true';

        let query = supabaseAdmin
            .from('plan_templates')
            .select('*')
            .order('display_order', { ascending: true });

        if (!includeInactive) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error: any) {
        logger.error('Get plan templates error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get plan templates',
        });
    }
}

export async function createPlanTemplateController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const { name, description, price, validity_days, subjects, badge, display_order } = req.body;

        if (!name || price === undefined) {
            res.status(400).json({ success: false, error: 'Name and price are required' });
            return;
        }

        const { data, error } = await supabaseAdmin
            .from('plan_templates')
            .insert([{
                name,
                description: description || '',
                price,
                validity_days: validity_days || null,
                subjects: subjects || [],
                badge: badge || null,
                display_order: display_order || 0,
                is_active: true,
            }])
            .select()
            .single();

        if (error) throw error;

        logger.info(`Plan template created: ${name}`);
        res.status(201).json({ success: true, data });
    } catch (error: any) {
        logger.error('Create plan template error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create plan template',
        });
    }
}

export async function updatePlanTemplateController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabaseAdmin
            .from('plan_templates')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        logger.info(`Plan template updated: ${id}`);
        res.json({ success: true, data });
    } catch (error: any) {
        logger.error('Update plan template error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update plan template',
        });
    }
}

export async function deletePlanTemplateController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('plan_templates')
            .delete()
            .eq('id', id);

        if (error) throw error;

        logger.info(`Plan template deleted: ${id}`);
        res.json({ success: true, message: 'Plan template deleted' });
    } catch (error: any) {
        logger.error('Delete plan template error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete plan template',
        });
    }
}

// Student Details Controllers for Admin
export async function getStudentDetailsController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const { email } = req.params;
        // Decode email if it was encoded
        const decodedEmail = decodeURIComponent(email);

        const { data, error } = await supabaseAdmin
            .from('students')
            .select('*')
            .eq('email', decodedEmail)
            .single();

        if (error) throw error;
        if (!data) {
            res.status(404).json({ success: false, error: 'Student not found' });
            return;
        }

        res.json(data);
    } catch (error: any) {
        logger.error('Get student details error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch student details' });
    }
}

export async function getStudentPlansByStudentController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const { email } = req.params;
        const decodedEmail = decodeURIComponent(email);

        // Find student first to get name/phone if needed, or query by student_email if column exists
        // Based on original code, it queried by student_name. Let's fetch student first.
        const { data: student } = await supabaseAdmin.from('students').select('name').eq('email', decodedEmail).single();

        if (!student) {
            res.status(404).json({ success: false, error: 'Student not found' });
            return;
        }

        const { data, error } = await supabaseAdmin
            .from('user_plans')
            .select('*')
            .eq('student_name', student.name)
            .order('purchased_at', { ascending: false });

        if (error) throw error;

        const formatted = (data || []).map((plan: any) => ({
            ...plan,
            exam_access: plan.exam_ids || plan.subjects || [],
        }));

        res.json(formatted);
    } catch (error: any) {
        logger.error('Get student plans error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch student plans' });
    }
}

export async function getStudentHistoryByStudentController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const { email } = req.params;
        const decodedEmail = decodeURIComponent(email);

        // Fetch student name/phone
        const { data: student } = await supabaseAdmin.from('students').select('name, phone, id, email').eq('email', decodedEmail).single();
        if (!student) {
            res.status(404).json({ success: false, error: 'Student not found' });
            return;
        }

        // 1. Fetch Regular History
        const { data: regular, error: regError } = await supabaseAdmin
            .from('exam_results')
            .select('*')
            .eq('student_name', student.name) // or phone? Original used name.
            .order('created_at', { ascending: false });

        if (regError) throw regError;

        // 2. Fetch Special History
        const { data: special, error: specError } = await supabaseAdmin
            .from('special_exam_results')
            .select(`
                *,
                special_exam:special_exams(title)
            `)
            .eq('user_email', student.email) // Use email which is reliable
            .order('created_at', { ascending: false });

        if (specError) console.error("Error fetching special history for admin", specError);

        // 3. Normalize Special
        const normalizedSpecial = (special || []).map((item: any) => ({
            id: item.id,
            exam_id: item.special_exam_id,
            exam_title: item.special_exam?.title || 'Special Exam',
            set_number: item.set_number,
            score: item.score,
            total_questions: item.total_questions,
            accuracy: item.accuracy,
            time_taken: `${Math.ceil((item.time_taken_seconds || 0) / 60)} min`,
            created_at: item.created_at,
            is_special: true
        }));

        // 4. Combine and Sort
        const combined = [...(regular || []), ...normalizedSpecial]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        res.json(combined);
    } catch (error: any) {
        logger.error('Get student history error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch student history' });
    }
}
