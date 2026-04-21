import { supabase } from './supabase';

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts?: number;
  resetTime?: Date;
  error?: string;
}

const RATE_LIMIT_WINDOW_HOURS = 1;
const MAX_ATTEMPTS_PER_WINDOW = 3;
const COOLDOWN_SECONDS = 60;

/**
 * Check if phone number has exceeded rate limits
 */
export const checkRateLimit = async (phone: string): Promise<RateLimitResult> => {
  try {
    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() - RATE_LIMIT_WINDOW_HOURS);

    // Get OTP attempts in the last hour
    const { data: attempts, error } = await supabase
      .from('otp_verifications')
      .select('created_at')
      .eq('phone', phone)
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Rate limit check error:', error);
      // On error, allow the request but log it
      return { allowed: true };
    }

    const attemptCount = attempts?.length || 0;

    // Check hourly limit
    if (attemptCount >= MAX_ATTEMPTS_PER_WINDOW) {
      const oldestAttempt = new Date(attempts[attempts.length - 1].created_at);
      const resetTime = new Date(oldestAttempt);
      resetTime.setHours(resetTime.getHours() + RATE_LIMIT_WINDOW_HOURS);

      const minutesUntilReset = Math.ceil((resetTime.getTime() - Date.now()) / 60000);
      
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime,
        error: `Too many OTP requests. Please try again in ${minutesUntilReset} minute${minutesUntilReset > 1 ? 's' : ''}.`,
      };
    }

    // Check cooldown period (last attempt must be at least 60 seconds ago)
    if (attempts && attempts.length > 0) {
      const lastAttempt = new Date(attempts[0].created_at);
      const timeSinceLastAttempt = Date.now() - lastAttempt.getTime();
      const cooldownRemaining = COOLDOWN_SECONDS * 1000 - timeSinceLastAttempt;

      if (cooldownRemaining > 0) {
        const secondsRemaining = Math.ceil(cooldownRemaining / 1000);
        return {
          allowed: false,
          remainingAttempts: MAX_ATTEMPTS_PER_WINDOW - attemptCount,
          error: `Please wait ${secondsRemaining} second${secondsRemaining > 1 ? 's' : ''} before requesting another OTP.`,
        };
      }
    }

    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS_PER_WINDOW - attemptCount,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow the request but log it
    return { allowed: true };
  }
};

/**
 * Clean up expired OTP records (older than 24 hours)
 */
export const cleanupExpiredOTPs = async (): Promise<void> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - 24);

    const { error } = await supabase
      .from('otp_verifications')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('Error cleaning up expired OTPs:', error);
    } else {
      console.log('Successfully cleaned up expired OTPs');
    }
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
  }
};
