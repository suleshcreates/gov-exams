# Phone Verification System Setup Guide

## Overview

The DMLT Academy Exam Portal now includes a production-ready phone verification system with:
- ✅ Indian phone number validation (10 digits, starts with 6/7/8/9)
- ✅ Real SMS integration (MSG91, Twilio, TextLocal)
- ✅ Rate limiting (3 attempts/hour, 60s cooldown)
- ✅ OTP expiration (10 minutes)
- ✅ Development mode (console logging)

## Quick Start

### Development Mode (No SMS Required)

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Leave SMS provider empty for dev mode:**
   ```env
   VITE_SMS_PROVIDER=
   ```

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Test signup:**
   - Enter any valid Indian phone number (e.g., 9876543210)
   - OTP will be logged to browser console
   - Copy OTP from console and verify

## Production Setup

### Option 1: MSG91 (Recommended for India)

1. **Sign up at [MSG91](https://msg91.com/)**

2. **Get your credentials:**
   - API Key
   - Sender ID (e.g., DMLTAC)
   - Template ID (optional)

3. **Update .env:**
   ```env
   VITE_SMS_PROVIDER=msg91
   VITE_MSG91_API_KEY=your_api_key_here
   VITE_MSG91_SENDER_ID=DMLTAC
   VITE_MSG91_TEMPLATE_ID=your_template_id
   ```

### Option 2: Twilio (Global)

1. **Sign up at [Twilio](https://www.twilio.com/)**

2. **Get your credentials:**
   - Account SID
   - Auth Token
   - Phone Number

3. **Update .env:**
   ```env
   VITE_SMS_PROVIDER=twilio
   VITE_TWILIO_ACCOUNT_SID=your_account_sid
   VITE_TWILIO_AUTH_TOKEN=your_auth_token
   VITE_TWILIO_PHONE_NUMBER=+1234567890
   ```

### Option 3: TextLocal (India)

1. **Sign up at [TextLocal](https://www.textlocal.in/)**

2. **Get your credentials:**
   - API Key
   - Sender ID

3. **Update .env:**
   ```env
   VITE_SMS_PROVIDER=textlocal
   VITE_TEXTLOCAL_API_KEY=your_api_key
   VITE_TEXTLOCAL_SENDER=DMLTAC
   ```

## Features

### Phone Number Validation

- Must be exactly 10 digits
- Must start with 6, 7, 8, or 9 (Indian mobile prefixes)
- Automatic formatting for display and SMS

### Rate Limiting

- **3 OTP requests per hour** per phone number
- **60-second cooldown** between consecutive requests
- Clear error messages with wait times
- Automatic reset after 1 hour

### OTP Security

- **6-digit random code**
- **10-minute expiration**
- **One-time use** (marked as used after verification)
- Automatic cleanup of expired OTPs (24 hours)

### Error Handling

- Invalid phone format detection
- Duplicate registration prevention
- SMS delivery failure handling
- Network error recovery
- Rate limit enforcement

## Testing

### Test Valid Phone Numbers

✅ Valid:
- 9876543210
- 8765432109
- 7654321098
- 6543210987

❌ Invalid:
- 1234567890 (doesn't start with 6/7/8/9)
- 98765 (too short)
- 98765432109 (too long)
- 5876543210 (starts with 5)

### Test Rate Limiting

1. Request OTP 3 times rapidly
2. 4th request should be blocked with error message
3. Wait 60 seconds between requests to test cooldown
4. Wait 1 hour to test rate limit reset

### Test OTP Expiration

1. Generate OTP
2. Wait 10+ minutes
3. Try to verify - should fail with "expired" message

## Console Logs

The system provides detailed logging for debugging:

```
[OTP] Starting OTP flow for phone: 9876****10
[OTP] Rate limit check passed. Remaining attempts: 2
[OTP] Generated and saved OTP for phone: 9876****10
[SMS] Sending OTP via MSG91 to +919876543210
[SMS] ✓ SMS sent successfully. Message ID: abc123
```

## Troubleshooting

### OTP not received

1. **Check console logs** for errors
2. **Verify SMS provider credentials** in .env
3. **Check phone number format** (must be valid Indian number)
4. **Verify SMS provider balance** (if using paid service)

### Rate limit errors

- Wait for the specified time in the error message
- Rate limits reset after 1 hour
- Cooldown period is 60 seconds between requests

### SMS gateway errors

- **MSG91**: Check API key and template ID
- **Twilio**: Verify Account SID, Auth Token, and phone number
- **TextLocal**: Confirm API key is valid

### Development mode not working

- Ensure `VITE_SMS_PROVIDER` is empty or not set in .env
- Check browser console for OTP logs
- Restart dev server after .env changes

## Architecture

```
Phone Input
    ↓
Validation (Indian format)
    ↓
Duplicate Check
    ↓
Rate Limit Check
    ↓
Generate OTP
    ↓
Save to Database
    ↓
Send SMS (via gateway)
    ↓
User Enters OTP
    ↓
Verify & Mark Used
    ↓
Account Verified
```

## Database Schema

The system uses the existing `otp_verifications` table:

```sql
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY,
  phone VARCHAR(20),
  otp_code VARCHAR(6),
  expires_at TIMESTAMP,
  is_used BOOLEAN,
  created_at TIMESTAMP
);
```

## Security Best Practices

1. **Never log OTP in production** (only in dev mode)
2. **Use HTTPS** for all API calls
3. **Rotate SMS API keys** regularly
4. **Monitor rate limit violations**
5. **Set up alerts** for SMS delivery failures
6. **Keep environment variables secure**

## Cost Optimization

- Use development mode for testing (free)
- Set appropriate rate limits to prevent abuse
- Clean up expired OTPs regularly
- Monitor SMS usage and costs
- Consider bulk SMS plans for production

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Verify environment configuration
3. Test with development mode first
4. Review SMS provider documentation

## Next Steps

1. ✅ Test in development mode
2. ✅ Choose SMS provider
3. ✅ Configure credentials
4. ✅ Test with real phone numbers
5. ✅ Monitor delivery rates
6. ✅ Set up production alerts

---

**Built with:** React + TypeScript + Supabase + SMS Gateways
**Version:** 1.0.0
**Last Updated:** 2025-01-27
