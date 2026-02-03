import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import env from '../config/env';
import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';
import { savePlanPurchase } from '../services/supabase.service';

// Initialize Razorpay
// Initialize Razorpay
// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay Order
 */
export const createOrderController = async (req: Request, res: Response) => {
    try {
        console.log('[PAYMENT] Create Order Request Received');
        const { amount, planId, receipt } = req.body;

        // Validation
        if (!amount) {
            return res.status(400).json({ success: false, error: 'Amount is required' });
        }

        const amountNum = parseAmount(amount);
        if (amountNum < 1) { // Min 1 INR
            return res.status(400).json({ success: false, error: 'Amount must be at least ₹1' });
        }

        // Construct receipt - Script logic
        const safeReceipt = (receipt || `receipt_${Date.now()}`).substring(0, 40);

        // Construct Notes - Fail-safe
        const notes: any = {
            type: planId ? 'plan' : 'subject',
            planId: planId ? String(planId) : 'individual'
        };

        const options = {
            amount: amountNum * 100, // paise
            currency: 'INR',
            receipt: safeReceipt,
            notes: notes
        };

        console.log('[PAYMENT] Creating order with options:', JSON.stringify(options));

        const order = await razorpay.orders.create(options);

        console.log(`[PAYMENT] Order created successfully: ${order.id}`);

        return res.status(200).json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
            },
            id: order.id,
            amount: order.amount,
            currency: order.currency
        });

    } catch (error: any) {
        console.error('[PAYMENT] Controller Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to create order',
            details: error.error || error
        });
    }
};

function parseAmount(val: any): number {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val);
    return 0;
}

/**
 * Verify Payment and Save Purchase
 */
export const verifyPaymentController = async (req: Request, res: Response) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            planId,
            planName,
            pricePaid,
            examIds,
            validityDays,
            // For single resource purchases (PYQ/Special Exam)
            resource_type,
            resource_id,
            amount_paid
        } = req.body;

        // REAL VERIFICATION LOGIC
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                error: 'Missing payment verification parameters',
            });
        }

        // Verify signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            logger.error('[PAYMENT] Invalid signature');
            return res.status(400).json({
                success: false,
                error: 'Invalid payment signature',
            });
        }


        /*
        // --- SIMULATION MODE START ---
        logger.info(`[PAYMENT SIMULATION] Verifying mock payment: ${razorpay_payment_id}`);
        // --- SIMULATION MODE END ---
        */

        // Ensure examIds is an array
        const normalizedExamIds = Array.isArray(examIds) ? examIds : (examIds ? [examIds] : []);
        logger.info(`[PAYMENT] Purchase Request:`, { planId, resource_type, resource_id, amount: pricePaid || amount_paid });

        // Get student from authenticated user
        const authUserId = (req as any).user?.auth_user_id;
        const studentPhone = (req as any).user?.phone;
        const studentName = (req as any).user?.name;

        if (!authUserId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }

        // Calculate expiry date
        const expiresAt = validityDays
            ? new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString()
            : undefined;

        let data, error;

        // Handle different purchase types
        if (planId) {
            // 1. Plan Purchase (Multiple exams) -> user_plans
            // Use the service function which handles student name lookup etc.
            const result = await savePlanPurchase({
                student_phone: studentPhone,
                student_name: studentName,
                plan_id: planId,
                plan_name: planName,
                price_paid: pricePaid || amount_paid,
                exam_ids: normalizedExamIds,
                expires_at: expiresAt
            });
            data = result;
            if (!result) error = { message: 'Failed to save plan purchase' };
        } else {
            // 2. Single Resource Purchase (Subject/Special Exam) -> student_purchases
            // Insert directly into student_purchases table
            const { data: purchaseData, error: purchaseError } = await supabaseAdmin
                .from('student_purchases')
                .insert([{
                    student_phone: studentPhone,
                    subject_id: resource_id || normalizedExamIds[0], // Fallback to first exam ID if resource_id missing
                    payment_id: razorpay_payment_id,
                    amount_paid: amount_paid || pricePaid,
                    expires_at: expiresAt,
                    is_active: true
                }])
                .select()
                .single();

            data = purchaseData;
            error = purchaseError;
        }

        if (error || !data) {
            logger.error('[PAYMENT] Database Save Error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to save purchase record',
            });
        }

        logger.info(`[PAYMENT] Purchase saved for ${studentPhone}: ${planName || 'Subject Purchase'}`);

        return res.status(200).json({
            success: true,
            message: 'Payment verified and purchase saved successfully',
            purchase: data,
        });
    } catch (error: any) {
        logger.error('[PAYMENT] Verification error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Payment verification failed',
        });
    }
};
