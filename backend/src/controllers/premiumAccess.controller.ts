import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../config/supabase';
import logger from '../utils/logger';

// ============================================
// Purchase premium access (exam or PYQ)
// ============================================
export const purchasePremiumAccessController = async (req: Request, res: Response) => {
    try {
        const { resource_type, resource_id, payment_id, order_id, amount_paid } = req.body;
        const user = (req as any).user;
        const userId = user.auth_user_id || user.id;
        const userEmail = user.email;

        // Validate resource_type
        if (!['special_exam', 'pyq'].includes(resource_type)) {
            return res.status(400).json({ error: 'Invalid resource type' });
        }

        // Check if already purchased
        const { data: existing } = await supabase
            .from('user_premium_access')
            .select('id')
            .eq('user_auth_id', userId)
            .eq('resource_type', resource_type)
            .eq('resource_id', resource_id)
            .single();

        if (existing) {
            return res.status(400).json({ error: 'Already purchased' });
        }

        // Create access record
        const { data, error } = await supabase
            .from('user_premium_access')
            .insert([{
                user_auth_id: userId,
                user_email: userEmail,
                resource_type,
                resource_id,
                payment_id,
                order_id,
                amount_paid
            }])
            .select()
            .single();

        if (error) {
            logger.error('Error creating premium access:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(data);
    } catch (err: any) {
        logger.error('Server error creating premium access:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// Get user's all premium access
// ============================================
export const getUserPremiumAccessController = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const userId = user.auth_user_id || user.id;
        const { resource_type } = req.query;

        let query = supabase
            .from('user_premium_access')
            .select('*')
            .eq('user_auth_id', userId)
            .order('purchased_at', { ascending: false });

        if (resource_type) {
            query = query.eq('resource_type', resource_type);
        }

        const { data, error } = await query;

        if (error) {
            logger.error('Error fetching user premium access:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
    } catch (err: any) {
        logger.error('Server error fetching user premium access:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// ADMIN: Get all premium access records
// ============================================
export const getAllPremiumAccessController = async (req: Request, res: Response) => {
    try {
        const { resource_type, page = 1, limit = 20 } = req.query;

        let query = supabase
            .from('user_premium_access')
            .select('*', { count: 'exact' })
            .order('purchased_at', { ascending: false })
            .range((Number(page) - 1) * Number(limit), Number(page) * Number(limit) - 1);

        if (resource_type) {
            query = query.eq('resource_type', resource_type);
        }

        const { data, error, count } = await query;

        if (error) {
            logger.error('Error fetching all premium access:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({
            data,
            total: count,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (err: any) {
        logger.error('Server error fetching all premium access:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// Get unique categories for filtering
// ============================================
export const getCategoriesController = async (req: Request, res: Response) => {
    try {
        const { data: examCategories } = await supabase
            .from('special_exams')
            .select('category')
            .not('category', 'is', null);

        const { data: pyqCategories } = await supabase
            .from('pyq_pdfs')
            .select('category')
            .not('category', 'is', null);

        const allCategories = new Set([
            ...(examCategories || []).map(e => e.category),
            ...(pyqCategories || []).map(p => p.category)
        ]);

        return res.status(200).json(Array.from(allCategories).filter(Boolean));
    } catch (err: any) {
        logger.error('Server error fetching categories:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
