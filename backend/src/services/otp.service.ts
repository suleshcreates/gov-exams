import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';
// import nodemailer from 'nodemailer'; // Removed for EmailJS
import env from '../config/env';

// EmailJS Configuration is loaded from env.ts
if (!env.EMAILJS_SERVICE_ID || !env.EMAILJS_PUBLIC_KEY || !env.EMAILJS_PRIVATE_KEY) {
  console.warn('⚠️ EmailJS credentials missing in .env. Email sending will fail.');
} else {
  logger.info('✅ EmailJS configured.');
}

/**
 * Generate 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store OTP in students table (for new signups before account creation)
 * This creates a temporary record that will be completed after OTP verification
 */
export async function storeOTPForSignup(email: string, otp: string, name: string): Promise<boolean> {
  try {
    // Create expiry time: 10 minutes from now using milliseconds
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    logger.info(`[OTP STORE] Storing OTP for email: ${email}, OTP: ${otp}`);
    logger.info(`[OTP STORE] Now: ${now.toISOString()}, Expires: ${expiresAt.toISOString()}`);


    // Check if temporary record already exists
    const { data: existing } = await supabaseAdmin
      .from('students')
      .select('email, is_verified')
      .eq('email', email)
      .single();

    logger.info(`[OTP STORE] Existing record:`, { email, exists: !!existing, isVerified: existing?.is_verified });

    if (existing) {
      // Update existing unverified record
      const { error, data: updated } = await supabaseAdmin
        .from('students')
        .update({
          verification_code: otp,
          verification_code_expires: expiresAt.toISOString(),
        })
        .eq('email', email)
        .select()
        .single();

      if (error) {
        logger.error('[OTP STORE] Error updating OTP:', error);
        return false;
      }

      logger.info(`[OTP STORE] Updated existing record:`, {
        email,
        stored_otp: updated?.verification_code,
        expires: updated?.verification_code_expires
      });
    } else {
      // Create temporary record with just email and OTP
      const { error, data: created } = await supabaseAdmin
        .from('students')
        .insert({
          email,
          name,
          verification_code: otp,
          verification_code_expires: expiresAt.toISOString(),
          is_verified: false,
          email_verified: false,
        })
        .select()
        .single();

      if (error) {
        logger.error('[OTP STORE] Error storing OTP:', error);
        return false;
      }

      logger.info(`[OTP STORE] Created new record:`, {
        email,
        stored_otp: created?.verification_code,
        expires: created?.verification_code_expires
      });
    }

    return true;
  } catch (error) {
    logger.error('Exception in storeOTPForSignup:', error);
    return false;
  }
}

/**
 * Verify OTP from students table
 */
export async function verifyOTP(email: string, otp: string): Promise<{
  valid: boolean;
  message: string;
}> {
  try {
    logger.info(`[OTP VERIFY] Attempting to verify OTP for email: ${email}, OTP: ${otp}`);

    // Find student record with this email
    const { data: student, error } = await supabaseAdmin
      .from('students')
      .select('verification_code, verification_code_expires, is_verified')
      .eq('email', email)
      .single();

    logger.info(`[OTP VERIFY] Student found:`, {
      email,
      hasStudent: !!student,
      storedOTP: student?.verification_code,
      inputOTP: otp,
      expires: student?.verification_code_expires,
      isVerified: student?.is_verified
    });

    if (error || !student) {
      logger.error(`[OTP VERIFY] No student found for email: ${email}`, error);
      return {
        valid: false,
        message: 'No OTP found for this email. Please request a new one.',
      };
    }

    // Check if already verified
    if (student.is_verified) {
      logger.warn(`[OTP VERIFY] Email already verified: ${email}`);
      return {
        valid: false,
        message: 'This email is already verified.',
      };
    }

    // Check if no OTP code
    if (!student.verification_code) {
      logger.warn(`[OTP VERIFY] No OTP code stored for: ${email}`);
      return {
        valid: false,
        message: 'No OTP found. Please request a new one.',
      };
    }

    // Expiry check disabled - OTP valid until manually cleared
    logger.info(`[OTP VERIFY] Skipping expiry check for: ${email}`);

    // Verify OTP (strict string comparison)
    const isMatch = student.verification_code.trim() === otp.trim();
    logger.info(`[OTP VERIFY] OTP Match: ${isMatch} (stored: "${student.verification_code}", input: "${otp}")`);

    if (!isMatch) {
      logger.warn(`[OTP VERIFY] OTP mismatch for: ${email}`);
      return {
        valid: false,
        message: 'Incorrect OTP. Please try again.',
      };
    }

    // OTP is valid!
    logger.info(`[OTP VERIFY] OTP verified successfully for: ${email}`);
    return {
      valid: true,
      message: 'OTP verified successfully!',
    };
  } catch (error) {
    logger.error('Exception in verifyOTP:', error);
    return {
      valid: false,
      message: 'An error occurred during verification.',
    };
  }
}

