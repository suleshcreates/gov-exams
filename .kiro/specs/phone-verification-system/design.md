# Design Document: Phone Verification System with SMS Integration

## Overview

This design implements a production-ready phone verification system that validates Indian mobile numbers, integrates with SMS gateway providers for OTP delivery, implements rate limiting to prevent abuse, and provides comprehensive error handling. The system replaces the current placeholder implementation with a secure, scalable solution.

## Architecture

### System Flow

```
User Enters Phone Number
    ↓
Validate Phone Format (Indian mobile)
    ↓
Check Duplicate Registration
    ↓
Check Rate Limits
    ↓
Generate 6-Digit OTP
    ↓
Save OTP to Database
    ↓
Send SMS via Gateway (MSG91/Twilio/TextLocal)
    ↓
Display Success/Error Message
    ↓
User Enters OTP
    ↓
Verify OTP (check expiry, usage)
    ↓
Mark Student as Verified
    ↓
Complete Registration
```

### Component Architecture

```
src/
├── lib/
│   ├── otpService.ts (UPDATED - SMS integration)
│   ├── phoneValidation.ts (NEW - validation logic)
│   ├── smsGateways/
│   │   ├── msg91.ts (NEW - MSG91 integration)
│   │   ├── twilio.ts (NEW - Twilio integration)
│   │   ├── textlocal.ts (NEW - TextLocal integration)
│   │   └── index.ts (NEW - gateway factory)
│   ├── rateLimiter.ts (NEW - rate limiting)
│   └── supabaseService.ts (UPDATED - rate limit tracking)
├── pages/
│   └── Signup.tsx (UPDATED - enhanced validation)
└── context/
    └── AuthContext.tsx (UPDATED - error handling)
```

## Components and Interfaces

### 1. Phone Validation Module

```typescript
// src/lib/phoneValidation.ts

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formattedPhone?: string;
}

/**
 * Validate Indian mobile phone number
 * Must be 10 digits starting with 6, 7, 8, or 9
 */
export const validateIndianPhone = (phone: string): PhoneValidationResult => {
  // Remove any whitespace or special characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check length
  if (cleaned.length !== 10) {
    return {
      isValid: false,
      error: 'Phone number must be exactly 10 digits'
    };
  }
  
  // Check if starts with valid prefix (6, 7, 8, or 9)
  const firstDigit = cleaned[0];
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return {
      isValid: false,
      error: 'Phone number must start with 6, 7, 8, or 9'
    };
  }
  
  return {
    isValid: true,
    formattedPhone: cleaned
  };
};

/**
 * Format phone number for display
 */
export const formatPhoneDisplay = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

/**
 * Format phone number for SMS (with country code)
 */
export const formatPhoneForSMS = (phone: string, countryCode: string = '+91'): string => {
  const cleaned = phone.replace(/\D/g, '');
  return `${countryCode}${cleaned}`;
};
```

### 2. SMS Gateway Interfaces

```typescript
// src/lib/smsGateways/index.ts

export interface SMSGatewayConfig {
  apiKey: string;
  senderId?: string;
  templateId?: string;
  [key: string]: any;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCode?: string;
}

export interface ISMSGateway {
  sendOTP(phone: string, otp: string): Promise<SMSResponse>;
  getName(): string;
}

/**
 * Factory function to create SMS gateway instance
 */
export const createSMSGateway = (provider: string): ISMSGateway => {
  const providerLower = provider.toLowerCase();
  
  switch (providerLower) {
    case 'msg91':
      return new MSG91Gateway();
    case 'twilio':
      return new TwilioGateway();
    case 'textlocal':
      return new TextLocalGateway();
    default:
      throw new Error(`Unsupported SMS provider: ${provider}`);
  }
};
```

### 3. MSG91 Gateway Implementation

