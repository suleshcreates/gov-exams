import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../config/supabase';
import logger from '../utils/logger';

// Create Question Set
export const createQuestionSetController = async (req: Request, res: Response) => {
    try {
        const { subject_id, exam_id, set_number, time_limit_minutes, topic_id } = req.body;

        const { data, error } = await supabase
            .from('question_sets')
            .insert([{ subject_id, exam_id, set_number, time_limit_minutes, topic_id }])
            .select()
            .single();

        if (error) {
            console.error('Supabase error creating question set:', error);
            if (error.code === '42501') {
                return res.status(403).json({ error: 'Permission denied (RLS)' });
            }
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(data);
    } catch (err: any) {
        console.error('Server error creating question set:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Update Question Set
export const updateQuestionSetController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('question_sets')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase error updating question set:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
    } catch (err: any) {
        console.error('Server error updating question set:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
