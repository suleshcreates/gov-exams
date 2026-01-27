import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../config/supabase';
import logger from '../utils/logger';

// ============================================
// PUBLIC: Get all active PYQ PDFs
// ============================================
export const getPYQsController = async (req: Request, res: Response) => {
    try {
        const { category, year } = req.query;

        let query = supabase
            .from('pyq_pdfs')
            .select('*')
            .eq('is_active', true)
            .order('year', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }
        if (year) {
            query = query.eq('year', parseInt(year as string));
        }

        const { data, error } = await query;

        if (error) {
            logger.error('Error fetching PYQs:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
    } catch (err: any) {
        logger.error('Server error fetching PYQs:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// ADMIN: Get all PYQs with Purchase Counts
// ============================================
export const getAdminPYQsController = async (req: Request, res: Response) => {
    try {
        // 1. Fetch all PYQs (active and inactive)
        const { data: pyqs, error: pyqError } = await supabase
            .from('pyq_pdfs')
            .select('*')
            .order('created_at', { ascending: false });

        if (pyqError) {
            logger.error('Error fetching admin PYQs:', pyqError);
            return res.status(500).json({ error: pyqError.message });
        }

        // 2. Fetch purchase counts
        // Since we can't easily do a cross-table join count without FKs or Views, 
        // we'll fetch all PYQ purchases and aggregate.
        // Optimization: For large datasets, use a SQL view or RPC. For now, in-memory is fine.
        const { data: purchases, error: purchaseError } = await supabase
            .from('user_premium_access')
            .select('resource_id')
            .eq('resource_type', 'pyq');

        if (purchaseError) {
            logger.error('Error fetching purchase counts:', purchaseError);
            // Proceed without counts if error (or return error)
        }

        // 3. Aggregate counts
        const purchaseMap: Record<string, number> = {};
        if (purchases) {
            purchases.forEach((p) => {
                purchaseMap[p.resource_id] = (purchaseMap[p.resource_id] || 0) + 1;
            });
        }

        // 4. Merge
        const results = (pyqs || []).map((pyq) => ({
            ...pyq,
            purchase_count: purchaseMap[pyq.id] || 0
        }));

        return res.status(200).json(results);
    } catch (err: any) {
        logger.error('Server error fetching admin PYQs:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// PUBLIC: Get PYQ by ID
// ============================================
export const getPYQByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('pyq_pdfs')
            .select('*')
            .eq('id', id)
            .eq('is_active', true)
            .single();

        if (error) {
            logger.error('Error fetching PYQ:', error);
            return res.status(404).json({ error: 'PYQ not found' });
        }

        return res.status(200).json(data);
    } catch (err: any) {
        logger.error('Server error fetching PYQ:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// ADMIN: Create PYQ PDF
// ============================================
export const createPYQController = async (req: Request, res: Response) => {
    try {
        const { title, description, category, year, price, pdf_url, thumbnail_url, page_count, file_size_mb } = req.body;

        const { data, error } = await supabase
            .from('pyq_pdfs')
            .insert([{
                title,
                description,
                category,
                year,
                price: price || 0,
                pdf_url,
                thumbnail_url,
                page_count,
                file_size_mb
            }])
            .select()
            .single();

        if (error) {
            logger.error('Error creating PYQ:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(data);
    } catch (err: any) {
        logger.error('Server error creating PYQ:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// ADMIN: Update PYQ PDF
// ============================================
export const updatePYQController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('pyq_pdfs')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            logger.error('Error updating PYQ:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
    } catch (err: any) {
        logger.error('Server error updating PYQ:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// ADMIN: Delete PYQ PDF
// ============================================
export const deletePYQController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('pyq_pdfs')
            .delete()
            .eq('id', id);

        if (error) {
            logger.error('Error deleting PYQ:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ message: 'PYQ deleted successfully' });
    } catch (err: any) {
        logger.error('Server error deleting PYQ:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// ADMIN: Upload PYQ PDF file
// ============================================
export const uploadPYQFileController = async (req: Request, res: Response) => {
    try {
        if (!(req as any).file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = (req as any).file;
        const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        logger.info(`Uploading PYQ file: ${fileName}, size: ${file.size}, type: ${file.mimetype}`);

        // First check if bucket exists by trying to list files
        const { error: bucketError } = await supabase.storage
            .from('pyq-pdfs')
            .list('', { limit: 1 });

        if (bucketError) {
            logger.error('Bucket access error - bucket may not exist:', bucketError);
            return res.status(500).json({
                error: 'Storage bucket "pyq-pdfs" not found. Please create it in Supabase Storage.',
                details: bucketError.message
            });
        }

        const { data, error } = await supabase.storage
            .from('pyq-pdfs')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype || 'application/pdf',
                upsert: false
            });

        if (error) {
            logger.error('Error uploading PYQ file:', error);
            return res.status(500).json({
                error: 'Failed to upload file to storage',
                details: error.message
            });
        }

        logger.info(`File uploaded successfully: ${data.path}`);

        const { data: urlData } = supabase.storage
            .from('pyq-pdfs')
            .getPublicUrl(fileName);

        return res.status(200).json({
            publicUrl: urlData.publicUrl,
            path: data.path
        });
    } catch (err: any) {
        logger.error('Server error uploading PYQ file:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

// ============================================
// USER: Check access to PYQ
// ============================================
export const checkPYQAccessController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = (req as any).user;
        const userId = user.auth_user_id || user.id;

        const { data, error } = await supabase
            .from('user_premium_access')
            .select('*')
            .eq('user_auth_id', userId)
            .eq('resource_type', 'pyq')
            .eq('resource_id', id)
            .single();

        if (error && error.code !== 'PGRST116') {
            logger.error('Error checking PYQ access:', error);
            return res.status(500).json({ error: error.message });
        }

        const hasAccess = !!data;
        return res.status(200).json({ hasAccess, accessData: data });
    } catch (err: any) {
        logger.error('Server error checking PYQ access:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// USER: Get PYQ download URL (requires access)
// ============================================
export const getPYQDownloadController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = (req as any).user;
        const userId = user.auth_user_id || user.id;

        // Check access
        const { data: access } = await supabase
            .from('user_premium_access')
            .select('*')
            .eq('user_auth_id', userId)
            .eq('resource_type', 'pyq')
            .eq('resource_id', id)
            .single();

        if (!access) {
            return res.status(403).json({ error: 'Purchase required to download this PYQ' });
        }

        // Get PYQ details
        const { data: pyq, error } = await supabase
            .from('pyq_pdfs')
            .select('pdf_url, title')
            .eq('id', id)
            .single();

        if (error || !pyq) {
            return res.status(404).json({ error: 'PYQ not found' });
        }

        // Extract filename from public URL (assuming it's solely the file name at the end)
        // Public URL format: .../object/public/pyq-pdfs/<filename>
        const fileName = pyq.pdf_url.split('/').pop();

        if (!fileName) {
            return res.status(500).json({ error: 'Invalid file path' });
        }

        // Generate signed URL
        const { data: signedData, error: signedError } = await supabase.storage
            .from('pyq-pdfs')
            .createSignedUrl(fileName, 3600); // 1 hour access

        if (signedError) {
            logger.error('Error creating signed URL:', signedError);
            return res.status(500).json({ error: 'Failed to generate secure link' });
        }

        return res.status(200).json({
            downloadUrl: signedData.signedUrl, // This is now a signed, temporary URL
            title: pyq.title
        });
    } catch (err: any) {
        logger.error('Server error getting PYQ download:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