/**
 * Clear OTP after successful verification
 */
export async function clearOTP(email: string): Promise<void> {
  try {
    await supabaseAdmin
      .from('students')
      .update({
        verification_code: null,
        verification_code_expires: null,
      })
      .eq('email', email);
  } catch (error) {
    logger.error('Exception in clearOTP:', error);
  }
}

/**
 * Send OTP via email using Nodemailer with professional HTML template
 */
export async function sendOTPEmail(
  email: string,
  name: string,
  otp: string
): Promise<boolean> {
  try {
    const data = {
      service_id: env.EMAILJS_SERVICE_ID,
      template_id: env.EMAILJS_TEMPLATE_ID,
      user_id: env.EMAILJS_PUBLIC_KEY,
      accessToken: env.EMAILJS_PRIVATE_KEY,
      template_params: {
        email: email,       // Matches {{email}} in "To Email"
        to_name: name,      // Use {{to_name}} in your template greeting (e.g. "Hi {{to_name}}")
        otp: otp,           // Keeping generic {{otp}}
        passcode: otp,      // Matches {{passcode}} in standard EmailJS templates
        message: `Your verification code is ${otp}`,
      }
    };

    logger.info(`[EmailJS] Sending OTP to ${email} via REST API...`);

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost' // Some APIs require Origin header, EmailJS might be lenient
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      logger.info(`[EmailJS] Success! Status: ${response.status}`);
      return true;
    } else {
      const errorText = await response.text();
      logger.error(`[EmailJS] Failed. Status: ${response.status}, Response: ${errorText}`);
      return false;
    }

  } catch (error) {
    logger.error('Error sending OTP email via EmailJS:', error);
    return false;
  }
}

/**
 * Verify OTP for password reset (skips email_verified check)
 * This is separate from signup OTP verification
 */
export async function verifyPasswordResetOTP(email: string, otp: string): Promise<{
  valid: boolean;
  message: string;
}> {
  try {
    logger.info(`[PASSWORD RESET OTP] Verifying for email: ${email}`);

    // Find student record with this email
    const { data: student, error } = await supabaseAdmin
      .from('students')
      .select('verification_code, verification_code_expires')
      .eq('email', email)
      .single();

    if (error || !student) {
      logger.error(`[PASSWORD RESET OTP] No student found for email: ${email}`);
      return {
        valid: false,
        message: 'No OTP found for this email. Please request a new one.',
      };
    }

    // Check if no OTP code
    if (!student.verification_code) {
      logger.warn(`[PASSWORD RESET OTP] No OTP code stored for: ${email}`);
      return {
        valid: false,
        message: 'No OTP found. Please request a new one.',
      };
    }

    // Verify OTP (strict string comparison)
    const isMatch = student.verification_code.trim() === otp.trim();
    logger.info(`[PASSWORD RESET OTP] OTP Match: ${isMatch}`);

    if (!isMatch) {
      logger.warn(`[PASSWORD RESET OTP] OTP mismatch for: ${email}`);
      return {
        valid: false,
        message: 'Incorrect OTP. Please try again.',
      };
    }

    // Clear OTP after successful verification
    await clearOTP(email);

    // OTP is valid!
    logger.info(`[PASSWORD RESET OTP] OTP verified successfully for: ${email}`);
    return {
      valid: true,
      message: 'OTP verified successfully!',
    };
  } catch (error) {
    logger.error('Exception in verifyPasswordResetOTP:', error);
    return {
      valid: false,
      message: 'An error occurred during verification.',
    };
  }
}

export default {
  generateOTP,
  storeOTPForSignup,
  verifyOTP,
  verifyPasswordResetOTP,
  clearOTP,
  sendOTPEmail,
};
