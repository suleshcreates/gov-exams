import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../config/supabase';
import logger from '../utils/logger';

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
