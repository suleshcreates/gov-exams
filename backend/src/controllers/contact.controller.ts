import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../config/supabase';
import logger from '../utils/logger';
import env from '../config/env';
import https from 'https';
import dns from 'dns';

// ============================================
// PUBLIC: Submit a contact message
// ============================================
export const submitContactController = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'Name, email, subject, and message are required' });
        }

        const { data, error } = await supabase
            .from('contact_messages')
            .insert([{ name, email, phone, subject, message, status: 'new' }])
            .select()
            .single();

        if (error) {
            logger.error('Error saving contact message:', error);
            return res.status(500).json({ error: 'Failed to submit message' });
        }

        return res.status(201).json({ success: true, message: 'Message sent successfully', data });
    } catch (err: any) {
        logger.error('Error in submitContactController:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// ADMIN: Get all contact messages
// ============================================
export const getContactMessagesController = async (req: Request, res: Response) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        let query = supabase
            .from('contact_messages')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range((Number(page) - 1) * Number(limit), Number(page) * Number(limit) - 1);

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        const { data, error, count } = await query;

        if (error) {
            logger.error('Error fetching contact messages:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({
            data: data || [],
            total: count || 0,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil((count || 0) / Number(limit))
        });
    } catch (err: any) {
        logger.error('Error in getContactMessagesController:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// ADMIN: Reply to a contact message (sends email)
// ============================================
export const replyContactMessageController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;

        if (!reply) {
            return res.status(400).json({ error: 'Reply text is required' });
        }

        // Get the original message
        const { data: message, error: fetchError } = await supabase
            .from('contact_messages')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Update the message with the reply
        const { error: updateError } = await supabase
            .from('contact_messages')
            .update({
                admin_reply: reply,
                status: 'replied',
                replied_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) {
            logger.error('Error updating contact message:', updateError);
            return res.status(500).json({ error: 'Failed to save reply' });
        }

        // Send the reply via EmailJS
        try {
            await sendReplyEmail(message.email, message.name, message.subject, reply);
            logger.info(`[Contact] Reply sent to ${message.email} for message: ${message.subject}`);
        } catch (emailError) {
            logger.error('[Contact] Failed to send reply email:', emailError);
            // Don't fail the request if email fails — reply is still saved
        }

        return res.status(200).json({ success: true, message: 'Reply sent successfully' });
    } catch (err: any) {
        logger.error('Error in replyContactMessageController:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// ADMIN: Update message status
// ============================================
export const updateMessageStatusController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['new', 'read', 'replied', 'closed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const { error } = await supabase
            .from('contact_messages')
            .update({ status })
            .eq('id', id);

        if (error) {
            logger.error('Error updating message status:', error);
            return res.status(500).json({ error: 'Failed to update status' });
        }

        return res.status(200).json({ success: true });
    } catch (err: any) {
        logger.error('Error in updateMessageStatusController:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================================
// Helper: Send reply email via EmailJS
// ============================================
async function sendReplyEmail(toEmail: string, userName: string, subject: string, replyText: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            service_id: env.EMAILJS_SERVICE_ID,
            template_id: env.EMAILJS_REPLY_TEMPLATE_ID || env.EMAILJS_TEMPLATE_ID,
            user_id: env.EMAILJS_PUBLIC_KEY,
            accessToken: env.EMAILJS_PRIVATE_KEY,
            template_params: {
                to_email: toEmail,
                to_name: userName,
                from_name: 'GovExams Support',
                subject: `Re: ${subject}`,
                message: replyText
            }
        });

        const hostname = 'api.emailjs.com';

        dns.lookup(hostname, { family: 4 }, (dnsError, targetIp) => {
            if (dnsError) {
                logger.error('[Contact Email] DNS Resolution Failed:', dnsError);
                return reject(dnsError);
            }

            const options: https.RequestOptions = {
                hostname: targetIp,
                port: 443,
                path: '/api/v1.0/email/send',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload),
                    'Host': hostname,
                    'origin': 'https://govexams.info'
                }
            };

            const request = https.request(options, (response) => {
                let responseData = '';
                response.on('data', (chunk) => { responseData += chunk; });
                response.on('end', () => {
                    if (response.statusCode === 200) {
                        logger.info(`[Contact Email] Reply sent to ${toEmail}`);
                        resolve();
                    } else {
                        logger.error(`[Contact Email] Failed. Status: ${response.statusCode}, Response: ${responseData}`);
                        reject(new Error(`EmailJS returned ${response.statusCode}`));
                    }
                });
            });

            request.on('error', (error) => {
                logger.error('[Contact Email] Request error:', error);
                reject(error);
            });

            request.write(payload);
            request.end();
        });
    });
}
