import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../config/supabase';

// Get Topics by Subject
export const getTopicsBySubjectController = async (req: Request, res: Response) => {
    try {
        const { subjectId } = req.params;
        const { data, error } = await supabase
            .from('topics')
            .select('*')
            .eq('subject_id', subjectId)
            .order('order_index', { ascending: true });

        if (error) {
            console.error('Error fetching topics:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
    } catch (err: any) {
        console.error('Server error fetching topics:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Upload Video (Admin Only)
 */
export const uploadVideoController = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('topic-videos')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            throw error;
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('topic-videos')
            .getPublicUrl(filePath);

        return res.status(200).json({
            success: true,
            publicUrl: publicUrl
        });

    } catch (error: any) {
        console.error('Error uploading video:', error);
        return res.status(500).json({ error: error.message || 'Failed to upload video' });
    }
};

// Create Topic (Admin Only)
export const createTopicController = async (req: Request, res: Response) => {
    try {
        const { subject_id, title, description, video_url, video_duration, order_index } = req.body;

        const { data, error } = await supabase
            .from('topics')
            .insert([
                { subject_id, title, description, video_url, video_duration, order_index }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating topic:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(data);
    } catch (err: any) {
        console.error('Server error creating topic:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Update Topic (Admin Only)
export const updateTopicController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('topics')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating topic:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
    } catch (err: any) {
        console.error('Server error updating topic:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete Topic (Admin Only)
export const deleteTopicController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('topics')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting topic:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ message: 'Topic deleted successfully' });
    } catch (err: any) {
        console.error('Server error deleting topic:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Get User Topic Progress
export const getTopicProgressController = async (req: Request, res: Response) => {
    try {
        const { topicId } = req.params;
        const user = (req as any).user;
        const userId = user.auth_user_id || user.id; // Support both student (auth_user_id) and admin (id) models

        const { data, error } = await supabase
            .from('user_topic_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('topic_id', topicId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found" - totally fine
            console.error('Error fetching progress:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data || { is_video_completed: false });
    } catch (err: any) {
        console.error('Server error fetching progress:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Mark Video Completed
export const markVideoCompletedController = async (req: Request, res: Response) => {
    try {
        const { topicId } = req.params;
        const user = (req as any).user;
        const userId = user.auth_user_id || user.id;

        // Upsert progress
        const { data, error } = await supabase
            .from('user_topic_progress')
            .upsert({
                user_id: userId,
                topic_id: topicId,
                is_video_completed: true,
                completed_at: new Date().toISOString()
            }, { onConflict: 'user_id,topic_id' })
            .select()
            .single();

        if (error) {
            console.error('Error marking video completed:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
    } catch (err: any) {
        console.error('Server error marking video completed:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
