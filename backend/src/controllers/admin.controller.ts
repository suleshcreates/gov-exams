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

        // Get active plans count
        const { count: activePlans } = await supabaseAdmin
            .from('user_plans')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        // Get total exam results
        const { count: totalResults, data: results } = await supabaseAdmin
            .from('exam_results')
            .select('score', { count: 'exact' });

        // Calculate average score
        const averageScore = results && results.length > 0
            ? Math.round(results.reduce((acc, curr) => acc + (curr.score || 0), 0) / results.length)
            : 0;

        // Get total revenue from user_plans
        const { data: planData } = await supabaseAdmin
            .from('user_plans')
            .select('price_paid, plan_name');

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

/**
 * GET /api/admin/recent-registrations
 * Get recent student registrations
 */
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

/**
 * GET /api/admin/recent-exam-completions
 * Get recent exam completions
 */
export async function getRecentExamCompletionsController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const limit = parseInt(req.query.limit as string) || 10;

        const { data, error } = await supabaseAdmin
            .from('exam_results')
            .select('id, student_name, exam_title, score, total_questions, accuracy, created_at')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        res.json({ success: true, data: data || [] });
    } catch (error: any) {
        logger.error('Get recent exam completions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get recent exam completions',
        });
    }
}

/**
 * GET /api/admin/recent-plan-purchases
 * Get recent plan purchases
 */
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

/**
 * GET /api/admin/students
 * Get all students with pagination and search
 */
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

/**
 * GET /api/admin/subjects
 * Get all subjects
 */
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

/**
 * POST /api/admin/subjects
 * Create a new subject
 */
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

/**
 * PUT /api/admin/subjects/:id
 * Update a subject
 */
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

/**
 * DELETE /api/admin/subjects/:id
 * Delete a subject
 */
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

// ================= EXAM RESULTS =================

/**
 * GET /api/admin/exam-results
 * Get exam results with pagination and filtering
 */
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

        let query = supabaseAdmin
            .from('exam_results')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (examId) {
            query = query.eq('exam_id', examId);
        }

        if (studentSearch) {
            query = query.or(`student_name.ilike.%${studentSearch}%,student_phone.ilike.%${studentSearch}%`);
        }

        if (dateFrom) {
            query = query.gte('created_at', dateFrom);
        }

        if (dateTo) {
            query = query.lte('created_at', dateTo);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        res.json({
            success: true,
            data: {
                results: data || [],
                total: count || 0,
                page,
                totalPages: Math.ceil((count || 0) / limit),
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

// ================= PLANS MANAGEMENT =================

/**
 * GET /api/admin/plans
 * Get user plans with pagination and filtering
 */
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

/**
 * POST /api/admin/plans
 * Create a manual plan for a student
 */
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

/**
 * PUT /api/admin/plans/:id/deactivate
 * Deactivate a user plan
 */
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

/**
 * GET /api/admin/plan-templates
 * Get all plan templates
 */
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

/**
 * POST /api/admin/plan-templates
 * Create a new plan template
 */
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

/**
 * PUT /api/admin/plan-templates/:id
 * Update a plan template
 */
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

/**
 * DELETE /api/admin/plan-templates/:id
 * Delete a plan template
 */
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