```typescript
// src/lib/smsGateways/msg91.ts

import type { ISMSGateway, SMSResponse } from './index';

export class MSG91Gateway implements ISMSGateway {
  private apiKey: string;
  private senderId: string;
  private templateId: string;
  private baseUrl = 'https://api.msg91.com/api/v5';

  constructor() {
    this.apiKey = import.meta.env.VITE_MSG91_API_KEY || '';
    this.senderId = import.meta.env.VITE_MSG91_SENDER_ID || 'DMLTAC';
    this.templateId = import.meta.env.VITE_MSG91_TEMPLATE_ID || '';

    if (!this.apiKey) {
      throw new Error('MSG91 API key not configured');
    }
  }

  getName(): string {
    return 'MSG91';
  }

  async sendOTP(phone: string, otp: string): Promise<SMSResponse> {
    try {
      const message = `Your OTP for DMLT Academy is ${otp}. Valid for 10 minutes. Do not share this code.`;
      
      const response = await fetch(`${this.baseUrl}/flow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authkey': this.apiKey,
        },
        body: JSON.stringify({
          sender: this.senderId,
          short_url: '0',
          mobiles: phone,
          var1: otp,
          template_id: this.templateId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.type === 'success') {
        return {
          success: true,
          messageId: data.message_id || data.request_id,
        };
      }

      return {
        success: false,
        error: data.message || 'Failed to send SMS',
        errorCode: data.type,
      };
    } catch (error) {
      console.error('MSG91 SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}
```

### 4. Twilio Gateway Implementation

```typescript
// src/lib/smsGateways/twilio.ts

import type { ISMSGateway, SMSResponse } from './index';

export class TwilioGateway implements ISMSGateway {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;
  private baseUrl: string;

  constructor() {
    this.accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID || '';
    this.authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN || '';
    this.fromNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER || '';

    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      throw new Error('Twilio credentials not configured');
    }

    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}`;
  }

  getName(): string {
    return 'Twilio';
  }

  async sendOTP(phone: string, otp: string): Promise<SMSResponse> {
    try {
      const message = `Your OTP for DMLT Academy is ${otp}. Valid for 10 minutes. Do not share this code.`;
      
      const auth = btoa(`${this.accountSid}:${this.authToken}`);
      
      const response = await fetch(`${this.baseUrl}/Messages.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`,
        },
        body: new URLSearchParams({
          To: phone,
          From: this.fromNumber,
          Body: message,
        }),
      });

      const data = await response.json();

      if (response.ok && data.sid) {
        return {
          success: true,
          messageId: data.sid,
        };
      }

      return {
        success: false,
        error: data.message || 'Failed to send SMS',
        errorCode: data.code?.toString(),
      };
    } catch (error) {
      console.error('Twilio SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}
```

### 5. TextLocal Gateway Implementation

```typescript
// src/lib/smsGateways/textlocal.ts

import type { ISMSGateway, SMSResponse } from './index';

export class TextLocalGateway implements ISMSGateway {
  private apiKey: string;
  private sender: string;
  private baseUrl = 'https://api.textlocal.in';

  constructor() {
    this.apiKey = import.meta.env.VITE_TEXTLOCAL_API_KEY || '';
    this.sender = import.meta.env.VITE_TEXTLOCAL_SENDER || 'DMLTAC';

    if (!this.apiKey) {
      throw new Error('TextLocal API key not configured');
    }
  }

  getName(): string {
    return 'TextLocal';
  }

  async sendOTP(phone: string, otp: string): Promise<SMSResponse> {
    try {
      const message = `Your OTP for DMLT Academy is ${otp}. Valid for 10 minutes. Do not share this code.`;
      
      const response = await fetch(`${this.baseUrl}/send/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          apikey: this.apiKey,
          numbers: phone,
          message: message,
          sender: this.sender,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        return {
          success: true,
          messageId: data.messages?.[0]?.id,
        };
      }

      return {
        success: false,
        error: data.errors?.[0]?.message || 'Failed to send SMS',
        errorCode: data.errors?.[0]?.code?.toString(),
      };
    } catch (error) {
      console.error('TextLocal SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}
```

### 6. Rate Limiter Module

```typescript
// src/lib/rateLimiter.ts

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

    if (error) throw error;

    const attemptCount = attempts?.length || 0;

    // Check hourly limit
    if (attemptCount >= MAX_ATTEMPTS_PER_WINDOW) {
      const oldestAttempt = new Date(attempts[attempts.length - 1].created_at);
      const resetTime = new Date(oldestAttempt);
      resetTime.setHours(resetTime.getHours() + RATE_LIMIT_WINDOW_HOURS);

      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime,
        error: `Too many OTP requests. Please try again after ${resetTime.toLocaleTimeString()}.`,
      };
    }

    // Check cooldown period (last attempt must be at least 60 seconds ago)
    if (attempts && attempts.length > 0) {
      const lastAttempt = new Date(attempts[0].created_at);
      const timeSinceLastAttempt = Date.now() - lastAttempt.getTime();
      const cooldownRemaining = COOLDOWN_SECONDS * 1000 - timeSinceLastAttempt;

      if (cooldownRemaining > 0) {
        return {
          allowed: false,
          remainingAttempts: MAX_ATTEMPTS_PER_WINDOW - attemptCount,
          error: `Please wait ${Math.ceil(cooldownRemaining / 1000)} seconds before requesting another OTP.`,
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

    await supabase
      .from('otp_verifications')
      .delete()
      .lt('created_at', cutoffDate.toISOString());
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
  }
};
```

### 7. Updated OTP Service

```typescript
// src/lib/otpService.ts (UPDATED)

import { supabase } from './supabase';
import { createSMSGateway } from './smsGateways';
import { formatPhoneForSMS } from './phoneValidation';
import { checkRateLimit } from './rateLimiter';
import type { SMSResponse } from './smsGateways';

const OTP_EXPIRY_MINUTES = 10;

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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

  if (error) throw error;
};

export const verifyOTP = async (phone: string, otp: string): Promise<boolean> => {
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
    return false;
  }

  // Mark OTP as used
  await supabase
    .from('otp_verifications')
    .update({ is_used: true })
    .eq('id', data.id);

  return true;
};

