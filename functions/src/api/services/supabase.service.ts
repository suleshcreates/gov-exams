import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';
import { Student, UserPlan, ExamResult } from '../types';

/**
 * Supabase database service
 * All Supabase queries go through this layer
 */

// ==================== STUDENTS ====================

export async function getStudentByAuthId(authUserId: string): Promise<Student | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('students')
            .select('*')
            .eq('auth_user_id', authUserId)
            .single();

        if (error) return null;
        return data as Student;
    } catch (error) {
        logger.error('Error in getStudentByAuthId:', error);
        return null;
    }
}

export async function getStudentByEmail(email: string): Promise<Student | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('students')
            .select('*')
            .eq('email', email)
            .single();

        if (error) return null;
        return data as Student;
    } catch (error) {
        logger.error('Error in getStudentByEmail:', error);
        return null;
    }
}

export async function updateStudentProfile(
    phone: string,
    updates: Partial<Student>
): Promise<Student | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('students')
            .update(updates)
            .eq('phone', phone)
            .select()
            .single();

        if (error) {
            logger.error('Error updating student profile:', error);
            return null;
        }

        return data as Student;
    } catch (error) {
        logger.error('Exception in updateStudentProfile:', error);
        return null;
    }
}

// ==================== USER PLANS ====================

export async function getUserPlans(studentPhone: string): Promise<UserPlan[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('user_plans')
            .select('*')
            .eq('student_phone', studentPhone)
            .order('purchased_at', { ascending: false });

        if (error) {
            logger.error('Error fetching user plans:', error);
            return [];
        }

        return (data as UserPlan[]) || [];
    } catch (error) {
        logger.error('Exception in getUserPlans:', error);
        return [];
    }
}

export async function getActivePlans(studentPhone: string): Promise<UserPlan[]> {
    try {
        const now = new Date().toISOString();

        const { data, error } = await supabaseAdmin
            .from('user_plans')
            .select('*')
            .eq('student_phone', studentPhone)
            .or(`expires_at.is.null,expires_at.gt.${now}`)
            .order('purchased_at', { ascending: false });

        if (error) {
            logger.error('Error fetching active plans:', error);
            return [];
        }

        return (data as UserPlan[]) || [];
    } catch (error) {
        logger.error('Exception in getActivePlans:', error);
        return [];
    }
}

export async function savePlanPurchase(planData: {
    student_phone: string;
    student_name?: string;
    plan_id?: string;
    plan_name?: string;
    price_paid: number;
    exam_ids: string[];
    expires_at?: string;
}): Promise<UserPlan | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('user_plans')
            .insert(planData)
            .select()
            .single();

        if (error) {
            logger.error('Error saving plan purchase:', error);
            return null;
        }

        return data as UserPlan;
    } catch (error) {
        logger.error('Exception in savePlanPurchase:', error);
        return null;
    }
}

// ==================== EXAM RESULTS ====================

export async function getExamResults(studentPhone: string): Promise<ExamResult[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('exam_results')
            .select('*')
            .eq('student_phone', studentPhone)
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('Error fetching exam results:', error);
            return [];
        }

        return (data as ExamResult[]) || [];
    } catch (error) {
        logger.error('Exception in getExamResults:', error);
        return [];
    }
}

export async function saveExamResult(resultData: {
    student_phone: string;
    exam_id: string;
    exam_title: string;
    set_id: string;
    set_number: number;
    score: number;
    total_questions: number;
    accuracy: number;
    time_taken: string;
    user_answers: any[];
}): Promise<ExamResult | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('exam_results')
            .insert(resultData)
            .select()
            .single();

        if (error) {
            logger.error('Error saving exam result:', error);
            return null;
        }

        return data as ExamResult;
    } catch (error) {
        logger.error('Exception in saveExamResult:', error);
        return null;
    }
}

// ==================== EXAM PROGRESS ====================

export async function getExamProgress(studentPhone: string, examId: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('exam_progress')
            .select('*')
            .eq('student_phone', studentPhone)
            .eq('exam_id', examId)
            .single();

        if (error) return null;
        return data;
    } catch (error) {
        logger.error('Exception in getExamProgress:', error);
        return null;
    }
}

export async function updateExamProgress(
    studentPhone: string,
    examId: string,
    completedSetNumber: number
) {
    try {
        const { data, error } = await supabaseAdmin
            .from('exam_progress')
            .upsert({
                student_phone: studentPhone,
                exam_id: examId,
                completed_set_number: completedSetNumber,
            })
            .select()
            .single();

        if (error) {
            logger.error('Error updating exam progress:', error);
            return null;
        }

        return data;
    } catch (error) {
        logger.error('Exception in updateExamProgress:', error);
        return null;
    }
}

export default {
    getStudentByAuthId,
    getStudentByEmail,
    updateStudentProfile,
    getUserPlans,
    getActivePlans,
    savePlanPurchase,
    getExamResults,
    saveExamResult,
    getExamProgress,
    updateExamProgress,
};
