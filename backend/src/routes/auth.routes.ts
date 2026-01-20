import { Router } from 'express';
import {
    signupController,
    loginController,
    adminLoginController,
    refreshController,
    logoutController,
    logoutAllController,
    resetPasswordController,
    forgotPasswordController,
    verifyResetOTPController,
} from '../controllers/auth.controller';
import {
    requestOTPController,
    verifyOTPAndSignupController,
} from '../controllers/otp.controller';
import { validateSignup, validateLogin, validateAdminLogin } from '../middlewares/validate.middleware';
import { signupLimiter, loginLimiter } from '../middlewares/rateLimit.middleware';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// OTP routes (for email verification during signup)
router.post('/request-otp', signupLimiter, requestOTPController);
router.post('/verify-otp-signup', signupLimiter, verifyOTPAndSignupController); // No validation - different body structure

// Public routes
router.post('/signup', signupLimiter, validateSignup, signupController); // Keep for backward compatibility
router.post('/login', loginLimiter, validateLogin, loginController);
router.post('/admin/login', loginLimiter, validateAdminLogin, adminLoginController); // Admin login
router.post('/refresh', refreshController);
router.post('/logout', logoutController);
router.post('/forgot-password', forgotPasswordController); // Email verification for password reset
router.post('/verify-reset-otp', verifyResetOTPController); // Verify OTP for password reset
router.post('/reset-password', resetPasswordController); // Password reset

// Protected routes
router.post('/logout-all', requireAuth, logoutAllController);

export default router;
