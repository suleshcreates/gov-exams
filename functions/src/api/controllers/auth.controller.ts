import { Response } from 'express';
import { signup, login } from '../services/auth.service';
import { verifyToken, generateAccessToken } from '../utils/jwt';
import {
    findSession,
    updateSessionUsage,
    deleteSession,
    deleteAllUserSessions,
} from '../services/session.service';
import logger from '../utils/logger';
import { AuthRequest, SignupRequest, LoginRequest } from '../types';
import crypto from 'crypto';

/**
 * Hash refresh token for storage/comparison
 */
function hashRefreshToken(refreshToken: string): string {
    return crypto.createHash('sha256').update(refreshToken).digest('hex');
}

/**
 * POST /api/auth/signup
 */
export async function signupController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const signupData: SignupRequest = req.body;
        const userAgent = req.get('user-agent');
        const ipAddress = req.ip;

        const result = await signup(signupData, userAgent, ipAddress);

        if (!result.success) {
            res.status(400).json(result);
            return;
        }

        res.status(201).json(result);
    } catch (error: any) {
        logger.error('Signup controller error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred during signup',
        });
    }
}

/**
 * POST /api/auth/login
 */
export async function loginController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const loginData: LoginRequest = req.body;
        const userAgent = req.get('user-agent');
        const ipAddress = req.ip;

        const result = await login(loginData, userAgent, ipAddress);

        if (!result.success) {
            res.status(401).json(result);
            return;
        }

        res.status(200).json(result);
    } catch (error: any) {
        logger.error('Login controller error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred during login',
        });
    }
}

/**
 * POST /api/auth/refresh
 */
export async function refreshController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            res.status(400).json({
                success: false,
                error: 'Refresh token is required',
            });
            return;
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = verifyToken(refresh_token);
        } catch (error: any) {
            res.status(401).json({
                success: false,
                error: 'Invalid or expired refresh token',
            });
            return;
        }

        // Validate token type
        if (decoded.type !== 'refresh') {
            res.status(401).json({
                success: false,
                error: 'Invalid token type',
            });
            return;
        }

        // Check if session exists
        const refreshTokenHash = hashRefreshToken(refresh_token);
        const session = await findSession(refreshTokenHash);

        if (!session) {
            res.status(401).json({
                success: false,
                error: 'Session not found',
            });
            return;
        }

        // Check if session expired
        if (new Date(session.expires_at) < new Date()) {
            res.status(401).json({
                success: false,
                error: 'Session expired',
            });
            return;
        }

        // Update session last used timestamp
        await updateSessionUsage(session.id);

        // Generate new access token
        const newAccessToken = generateAccessToken(decoded.userId, decoded.email);

        res.status(200).json({
            success: true,
            access_token: newAccessToken,
            expires_in: 900, // 15 minutes
        });
    } catch (error: any) {
        logger.error('Refresh controller error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred during token refresh',
        });
    }
}

/**
 * POST /api/auth/logout
 */
export async function logoutController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            res.status(400).json({
                success: false,
                error: 'Refresh token is required',
            });
            return;
        }

        const refreshTokenHash = hashRefreshToken(refresh_token);
        const session = await findSession(refreshTokenHash);

        if (session) {
            await deleteSession(session.id);
        }

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error: any) {
        logger.error('Logout controller error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred during logout',
        });
    }
}

/**
 * POST /api/auth/logout-all
 */
export async function logoutAllController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
            return;
        }

        await deleteAllUserSessions(req.user.auth_user_id);

        res.status(200).json({
            success: true,
            message: 'Logged out from all devices',
        });
    } catch (error: any) {
        logger.error('Logout all controller error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred during logout',
        });
    }
}

/**
 * POST /api/auth/admin/login
 * Admin login endpoint
 */
export async function adminLoginController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Email and password are required',
            });
            return;
        }

        const userAgent = req.get('user-agent');
        const ipAddress = req.ip;

        const { adminLogin } = await import('../services/admin.service');
        const result = await adminLogin(email, password, userAgent, ipAddress);

        if (!result.success) {
            res.status(401).json(result);
            return;
        }

        res.status(200).json(result);
    } catch (error: any) {
        logger.error('Admin login controller error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred during admin login',
        });
    }
}

/**
 * POST /api/auth/reset-password
 * Reset user password
 */
export async function resetPasswordController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            res.status(400).json({
                success: false,
                error: 'Email and new password are required',
            });
            return;
        }

        // Import hashPassword utility and supabase admin client
        const { hashPassword } = await import('../utils/password');
        const { supabaseAdmin } = await import('../config/supabase');

        // Hash the new password
        const password_hash = await hashPassword(newPassword);

        // Update student's password
        const { error } = await supabaseAdmin
            .from('students')
            .update({ password_hash })
            .eq('email', email);

        if (error) {
            logger.error('Password reset error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to reset password',
            });
            return;
        }

        logger.info(`Password reset successful for: ${email}`);

        res.json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error: any) {
        logger.error('Reset password controller error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred during password reset',
        });
    }
}

/**
 * POST /api/auth/forgot-password
 * Verify email exists and send OTP for password reset
 */
export async function forgotPasswordController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({
                success: false,
                error: 'Email is required',
            });
            return;
        }

        // Import supabase admin client and otp service
        const { supabaseAdmin } = await import('../config/supabase');
        const otpService = await import('../services/otp.service');

        // Check if email exists (using admin client to bypass RLS)
        const { data: student, error } = await supabaseAdmin
            .from('students')
            .select('email, name')
            .eq('email', email.toLowerCase())
            .maybeSingle();

        if (error || !student) {
            logger.warn(`Forgot password attempt for non-existent email: ${email}`);
            res.status(404).json({
                success: false,
                error: 'No account found with this email address',
            });
            return;
        }

        // Generate OTP
        const otp = otpService.default.generateOTP();

        // Store OTP in database for verification
        await otpService.default.storeOTPForSignup(email, otp, student.name);

        // Send OTP email
        await otpService.default.sendOTPEmail(email, student.name, otp);

        logger.info(`Password reset OTP sent to: ${email}`);

        res.json({
            success: true,
            name: student.name,
            message: 'Verification code sent to your email',
            // OTP is NOT sent in response for security
            // User must retrieve it from their email only
        });
    } catch (error: any) {
        logger.error('Forgot password controller error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred while processing your request',
        });
    }
}

/**
 * POST /api/auth/verify-reset-otp
 * Verify OTP for password reset
 */
export async function verifyResetOTPController(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            res.status(400).json({
                success: false,
                error: 'Email and OTP are required',
            });
            return;
        }

        // Import OTP service to verify
        const otpService = await import('../services/otp.service');

        // Verify OTP from database using password reset verification
        const verification = await otpService.default.verifyPasswordResetOTP(email, otp);

        if (!verification.valid) {
            res.status(400).json({
                success: false,
                error: verification.message,
            });
            return;
        }

        logger.info(`Password reset OTP verified for: ${email}`);

        res.json({
            success: true,
            message: 'OTP verified successfully',
        });
    } catch (error: any) {
        logger.error('Verify reset OTP controller error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred during OTP verification',
        });
    }
}

export default {
    signupController,
    loginController,
    adminLoginController,
    refreshController,
    logoutController,
    logoutAllController,
    resetPasswordController,
    forgotPasswordController,
    verifyResetOTPController,
};
