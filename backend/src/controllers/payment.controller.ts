import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import env from '../config/env';
import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';

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

        if (!amount || !planId) {
            return res.status(400).json({
                success: false,
                error: 'Amount and plan ID are required',
            });
        }

        // Create Razorpay order
        const options = {
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            receipt: receipt || `receipt_${Date.now()}`,
            notes: {
                planId,
            },
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
        });
    } catch (error: any) {
        logger.error('[PAYMENT] Error creating order:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to create order',
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
            validityDays,
        } = req.body;

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
