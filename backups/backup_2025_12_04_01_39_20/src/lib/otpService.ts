import { supabase } from './supabase';
import { createSMSGateway } from './smsGateways';
import { formatPhoneForSMS } from './phoneValidation';
import { checkRateLimit } from './rateLimiter';
import type { SMSResponse } from './smsGateways';

// OTP expiration time (10 minutes)
const OTP_EXPIRY_MINUTES = 10;

// Generate a 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP to database
export const saveOTP = async (phone: string, otp: string): Promise<void> => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

  const { error } = await supabase
    .from('otp_verifications')
    .insert([
      {
        phone,
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
        is_used: false,
      },
    ]);

  if (error) {
    console.error('Error saving OTP to database:', error);
    throw error;
  }
  
  console.log(`[OTP] Generated and saved OTP for phone: ${phone.slice(0, 4)}****${phone.slice(-2)}`);
};

// Verify OTP
export const verifyOTP = async (phone: string, otp: string): Promise<boolean> => {
  console.log(`[OTP] Verifying OTP for phone: ${phone.slice(0, 4)}****${phone.slice(-2)}`);
  
  const { data, error } = await supabase
    .from('otp_verifications')
    .select('*')
    .eq('phone', phone)
    .eq('otp_code', otp)
    .eq('is_used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    console.log(`[OTP] Verification failed - Invalid or expired OTP`);
    return false;
  }

  // Mark OTP as used
  await supabase
    .from('otp_verifications')
    .update({ is_used: true })
    .eq('id', data.id);

  console.log(`[OTP] Verification successful`);
  return true;
};

/**
 * Send OTP via configured SMS gateway
 */
export const sendOTPSMS = async (phone: string, otp: string): Promise<SMSResponse> => {
  try {
    const provider = import.meta.env.VITE_SMS_PROVIDER || '';
    
    // Check if in development mode (no provider configured)
    if (!provider) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
      console.log('⚠️  Set VITE_SMS_PROVIDER in .env to enable real SMS');
      console.log('   Supported providers: msg91, twilio, textlocal');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return { success: true, messageId: 'dev-mode' };
    }

    const gateway = createSMSGateway(provider);
    const formattedPhone = formatPhoneForSMS(phone);
    
    console.log(`[SMS] Sending OTP via ${gateway.getName()} to ${formattedPhone}`);
    const result = await gateway.sendOTP(formattedPhone, otp);
    
    if (result.success) {
      console.log(`[SMS] ✓ SMS sent successfully. Message ID: ${result.messageId}`);
    } else {
      console.error(`[SMS] ✗ SMS failed: ${result.error} (Code: ${result.errorCode})`);
    }
    
    return result;
  } catch (error) {
    console.error('[SMS] Error sending SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS',
    };
  }
};

/**
 * Complete OTP flow with rate limiting
 */
export const sendOTP = async (phone: string): Promise<{
  success: boolean;
  error?: string;
  remainingAttempts?: number;
}> => {
  try {
    console.log(`[OTP] Starting OTP flow for phone: ${phone.slice(0, 4)}****${phone.slice(-2)}`);
    
    // Check rate limits
    const rateLimitCheck = await checkRateLimit(phone);
    if (!rateLimitCheck.allowed) {
      console.log(`[OTP] Rate limit exceeded for phone: ${phone.slice(0, 4)}****${phone.slice(-2)}`);
      return {
        success: false,
        error: rateLimitCheck.error,
        remainingAttempts: rateLimitCheck.remainingAttempts,
      };
    }

    console.log(`[OTP] Rate limit check passed. Remaining attempts: ${rateLimitCheck.remainingAttempts}`);

    // Generate and save OTP
    const otp = generateOTP();
    await saveOTP(phone, otp);
    
    // Send SMS
    const smsResult = await sendOTPSMS(phone, otp);
    
    if (!smsResult.success) {
      return {
        success: false,
        error: smsResult.error || 'Failed to send SMS. Please try again.',
        remainingAttempts: rateLimitCheck.remainingAttempts,
      };
    }

    return {
      success: true,
      remainingAttempts: rateLimitCheck.remainingAttempts ? rateLimitCheck.remainingAttempts - 1 : undefined,
    };
  } catch (error) {
    console.error('[OTP] Error in OTP flow:', error);
    return {
      success: false,
      error: 'An error occurred. Please try again.',
    };
  }
};



