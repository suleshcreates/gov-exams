# Phone-Based Authentication with OTP Setup Guide

## Overview
The authentication system has been migrated from Aadhaar-based to Phone-based authentication with OTP verification.

## Key Changes

### 1. Database Schema Changes
- **Primary Key**: Changed from `aadhaar` to `phone` in `students` table
- **Password Storage**: Added `password_hash` column for secure password storage
- **Verification Status**: Added `is_verified` boolean to track OTP verification
- **New Table**: `otp_verifications` table for storing OTP codes

### 2. Authentication Flow
1. **Signup**:
   - User enters: Name, Phone, Password, Confirm Password
   - System sends OTP to phone number
   - User enters OTP to verify
   - Account created and verified

2. **Login**:
   - User enters: Phone Number, Password
   - System verifies credentials and checks verification status

### 3. Security Features
- Password hashing using SHA-256 (Web Crypto API)
- OTP expiration (10 minutes)
- One-time use OTP codes
- Phone number verification required before account activation

## Database Setup

### For New Installations
Run the complete schema in `supabase-schema.sql` in your Supabase SQL Editor.

### For Existing Installations
If you have existing data, run the migration script `supabase-migration-phone-based.sql`.
**WARNING**: This migration may cause data loss. Back up your data first!

## SMS Service Integration

The OTP service is currently set up in development mode (OTP is logged to console). To enable real SMS sending, you need to integrate with an SMS provider.

### Recommended SMS Providers
1. **Twilio** (International)
2. **AWS SNS** (AWS ecosystem)
3. **TextLocal** (India)
4. **MSG91** (India)
5. **Fast2SMS** (India)

### Integration Steps

1. **Get API Credentials** from your SMS provider

2. **Update `.env` file**:
   ```env
   VITE_SMS_API_KEY=your_sms_api_key
   VITE_SMS_API_URL=your_sms_api_endpoint
   ```

3. **Modify `src/lib/otpService.ts`**:
   Uncomment and configure the SMS sending code in the `sendOTPSMS` function:

   ```typescript
   const SMS_API_KEY = import.meta.env.VITE_SMS_API_KEY;
   const SMS_API_URL = import.meta.env.VITE_SMS_API_URL;
   
   const response = await fetch(SMS_API_URL, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${SMS_API_KEY}`,
     },
     body: JSON.stringify({
       to: phone,
       message: `Your OTP for Exam Portal is ${otp}. Valid for 10 minutes.`,
     }),
   });
   return response.ok;
   ```

### Alternative: Backend API Approach (Recommended)
For better security, create a backend API endpoint that handles SMS sending:

1. Create an API endpoint (e.g., `/api/send-otp`)
2. Store SMS credentials on the backend (never expose in frontend)
3. Update `sendOTPSMS` to call your backend API

## Testing in Development

In development mode, OTPs are logged to the browser console. To test:

1. Open browser DevTools (F12)
2. Navigate to Console tab
3. Sign up with a phone number
4. Check console for: `[DEV MODE] OTP for [phone]: [6-digit-code]`
5. Enter the OTP from console to verify

## Migration Checklist

- [x] Database schema updated (phone as primary key)
- [x] OTP table created
- [x] Password hashing implemented
- [x] Signup flow with OTP verification
- [x] Login updated to use phone number
- [x] All components updated (Profile, History, ExamStart, etc.)
- [ ] SMS service integrated (if in production)
- [ ] Environment variables configured
- [ ] RLS policies tested

## Important Notes

1. **Phone Format**: Currently accepts 10-digit Indian phone numbers. Modify validation if needed for international numbers.

2. **OTP Expiry**: OTPs expire after 10 minutes. Adjust in `src/lib/otpService.ts` if needed.

3. **Resend OTP**: Users can resend OTP after 60 seconds (cooldown period).

4. **Password Requirements**: Minimum 6 characters. You can strengthen this in `Signup.tsx`.

5. **Verification Status**: Users must verify their phone number via OTP before they can login.

## Troubleshooting

### OTP Not Received
- Check console for OTP in development mode
- Verify SMS service integration in production
- Check phone number format (must be 10 digits)
- Verify OTP hasn't expired (10 minutes)

### Login Fails
- Ensure phone number is verified (`is_verified = true`)
- Check password is correct
- Verify phone number format matches registration

### Database Errors
- Ensure all tables are created with new schema
- Check foreign key constraints
- Verify RLS policies are in place

## Next Steps

1. Integrate SMS service for production
2. Add rate limiting for OTP requests
3. Implement phone number change functionality
4. Add password reset via OTP
5. Consider adding 2FA for enhanced security

