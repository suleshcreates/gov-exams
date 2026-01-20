import emailjs from '@emailjs/browser';
import logger from './logger';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// Initialize EmailJS
emailjs.init(PUBLIC_KEY);

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP email to user
 * @param email - User's email address
 * @param name - User's name
 * @param otp - 6-digit OTP code
 * @returns Promise<void>
 */
export async function sendOTPEmail(
    email: string,
    name: string,
    otp: string
): Promise<void> {
    try {
        logger.debug('[EmailService] Sending OTP email to:', email);

        const templateParams = {
            to_email: email,
            to_name: name,
            otp_code: otp,
            app_name: 'DMLT Academy',
        };

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            templateParams
        );

        logger.debug('[EmailService] Email sent successfully:', response);
    } catch (error) {
        logger.error('[EmailService] Failed to send email:', error);
        throw new Error('Failed to send verification email. Please try again.');
    }
}

/**
 * Send password reset OTP email to user
 * @param email - User's email address
 * @param name - User's name
 * @param otp - 6-digit OTP code
 * @returns Promise<void>
 */
export async function sendPasswordResetOTP(
    email: string,
    name: string,
    otp: string
): Promise<void> {
    try {
        logger.debug('[EmailService] Sending password reset OTP email to:', email);

        const templateParams = {
            to_email: email,
            to_name: name,
            otp_code: otp,
            app_name: 'DMLT Academy',
        };

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            templateParams
        );

        logger.debug('[EmailService] Password reset email sent successfully:', response);
    } catch (error) {
        logger.error('[EmailService] Failed to send password reset email:', error);
        throw new Error('Failed to send password reset email. Please try again.');
    }
}

/**
 * Store OTP in session storage with expiry
 * @param email - User's email
 * @param otp - OTP code
 * @param expiryMinutes - Minutes until expiry (default 5)
 */
export function storeOTP(email: string, otp: string, expiryMinutes: number = 5): void {
    const expiry = Date.now() + expiryMinutes * 60 * 1000;

    const otpData = {
        code: otp,
        email: email,
        expiry: expiry,
        attempts: 0,
    };

    sessionStorage.setItem(`otp_${email}`, JSON.stringify(otpData));
    logger.debug('[EmailService] OTP stored for:', email);
}

/**
 * Verify OTP code
 * @param email - User's email
 * @param inputOTP - User-provided OTP
 * @returns boolean - true if OTP is valid
 */
export function verifyOTP(email: string, inputOTP: string): {
    valid: boolean;
    message: string;
} {
    const storedData = sessionStorage.getItem(`otp_${email}`);

    if (!storedData) {
        return { valid: false, message: 'No OTP found. Please request a new one.' };
    }

    const otpData = JSON.parse(storedData);

    // Check expiry
    if (Date.now() > otpData.expiry) {
        sessionStorage.removeItem(`otp_${email}`);
        return { valid: false, message: 'OTP has expired. Please request a new one.' };
    }

    // Check attempts
    if (otpData.attempts >= 3) {
        sessionStorage.removeItem(`otp_${email}`);
        return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }

    // Verify code
    if (otpData.code === inputOTP) {
        sessionStorage.removeItem(`otp_${email}`);
        return { valid: true, message: 'OTP verified successfully!' };
    }

    // Increment attempts
    otpData.attempts++;
    sessionStorage.setItem(`otp_${email}`, JSON.stringify(otpData));

    return {
        valid: false,
        message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.`,
    };
}

/**
 * Clear OTP from storage
 * @param email - User's email
 */
export function clearOTP(email: string): void {
    sessionStorage.removeItem(`otp_${email}`);
    logger.debug('[EmailService] OTP cleared for:', email);
}
