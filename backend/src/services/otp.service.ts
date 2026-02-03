import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';
import env from '../config/env';
import https from 'https';
import dns from 'node:dns';

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
 */
export async function storeOTPForSignup(email: string, otp: string, name: string): Promise<boolean> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    logger.info(`[OTP STORE] Storing OTP for email: ${email}, OTP: ${otp}`);
    logger.info(`[OTP STORE] Now: ${now.toISOString()}, Expires: ${expiresAt.toISOString()}`);

    const { data: existing } = await supabaseAdmin
      .from('students')
      .select('email, is_verified')
      .eq('email', email)
      .single();

    if (existing) {
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
      logger.info(`[OTP STORE] Updated existing record.`);
    } else {
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
      logger.info(`[OTP STORE] Created new record.`);
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
export async function verifyOTP(email: string, otp: string): Promise<{ valid: boolean; message: string; }> {
  try {
    const { data: student, error } = await supabaseAdmin
      .from('students')
      .select('verification_code, verification_code_expires, is_verified')
      .eq('email', email)
      .single();

    if (error || !student) {
      return { valid: false, message: 'No OTP found for this email. Please request a new one.' };
    }
    if (student.is_verified) {
      return { valid: false, message: 'This email is already verified.' };
    }
    if (!student.verification_code) {
      return { valid: false, message: 'No OTP found. Please request a new one.' };
    }

    // Check match
    const isMatch = student.verification_code.trim() === otp.trim();
    if (!isMatch) {
      return { valid: false, message: 'Incorrect OTP. Please try again.' };
    }

    logger.info(`[OTP VERIFY] OTP verified successfully for: ${email}`);
    return { valid: true, message: 'OTP verified successfully!' };
  } catch (error) {
    logger.error('Exception in verifyOTP:', error);
    return { valid: false, message: 'An error occurred during verification.' };
  }
}

/**
 * Clear OTP
 */
export async function clearOTP(email: string): Promise<void> {
  try {
    await supabaseAdmin
      .from('students')
      .update({ verification_code: null, verification_code_expires: null })
      .eq('email', email);
  } catch (error) {
    logger.error('Exception in clearOTP:', error);
  }
}

/**
 * Helper to resolve DNS IPv4 manually
 */
function resolveIPv4(hostname: string): Promise<string> {
  return new Promise((resolve, reject) => {
    dns.resolve4(hostname, (err, addresses) => {
      if (err) reject(err);
      else if (addresses && addresses.length > 0) resolve(addresses[0]);
      else reject(new Error('No IPv4 addresses found'));
    });
  });
}

/**
 * Send OTP via email using EmailJS (Native HTTPS + Manual IPv4 Resolution)
 */
export async function sendOTPEmail(email: string, name: string, otp: string): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      const data = JSON.stringify({
        service_id: env.EMAILJS_SERVICE_ID,
        template_id: env.EMAILJS_TEMPLATE_ID,
        user_id: env.EMAILJS_PUBLIC_KEY,
        accessToken: env.EMAILJS_PRIVATE_KEY,
        template_params: {
          email: email,
          to_name: name,
          otp: otp,
          passcode: otp,
          message: `Your verification code is ${otp}`,
        }
      });

      // 1. Resolve Hostname to IPv4 Manually (Bypass System DNS issues)
      const hostname = 'api.emailjs.com';
      let targetIp = hostname;
      try {
        targetIp = await resolveIPv4(hostname);
        logger.info(`[EmailJS] Resolved ${hostname} to IPv4: ${targetIp}`);
      } catch (dnsError) {
        logger.error(`[EmailJS] DNS Resolution Failed:`, dnsError);
        // Fallback to hostname if manual resolution fails (system might handle it)
      }

      logger.info(`[EmailJS] Sending OTP to ${email} via HTTPS (${targetIp})...`);

      const options = {
        hostname: targetIp, // Use resolved IP
        port: 443,
        path: '/api/v1.0/email/send',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
          'Host': hostname, // CRITICAL: Host header must be the domain name
          'Origin': 'http://localhost'
        },
        // Force IPv4 family in the socket
        family: 4
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => { responseData += chunk; });

        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            logger.info(`[EmailJS] Success! Status: ${res.statusCode}`);
            resolve(true);
          } else {
            logger.error(`[EmailJS] Failed. Status: ${res.statusCode}, Response: ${responseData}`);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        logger.error('Error sending OTP email via EmailJS (HTTPS):', error);
        resolve(false);
      });

      req.write(data);
      req.end();

    } catch (error) {
      logger.error('Exception in sendOTPEmail:', error);
      resolve(false);
    }
  });
}

/**
 * Verify OTP for password reset
 */
export async function verifyPasswordResetOTP(email: string, otp: string): Promise<{ valid: boolean; message: string; }> {
  try {
    const { data: student, error } = await supabaseAdmin
      .from('students')
      .select('verification_code')
      .eq('email', email)
      .single();

    if (error || !student || !student.verification_code) {
      return { valid: false, message: 'No OTP found or invalid email.' };
    }
    const isMatch = student.verification_code.trim() === otp.trim();
    if (isMatch) {
      await clearOTP(email);
      return { valid: true, message: 'OTP verified successfully!' };
    }
    return { valid: false, message: 'Incorrect OTP.' };
  } catch (error) {
    logger.error('Exception in verifyPasswordResetOTP:', error);
    return { valid: false, message: 'Error verifying OTP.' };
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
