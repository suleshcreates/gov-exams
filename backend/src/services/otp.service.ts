import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';
import nodemailer from 'nodemailer';
import env from '../config/env';

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

// Verify transporter on startup
transporter.verify().then(() => {
  logger.info('✅ SMTP ready — transporter verified.');
}).catch((err) => {
  logger.error('❌ SMTP verification failed. Check EMAIL_USER / EMAIL_PASS and 2FA/App Passwords.');
  logger.error(err.message || err);
});

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
    const mailOptions = {
      from: `"DMLT Academy" <${env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code - DMLT Academy',
      html: `
  <div style="margin:0;padding:0;background:#f4f5f7;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" 
      style="background:#f4f5f7;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
      <tr>
        <td align="center">

          <!-- Outer Card -->
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" 
            style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

            <!-- Hero Section with Background -->
            <tr>
              <td style="padding:0;margin:0;">
                <div style="
                  background:url('https://i.ibb.co/yBXrWc3H/final-hero-bg.jpg');
                  background-size:cover;
                  background-position:center;
                  padding:40px 20px;
                  text-align:center;
                  color:white;">
                  
                  <img 
                    src="https://i.ibb.co/W4jLJpcz/dmlt-logo.jpg" 
                    alt="DMLT Academy" 
                    style="width:180px;margin-bottom:20px;border-radius:6px;"
                  />

                  <h1 style="margin:0;font-size:26px;letter-spacing:0.5px;font-weight:700;color:#063056;">
                    Verification Code
                  </h1>

                  <p style="margin-top:10px;font-size:15px;color:#063056;">
                    Secure login for DMLT Academy
                  </p>

                </div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px 40px;color:#333333;">

                <p style="font-size:16px;margin:0 0 20px 0;">
                  Hi <strong>${name}</strong>,
                </p>

                <p style="font-size:15px;line-height:1.6;margin:0 0 25px;">
                  Your verification code for <strong>DMLT Academy</strong> is:
                </p>

                <!-- OTP Box -->
                <div style="
                  background:#f1f5f9;
                  border:1px solid #dbe3eb;
                  border-radius:8px;
                  padding:18px;
                  text-align:center;
                  font-size:32px;
                  font-weight:700;
                  letter-spacing:4px;
                  color:#111827;">
                  ${otp}
                </div>

                <p style="font-size:15px;line-height:1.6;margin:25px 0 20px;">
                  This code will expire in <strong>5 minutes</strong>.
                </p>

                <p style="font-size:14px;color:#6b7280;line-height:1.6;margin-bottom:30px;">
                  If you didn't request this code, simply ignore this email.
                </p>

                <p style="font-size:15px;margin:0;">
                  Best regards,<br/>
                  <strong>DMLT Academy Team</strong>
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc;padding:18px;text-align:center;color:#94a3b8;font-size:12px;">
                © ${new Date().getFullYear()} DMLT Academy. All rights reserved.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </div>`,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`📧 OTP sent to ${email}`);

    return true;
  } catch (error) {
    logger.error('Error sending OTP email:', error);
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
