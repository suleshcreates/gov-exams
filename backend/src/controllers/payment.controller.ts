import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import env from '../config/env';
import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';

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
        const { amount, planId, receipt } = req.body;

        logger.info('[PAYMENT] createOrder request:', { amount, planId, receipt, notes: req.body.notes });

        if (!amount) {
            return res.status(400).json({
                success: false,
                error: 'Amount is required',
            });
        }

        // REAL RAZORPAY LOGIC
        // Ensure notes values are strings (Razorpay requirement)
        const notesObj = req.body.notes || { planId: planId || '' };
        const sanitizedNotes: Record<string, string> = {};
        Object.keys(notesObj).forEach(key => {
            sanitizedNotes[key] = String(notesObj[key]);
        });

        // Create Razorpay order
        // Receipt has max 40 chars limit
        const rawReceipt = receipt || `receipt_${Date.now()}`;
        const safeReceipt = rawReceipt.substring(0, 40);

        const options = {
            amount: Math.round(parseFloat(amount) * 100), // Amount in paise
            currency: 'INR',
            receipt: safeReceipt,
            notes: sanitizedNotes,
        };

        const order = await razorpay.orders.create(options);

        logger.info(`[PAYMENT] Order created: ${order.id} for plan: ${planId}`);

        return res.status(200).json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
            },
            id: order.id, // Frontend expects top-level id as well sometimes
            amount: order.amount,
            currency: order.currency
        });

    } catch (error: any) {
        logger.error('[PAYMENT] Error creating order:', error);
        // Return full error details for debugging
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to create order',
            details: error
        });
    }
};

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
            : null;

        // Handle differnet purchase types
        // 1. Plan Purchase (Multiple exams) -> user_plans
        // 2. Single Resource Purchase (PYQ/Special Exam) -> user_premium_access (or user_plans with specific type?)

        // IMPORTANT: The system seems to use 'user_plans' for PLANS and 'user_premium_access' (or similar logic) for individual items?
        // Checking schema via previous context...
        // Actually, previous context showed 'user_plans' saving.
        // Let's stick to saving to 'user_plans' for plans, but for single items we might need to check if we have a table for that 
        // OR simply reuse user_plans with a different structure?
        // Wait, 'premiumAccess.controller.ts' handles single item purchases usually?
        // 'verifyPaymentController' here seems to be designed for PLANS primarily based on 'planId' param.
        // BUT, SpecialExamDetail calls '/api/student/premium-access/purchase' which maps to 'premiumAccess.controller.ts'.
        // THIS controller is '/api/payments/verify' which is used by PaymentModal (Plans).

        // SO THIS FILE IS ONLY FOR PLANS.
        // Special Exmas use 'premiumAccess.controller.ts'.

        // Save purchase to user_plans table
        const { data, error } = await supabaseAdmin
            .from('user_plans')
            .insert({
                auth_user_id: authUserId,
                plan_template_id: planId,
                student_phone: studentPhone,
                student_name: studentName,
                plan_id: planId,
                plan_name: planName,
                original_price: pricePaid,
                price_paid: pricePaid,
                discount_amount: 0,
                exam_ids: normalizedExamIds,
                purchased_at: new Date().toISOString(),
                expires_at: expiresAt,
                is_active: true,
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id,
                payment_signature: razorpay_signature,
                payment_status: 'completed',
            });

        if (error) {
            logger.error('[PAYMENT] Database error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to save purchase',
            });
        }

        logger.info(`[PAYMENT] Purchase saved for ${studentPhone}: ${planName}`);

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
