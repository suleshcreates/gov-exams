import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../config/supabase';
import logger from '../utils/logger';

// Get Questions by Question Set ID
export const getQuestionsBySetController = async (req: Request, res: Response) => {
    try {
        const { setId } = req.params;

        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('question_set_id', setId)
            .order('order_index', { ascending: true });

        if (error) {
            logger.error('Error fetching questions:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data || []);
    } catch (err: any) {
        logger.error('Server error fetching questions:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a single Question
export const createQuestionController = async (req: Request, res: Response) => {
    try {
        const questionData = req.body;

        if (!questionData.question_set_id || !questionData.question_text) {
            return res.status(400).json({ error: 'question_set_id and question_text are required' });
        }

        const { data, error } = await supabase
            .from('questions')
            .insert([questionData])
            .select()
            .single();

        if (error) {
            logger.error('Error creating question:', error);
            if (error.code === '42501') {
                return res.status(403).json({ error: 'Permission denied (RLS)' });
            }
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(data);
    } catch (err: any) {
        logger.error('Server error creating question:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Update a Question
export const updateQuestionController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const { data, error } = await supabase
            .from('questions')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            logger.error('Error updating question:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
    } catch (err: any) {
        logger.error('Server error updating question:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete a Question
export const deleteQuestionController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('questions')
            .delete()
            .eq('id', id);

        if (error) {
            logger.error('Error deleting question:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true });
    } catch (err: any) {
        logger.error('Server error deleting question:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Bulk Create Questions
export const bulkCreateQuestionsController = async (req: Request, res: Response) => {
    try {
        const { questions } = req.body;

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ error: 'Invalid questions data' });
        }

        const { data, error } = await supabase
            .from('questions')
            .insert(questions)
            .select();

        if (error) {
            logger.error('Supabase error bulk creating questions:', error);
            if (error.code === '42501') {
                return res.status(403).json({ error: 'Permission denied (RLS)' });
            }
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(data);
    } catch (err: any) {
        logger.error('Server error bulk creating questions:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
