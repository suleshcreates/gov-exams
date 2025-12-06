import { Response } from 'express';
import { generateOTP, storeOTPForSignup, sendOTPEmail, verifyOTP, clearOTP } from '../services/otp.service';
import { signup } from '../services/auth.service';
import logger from '../utils/logger';
import { AuthRequest } from '../types';

/**
 * POST /api/auth/request-otp
 * Send OTP to email for verification
 */
export async function requestOTPController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const { email, name } = req.body;

        if (!email || !name) {
            res.status(400).json({
                success: false,
                error: 'Email and name are required',
            });
            return;
        }

        // Generate OTP
        const otp = generateOTP();

        // Store in students table
        const stored = await storeOTPForSignup(email, otp, name);

        if (!stored) {
            res.status(500).json({
                success: false,
                error: 'Failed to generate OTP. Please try again.',
            });
            return;
        }

        // Send email
        const sent = await sendOTPEmail(email, name, otp);

        if (!sent) {
            res.status(500).json({
                success: false,
                error: 'Failed to send OTP email. Please try again.',
            });
            return;
        }

        logger.info(`OTP sent to ${email}`);

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email. Please check your inbox.',
        });
    } catch (error: any) {
        logger.error('Request OTP controller error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred sending OTP',
        });
    }
}

/**
 * POST /api/auth/verify-otp-and-signup
 * Verify OTP and complete signup
 */
export async function verifyOTPAndSignupController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        logger.info('[OTP CONTROLLER] Request body received:', JSON.stringify(req.body, null, 2));

        const { email, otp, signupData } = req.body;

        logger.info(`[OTP CONTROLLER] Extracted: email=${email}, otp=${otp}, hasSignupData=${!!signupData}`);

        if (!email || !otp || !signupData) {
            logger.warn('[OTP CONTROLLER] Missing required fields');
            res.status(400).json({
                success: false,
                error: 'Email, OTP, and signup data are required',
            });
            return;
        }

        // Verify OTP
        logger.info(`[OTP CONTROLLER] Calling verifyOTP for: ${email}`);
        const verification = await verifyOTP(email, otp);

        logger.info(`[OTP CONTROLLER] Verification result:`, verification);

        if (!verification.valid) {
            logger.warn(`[OTP CONTROLLER] Verification failed: ${verification.message}`);
            res.status(400).json({
                success: false,
                error: verification.message,
            });
            return;
        }

        // OTP verified - clear it
        await clearOTP(email);

        // Proceed with signup
        const userAgent = req.get('user-agent');
        const ipAddress = req.ip;

        logger.info(`[OTP CONTROLLER] Proceeding with signup for: ${email}`);
        const result = await signup(signupData, userAgent, ipAddress);

        if (!result.success) {
            logger.error(`[OTP CONTROLLER] Signup failed:`, result);
            res.status(400).json(result);
            return;
        }

        logger.info(`[OTP CONTROLLER] Signup successful for: ${email}`);
        // Success - return auth tokens
        res.status(201).json(result);
    } catch (error: any) {
        logger.error('Verify OTP and signup controller error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred during signup',
        });
    }
}

export default {
    requestOTPController,
    verifyOTPAndSignupController,
};
