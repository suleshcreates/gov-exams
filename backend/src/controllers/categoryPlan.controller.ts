import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../config/supabase';
import logger from '../utils/logger';

// ============================================
// PUBLIC: Get all active category plans
// ============================================
export const getCategoryPlansController = async (req: Request, res: Response) => {
    try {
        const { category } = req.query;

        let query = supabase
            .from('special_exam_category_plans')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (category) {
            query = query.ilike('category', category as string);
        }

        const { data, error } = await query;

        if (error) {
            logger.error('Error fetching category plans:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
    } catch (err: any) {
        logger.error('Server error fetching category plans:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// ADMIN: Get all category plans (including inactive)
// ============================================
export const getAdminCategoryPlansController = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('special_exam_category_plans')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('Error fetching admin category plans:', error);
            return res.status(500).json({ error: error.message });
        }

        // Enrich with exam count per category
        const enriched = await Promise.all((data || []).map(async (plan: any) => {
            const { count } = await supabase
                .from('special_exams')
                .select('*', { count: 'exact', head: true })
                .ilike('category', plan.category)
                .eq('is_active', true);

            return {
                ...plan,
                exams_count: count || 0
            };
        }));

        return res.status(200).json(enriched);
    } catch (err: any) {
        logger.error('Server error fetching admin category plans:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// ADMIN: Create category plan
// ============================================
export const createCategoryPlanController = async (req: Request, res: Response) => {
    try {
        const { category, title, description, price, is_active } = req.body;

        if (!category || !title) {
            return res.status(400).json({ error: 'Category and title are required' });
        }

        const { data, error } = await supabase
            .from('special_exam_category_plans')
            .insert([{
                category,
                title,
                description: description || null,
                price: price || 0,
                is_active: is_active !== false
            }])
            .select()
            .single();

        if (error) {
            logger.error('Error creating category plan:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(data);
    } catch (err: any) {
        logger.error('Server error creating category plan:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// ADMIN: Update category plan
// ============================================
export const updateCategoryPlanController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('special_exam_category_plans')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            logger.error('Error updating category plan:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
    } catch (err: any) {
        logger.error('Server error updating category plan:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// ADMIN: Delete category plan
// ============================================
export const deleteCategoryPlanController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('special_exam_category_plans')
            .delete()
            .eq('id', id);

        if (error) {
            logger.error('Error deleting category plan:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ message: 'Category plan deleted successfully' });
    } catch (err: any) {
        logger.error('Server error deleting category plan:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
