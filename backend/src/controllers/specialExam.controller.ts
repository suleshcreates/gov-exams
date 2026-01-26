import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../config/supabase';
import logger from '../utils/logger';

// ============================================
// PUBLIC: Get all active special exams
// ============================================
export const getSpecialExamsController = async (req: Request, res: Response) => {
    try {
        const { category } = req.query;

        let query = supabase
            .from('special_exams')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) {
            logger.error('Error fetching special exams:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
    } catch (err: any) {
        logger.error('Server error fetching special exams:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// PUBLIC: Get special exam by ID with sets
// ============================================
export const getSpecialExamByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data: exam, error } = await supabase
            .from('special_exams')
            .select(`
                *,
                sets:special_exam_sets(
                    id,
                    set_number,
                    question_set_id
                )
            `)
            .eq('id', id)
            .eq('is_active', true)
            .single();

        if (error) {
            logger.error('Error fetching special exam:', error);
            return res.status(404).json({ error: 'Exam not found' });
        }

        return res.status(200).json(exam);
    } catch (err: any) {
        logger.error('Server error fetching special exam:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// ADMIN: Get special exam by ID with full details (Bypasses RLS)
// ============================================
export const getAdminSpecialExamByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data: exam, error } = await supabase
            .from('special_exams')
            .select(`
                *,
                sets:special_exam_sets(
                    id,
                    set_number,
                    question_set_id,
                    question_set:question_sets(id, exam_id, set_number, subject_id)
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            logger.error('Error fetching special exam details:', error);
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Transform sets to match expected frontend format if needed
        // But the query above matches what getSpecialExamSets was doing via join

        return res.status(200).json(exam);
    } catch (err: any) {
        logger.error('Server error fetching special exam details:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// ADMIN: Create special exam
// ============================================
export const createSpecialExamController = async (req: Request, res: Response) => {
    try {
        const { title, description, category, price, time_limit_minutes, thumbnail_url } = req.body;

        const { data, error } = await supabase
            .from('special_exams')
            .insert([{
                title,
                description,
                category,
                price: price || 0,
                time_limit_minutes: time_limit_minutes || 30,
                thumbnail_url
            }])
            .select()
            .single();

        if (error) {
            logger.error('Error creating special exam:', error);
            return res.status(500).json({ error: error.message });
        }

        // Create 5 empty sets for the exam
        const setsToInsert = Array.from({ length: 5 }, (_, i) => ({
            special_exam_id: data.id,
            set_number: i + 1,
            question_set_id: null
        }));

        await supabase.from('special_exam_sets').insert(setsToInsert);

        return res.status(201).json(data);
    } catch (err: any) {
        logger.error('Server error creating special exam:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// ADMIN: Update special exam
// ============================================
export const updateSpecialExamController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('special_exams')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            logger.error('Error updating special exam:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
    } catch (err: any) {
        logger.error('Server error updating special exam:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// ADMIN: Delete special exam
// ============================================
export const deleteSpecialExamController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('special_exams')
            .delete()
            .eq('id', id);

        if (error) {
            logger.error('Error deleting special exam:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ message: 'Exam deleted successfully' });
    } catch (err: any) {
        logger.error('Server error deleting special exam:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// ADMIN: Assign question set to exam set
// ============================================
export const assignQuestionSetController = async (req: Request, res: Response) => {
    try {
        const { examId, setNumber } = req.params;
        const { question_set_id } = req.body;

        const { data, error } = await supabase
            .from('special_exam_sets')
            .update({ question_set_id })
            .eq('special_exam_id', examId)
            .eq('set_number', parseInt(setNumber))
            .select()
            .single();

        if (error) {
            logger.error('Error assigning question set:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
    } catch (err: any) {
        logger.error('Server error assigning question set:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// USER: Check access to special exam
// ============================================
export const checkExamAccessController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = (req as any).user;
        const userId = user.auth_user_id || user.id;

        const { data, error } = await supabase
            .from('user_premium_access')
            .select('*')
            .eq('user_auth_id', userId)
            .eq('resource_type', 'special_exam')
            .eq('resource_id', id)
            .single();

        if (error && error.code !== 'PGRST116') {
            logger.error('Error checking exam access:', error);
            return res.status(500).json({ error: error.message });
        }

        const hasAccess = !!data;
        return res.status(200).json({ hasAccess, accessData: data });
    } catch (err: any) {
        logger.error('Server error checking exam access:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// USER: Get questions for a specific set (requires access)
// ============================================
export const getExamSetQuestionsController = async (req: Request, res: Response) => {
    try {
        const { examId, setNumber } = req.params;
        const user = (req as any).user;
        const userId = user.auth_user_id || user.id;

        // Check access
        const { data: access } = await supabase
            .from('user_premium_access')
            .select('*')
            .eq('user_auth_id', userId)
            .eq('resource_type', 'special_exam')
            .eq('resource_id', examId)
            .single();

        if (!access) {
            return res.status(403).json({ error: 'Purchase required to access this exam' });
        }

        // Get the question set ID for this set number
        const { data: examSet, error: setError } = await supabase
            .from('special_exam_sets')
            .select('question_set_id')
            .eq('special_exam_id', examId)
            .eq('set_number', parseInt(setNumber))
            .single();

        if (setError || !examSet?.question_set_id) {
            return res.status(404).json({ error: 'Question set not found' });
        }

        // Get questions
        const { data: questions, error: qError } = await supabase
            .from('questions')
            .select('*')
            .eq('question_set_id', examSet.question_set_id)
            .order('order_index', { ascending: true });

        if (qError) {
            logger.error('Error fetching questions:', qError);
            return res.status(500).json({ error: qError.message });
        }

        return res.status(200).json(questions);
    } catch (err: any) {
        logger.error('Server error fetching exam set questions:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// USER: Submit exam set result
// ============================================
export const submitExamResultController = async (req: Request, res: Response) => {
    try {
        const { examId, setNumber } = req.params;
        const { score, total_questions, accuracy, time_taken_seconds, user_answers } = req.body;
        const user = (req as any).user;
        const userId = user.auth_user_id || user.id;
        const userEmail = user.email;

        const { data, error } = await supabase
            .from('special_exam_results')
            .insert([{
                user_auth_id: userId,
                user_email: userEmail,
                special_exam_id: examId,
                set_number: parseInt(setNumber),
                score,
                total_questions,
                accuracy,
                time_taken_seconds,
                user_answers
            }])
            .select()
            .single();

        if (error) {
            logger.error('Error submitting exam result:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(data);
    } catch (err: any) {
        logger.error('Server error submitting exam result:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// USER: Get user's exam results
// ============================================
export const getUserExamResultsController = async (req: Request, res: Response) => {
    try {
        const { examId } = req.params;
        const user = (req as any).user;
        const userId = user.auth_user_id || user.id;

        const { data, error } = await supabase
            .from('special_exam_results')
            .select('*')
            .eq('user_auth_id', userId)
            .eq('special_exam_id', examId)
            .order('set_number', { ascending: true });

        if (error) {
            logger.error('Error fetching user exam results:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
    } catch (err: any) {
        logger.error('Server error fetching user exam results:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
