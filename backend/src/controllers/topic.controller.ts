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
import fs from 'fs';

// ...

/**
 * Upload Video (Admin Only)
 */
export const uploadVideoController = async (req: Request, res: Response) => {
    try {
        if (!(req as any).file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = (req as any).file;
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            // Read stream from disk (better for large files)
            const fileStream = fs.createReadStream(file.path);

            // Upload to Supabase Storage
            const { error } = await supabase.storage
                .from('topic-videos')
                .upload(filePath, fileStream, {
                    contentType: file.mimetype,
                    upsert: false,
                    duplex: 'half'
                });

            if (error) throw error;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('topic-videos')
                .getPublicUrl(filePath);

            return res.status(200).json({
                success: true,
                publicUrl: publicUrl
            });
        } finally {
            // Cleanup temp file
            if (file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        }

    } catch (error: any) {
        console.error('Error uploading video:', error);
        return res.status(500).json({ error: error.message || 'Failed to upload video' });
    }
};

/**
 * Upload Topic PDF (Admin Only)
 */
export const uploadTopicPDFController = async (req: Request, res: Response) => {
    try {
        if (!(req as any).file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = (req as any).file;
        const fileExt = file.originalname.split('.').pop();

        // Validate PDF by mimetype (Multer already checks, but double check)
        if (file.mimetype !== 'application/pdf') {
            // Cleanup if rejected
            if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
            return res.status(400).json({ error: 'File must be a PDF' });
        }

        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const fileStream = fs.createReadStream(file.path);

            // Upload to Supabase Storage
            const { error } = await supabase.storage
                .from('topic-pdfs')
                .upload(filePath, fileStream, {
                    contentType: file.mimetype,
                    upsert: false,
                    duplex: 'half'
                });

            if (error) throw error;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('topic-pdfs')
                .getPublicUrl(filePath);

            return res.status(200).json({
                success: true,
                publicUrl: publicUrl
            });
        } finally {
            // Cleanup temp file
            if (file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        }

    } catch (error: any) {
        console.error('Error uploading PDF:', error);
        return res.status(500).json({ error: error.message || 'Failed to upload PDF' });
    }
};

// Create Topic (Admin Only)
export const createTopicController = async (req: Request, res: Response) => {
    try {
        const { subject_id, title, description, video_url, video_duration, order_index, pdf_url } = req.body;

        const { data, error } = await supabase
            .from('topics')
            .insert([
                { subject_id, title, description, video_url, video_duration, order_index, pdf_url }
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

// Get Topic PDF (Signed URL approach like PYQ)
export const getTopicPDFController = async (req: Request, res: Response) => {
    try {
        const { topicId } = req.params;
        console.log(`[SignedURL] Requesting PDF for topic: ${topicId}`);

        // Get topic details to find the file path
        const { data: topic, error: topicError } = await supabase
            .from('topics')
            .select('pdf_url')
            .eq('id', topicId)
            .single();

        if (topicError || !topic || !topic.pdf_url) {
            return res.status(404).json({ error: 'PDF not found' });
        }

        // Extract filename from public URL
        const fileName = topic.pdf_url.split('/').pop();

        if (!fileName) {
            return res.status(500).json({ error: 'Invalid file path' });
        }

        // Generate signed URL
        const { data: signedData, error: signedError } = await supabase.storage
            .from('topic-pdfs')
            .createSignedUrl(fileName, 3600); // 1 hour access

        if (signedError) {
            console.error('Error creating signed URL:', signedError);
            return res.status(500).json({ error: 'Failed to generate secure link' });
        }

        return res.status(200).json({
            downloadUrl: signedData.signedUrl
        });

    } catch (err: any) {
        console.error('Server error getting topic PDF:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
// Get Questions for a Question Set (Student)
export const getStudentQuestionsController = async (req: Request, res: Response) => {
    try {
        const { setId } = req.params;

        // Fetch questions
        const { data: questions, error } = await supabase
            .from('questions')
            .select('*')
            .eq('question_set_id', setId)
            .order('order_index', { ascending: true });

        if (error) {
            console.error('Error fetching questions:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(questions || []);
    } catch (err: any) {
        console.error('Server error fetching questions:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Submit Exam Result (Regular Topic Exam)
export const submitStudentExamResultController = async (req: Request, res: Response) => {
    try {
        const { setId } = req.params;
        const { score, total_questions, accuracy, time_taken_seconds, exam_title, set_number, user_answers, exam_id } = req.body;

        const user = (req as any).user;
        const userName = user.name || user.email;
        const userPhone = user.phone;

        // Calculate time string (e.g. "5 min") for compatibility
        const timeTakenStr = `${Math.ceil((time_taken_seconds || 0) / 60)} min`;

        // Insert result
        // Note: exam_results table uses student_phone as key, not student_id
        const { data, error } = await supabase
            .from('exam_results')
            .insert([{
                student_phone: userPhone,
                student_name: userName,
                exam_id: exam_id || setId,
                set_id: setId,
                exam_title: exam_title || 'Topic Exam',
                set_number: set_number || 1,
                score,
                total_questions,
                accuracy,
                time_taken: timeTakenStr,
                user_answers: user_answers || [],
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error('Error saving exam result:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(data);
    } catch (err: any) {
        console.error('Server error submitting result:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Get Question Set Details (Student)
export const getStudentQuestionSetDetailsController = async (req: Request, res: Response) => {
    try {
        const { setId } = req.params;
        const user = (req as any).user;
        const userPhone = user.phone; // Assuming phone is the key for exam_results

        const { data: setDetails, error } = await supabase
            .from('question_sets')
            .select('*, subjects(name)')
            .eq('id', setId)
            .single();

        if (error) {
            console.error('Error fetching question set details:', error);
            return res.status(500).json({ error: error.message });
        }

        // Check if submitted
        const { data: submission } = await supabase
            .from('exam_results')
            .select('id')
            .eq('set_id', setId)
            .eq('student_phone', userPhone)
            .maybeSingle();

        return res.status(200).json({
            ...setDetails,
            is_submitted: !!submission
        });
    } catch (err: any) {
        console.error('Server error fetching set details:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Get Student Exam History
export const getStudentExamHistoryController = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const userPhone = user.phone;
        const userId = user.auth_user_id || user.id;

        try {
            fs.appendFileSync('history_debug.log', `[${new Date().toISOString()}] Start History Fetch. User: ${userPhone}, ID: ${userId}\n`);
        } catch (e) { }

        // 1. Fetch Regular Exam Results
        const { data: regularHistory, error: regularError } = await supabase
            .from('exam_results')
            .select('*')
            .eq('student_phone', userPhone)
            .order('created_at', { ascending: false });

        if (regularError) {
            console.error('Error fetching regular exam history:', regularError);
            // Don't fail completely, just log
        }

        // 2. Fetch Special Exam Results
        // [MODIFIED] User requested to separate history. Special exams are now only visible on their specific detail pages.
        // We no longer merge them here.

        /*
        let specialHistory: any[] = [];
        try {
            // ... (Removed special exam fetch)
        } catch (e) {
            console.error('[History] Unexpected error fetching special results:', e);
        }
        */

        // 3. Normalize and Combine
        // Only return regular history now
        const combinedHistory = [
            ...(regularHistory || [])
        ];

        // 4. Sort by Date (Descending)
        combinedHistory.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return res.status(200).json(combinedHistory);
    } catch (err: any) {
        console.error('Server error fetching history:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Get Single Exam Result (Student)
// Get Single Exam Result (Student)
export const getStudentExamResultDetailController = async (req: Request, res: Response) => {
    try {
        const { resultId } = req.params;
        const user = (req as any).user;
        const userPhone = user.phone;
        const userId = user.auth_user_id || user.id;

        // 1. Try fetching from regular exam_results
        const { data: result, error } = await supabase
            .from('exam_results')
            .select('*')
            .eq('id', resultId)
            .single();

        if (!error && result) {
            // Verify ownership
            if (result.student_phone !== userPhone) {
                return res.status(403).json({ error: 'Unauthorized access to this result' });
            }
            return res.status(200).json(result);
        }

        // 2. Fallback: Try fetching from special_exam_results
        console.log(`[Debug] Checking special_exam_results for ID: ${resultId}`);
        const { data: specialResult, error: specialError } = await supabase
            .from('special_exam_results')
            .select(`
                *,
                special_exam:special_exams(title)
            `)
            .eq('id', resultId)
            .single();

        if (specialError || !specialResult) {
            console.log('[Debug] Special exam fetch error/empty:', specialError);
            // Only log if it's a real error, not just 'not found'
            if (specialError && specialError.code !== 'PGRST116') {
                console.error('Error fetching special exam result:', specialError);
            }
            return res.status(404).json({ error: 'Result not found' });
        }

        console.log(`[Debug] Found special result. ExamID: ${specialResult.special_exam_id}, Set#: ${specialResult.set_number}`);

        // Verify ownership for special result
        if (specialResult.user_auth_id && specialResult.user_auth_id !== userId) {
            // Fallback to email check if auth_id mismatch (legacy support)
            if (specialResult.user_email !== userPhone) {
                return res.status(403).json({ error: 'Unauthorized access to this result' });
            }
        }

        // 2.5 Manually fetch the question_set_id from special_exam_sets
        const { data: setInfo } = await supabase
            .from('special_exam_sets')
            .select('question_set_id')
            .eq('special_exam_id', specialResult.special_exam_id)
            .eq('set_number', specialResult.set_number)
            .single();

        // 3. Normalize Special Result to match ExamResult interface
        // This ensures the frontend ExamReview page works without modification
        const normalizedResult = {
            id: specialResult.id,
            exam_id: specialResult.special_exam_id,
            set_id: setInfo?.question_set_id || null,
            exam_title: specialResult.special_exam?.title || 'Special Exam',
            set_number: specialResult.set_number,
            score: specialResult.score,
            total_questions: specialResult.total_questions,
            accuracy: specialResult.accuracy,
            time_taken: `${Math.ceil((specialResult.time_taken_seconds || 0) / 60)} min`,
            user_answers: specialResult.user_answers,
            created_at: specialResult.created_at,
            student_phone: specialResult.user_email // Map email to phone field for ownership check in frontend
        };

        return res.status(200).json(normalizedResult);

    } catch (err: any) {
        console.error('Server error fetching exam result:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ==========================================
// Topic Materials (Multiple Videos/PDFs)
// ==========================================

export const getTopicMaterialsController = async (req: Request, res: Response) => {
    try {
        const { topicId } = req.params;
        const { data, error } = await supabase
            .from('topic_materials')
            .select('*')
            .eq('topic_id', topicId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching topic materials:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data || []);
    } catch (err: any) {
        console.error('Server error fetching materials:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const createTopicMaterialController = async (req: Request, res: Response) => {
    try {
        const { topic_id, type, title, url, order_index } = req.body;

        const { data, error } = await supabase
            .from('topic_materials')
            .insert([{ topic_id, type, title, url, order_index }])
            .select()
            .single();

        if (error) {
            console.error('Error creating topic material:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(data);
    } catch (err: any) {
        console.error('Server error creating material:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteTopicMaterialController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('topic_materials')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting topic material:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ message: 'Material deleted' });
    } catch (err: any) {
        console.error('Server error deleting material:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Generate Signed Upload URL for direct-to-storage uploads
 */
export const generateUploadUrlController = async (req: Request, res: Response) => {
    try {
        const { bucket, fileName } = req.body;

        if (!bucket || !fileName) {
            return res.status(400).json({ error: 'Bucket and fileName are required' });
        }

        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUploadUrl(fileName);

        if (error) {
            console.error('Error creating signed upload URL:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({
            signedUrl: data.signedUrl,
            token: data.token,
            path: fileName
        });
    } catch (err: any) {
        console.error('Server error generating upload URL:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