/**
 * Send OTP via configured SMS gateway
 */
export const sendOTPSMS = async (phone: string, otp: string): Promise<SMSResponse> => {
  try {
    const provider = import.meta.env.VITE_SMS_PROVIDER || 'msg91';
    
    // Check if in development mode
    const isDev = import.meta.env.DEV;
    if (isDev && !import.meta.env.VITE_SMS_PROVIDER) {
      console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
      console.log('⚠️ Set VITE_SMS_PROVIDER in .env to enable real SMS');
      return { success: true, messageId: 'dev-mode' };
    }

    const gateway = createSMSGateway(provider);
    const formattedPhone = formatPhoneForSMS(phone);
    
    console.log(`Sending OTP via ${gateway.getName()} to ${formattedPhone}`);
    const result = await gateway.sendOTP(formattedPhone, otp);
    
    if (result.success) {
      console.log(`SMS sent successfully. Message ID: ${result.messageId}`);
    } else {
      console.error(`SMS failed: ${result.error} (Code: ${result.errorCode})`);
    }
    
    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
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
    // Check rate limits
    const rateLimitCheck = await checkRateLimit(phone);
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error: rateLimitCheck.error,
        remainingAttempts: rateLimitCheck.remainingAttempts,
      };
    }

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
    console.error('Error in OTP flow:', error);
    return {
      success: false,
      error: 'An error occurred. Please try again.',
    };
  }
};
```

## Environment Variables

### Required Configuration

Create a `.env` file in the project root:

```env
# SMS Provider Selection (msg91, twilio, or textlocal)
VITE_SMS_PROVIDER=msg91

# MSG91 Configuration
VITE_MSG91_API_KEY=your_msg91_api_key
VITE_MSG91_SENDER_ID=DMLTAC
VITE_MSG91_TEMPLATE_ID=your_template_id

# Twilio Configuration (alternative)
# VITE_TWILIO_ACCOUNT_SID=your_account_sid
# VITE_TWILIO_AUTH_TOKEN=your_auth_token
# VITE_TWILIO_PHONE_NUMBER=+1234567890

# TextLocal Configuration (alternative)
# VITE_TEXTLOCAL_API_KEY=your_api_key
# VITE_TEXTLOCAL_SENDER=DMLTAC
```

## Updated Signup Flow

### Enhanced Validation and Error Handling

```typescript
// In Signup.tsx

const handleSendOTP = async () => {
  // Validate phone format
  const phoneValidation = validateIndianPhone(form.phone);
  if (!phoneValidation.isValid) {
    toast({
      title: "Invalid Phone Number",
      description: phoneValidation.error,
      variant: "destructive",
    });
    return;
  }

  // Other validations...
  const error = validateForm();
  if (error) {
    toast({ title: "Validation Error", description: error, variant: "destructive" });
    return;
  }

  setLoading(true);
  try {
    // Check if phone already exists
    const existing = await supabaseService.getStudentByPhone(phoneValidation.formattedPhone!);
    if (existing && existing.is_verified) {
      toast({
        title: "Already Registered",
        description: "This phone number is already registered. Please login.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Send OTP with rate limiting
    const result = await sendOTP(phoneValidation.formattedPhone!);
    
    if (result.success) {
      setOtpSent(true);
      setCountdown(60);
      setStep("otp");
      
      const message = result.remainingAttempts !== undefined
        ? `OTP sent successfully. ${result.remainingAttempts} attempts remaining.`
        : "OTP sent successfully. Please check your phone.";
      
      toast({
        title: "OTP Sent",
        description: message,
        variant: "default",
      });
    } else {
      toast({
        title: "Failed to Send OTP",
        description: result.error || "Please try again later.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    toast({
      title: "Error",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive",
    });
  }
  setLoading(false);
};
```

## Error Handling

### Common Error Scenarios

1. **Invalid Phone Format**
   - Message: "Phone number must be 10 digits starting with 6, 7, 8, or 9"
   - Action: Prevent OTP request

2. **Rate Limit Exceeded**
   - Message: "Too many OTP requests. Please try again after [time]"
   - Action: Disable send button, show countdown

3. **SMS Gateway Failure**
   - Message: "Failed to send SMS. Please check your phone number and try again."
   - Action: Allow retry, log error for admin

4. **Network Error**
   - Message: "Network error. Please check your connection and try again."
   - Action: Allow retry

5. **Expired OTP**
   - Message: "OTP has expired. Please request a new one."
   - Action: Allow new OTP request

6. **Invalid OTP**
   - Message: "Invalid OTP. Please check and try again."
   - Action: Allow retry (limited attempts)

## Testing Strategy

### Development Testing

1. **Without SMS Gateway**: Set `VITE_SMS_PROVIDER` to empty, OTP logs to console
2. **With SMS Gateway**: Configure provider credentials, test with real phone numbers
3. **Rate Limiting**: Test multiple OTP requests to verify limits
4. **Phone Validation**: Test various invalid formats

### Production Checklist

- [ ] Configure SMS gateway credentials
- [ ] Test SMS delivery with real phone numbers
- [ ] Verify rate limiting works correctly
- [ ] Test error handling for all scenarios
- [ ] Monitor OTP delivery success rate
- [ ] Set up alerts for SMS failures

## Design Decisions

### 1. Multiple SMS Gateway Support

**Decision**: Support MSG91, Twilio, and TextLocal with easy switching.

**Rationale**:
- Flexibility to choose based on pricing and reliability
- Easy migration if one provider has issues
- Different providers may work better in different regions

### 2. Rate Limiting at Application Level

**Decision**: Implement rate limiting in application code, not just database constraints.

**Rationale**:
- More flexible control over limits
- Can provide better user feedback
- Easier to adjust limits without schema changes

### 3. Indian Phone Number Validation

**Decision**: Strict validation for 10-digit numbers starting with 6/7/8/9.

**Rationale**:
- Matches Indian mobile number format
- Prevents invalid numbers from wasting SMS credits
- Clear error messages improve user experience

### 4. 10-Minute OTP Expiry

**Decision**: OTPs expire after 10 minutes.

**Rationale**:
- Balance between security and user convenience
- Industry standard for OTP validity
- Prevents old codes from being misused

### 5. Development Mode Fallback

**Decision**: Log OTP to console when SMS provider not configured.

**Rationale**:
- Enables development without SMS credits
- Easy testing during development
- Clear indication when in dev mode

## Future Enhancements

1. **WhatsApp OTP**: Add WhatsApp as alternative delivery channel
2. **Voice OTP**: Support voice calls for OTP delivery
3. **International Numbers**: Extend support beyond Indian numbers
4. **OTP Analytics Dashboard**: Track delivery rates and failures
5. **Backup SMS Provider**: Automatic fallback if primary provider fails
6. **Custom OTP Templates**: Allow customization of SMS message format
