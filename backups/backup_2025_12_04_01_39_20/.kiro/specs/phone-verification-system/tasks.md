# Implementation Plan

- [x] 1. Create phone validation module


  - Create phoneValidation.ts with Indian phone number validation
  - Implement validation logic for 10-digit numbers starting with 6/7/8/9
  - Add phone formatting functions for display and SMS
  - Export validation result interface
  - _Requirements: 1.1, 1.2, 1.3_



- [ ] 1.1 Create phoneValidation.ts file
  - Create new file at src/lib/phoneValidation.ts
  - Define PhoneValidationResult interface

  - _Requirements: 1.1_

- [ ] 1.2 Implement validateIndianPhone function
  - Write validation logic for 10-digit format
  - Check first digit is 6, 7, 8, or 9

  - Return validation result with error messages
  - _Requirements: 1.1, 1.2, 1.3, 1.4_



- [ ] 1.3 Implement phone formatting functions
  - Write formatPhoneDisplay for UI display
  - Write formatPhoneForSMS with country code (+91)
  - _Requirements: 2.1_



- [ ] 2. Create SMS gateway infrastructure
  - Create SMS gateway interfaces and factory pattern
  - Define common types for all gateways
  - Implement gateway selection logic


  - _Requirements: 2.2, 5.1, 5.2, 5.3_

- [ ] 2.1 Create SMS gateway interfaces
  - Create src/lib/smsGateways/index.ts
  - Define ISMSGateway interface
  - Define SMSGatewayConfig and SMSResponse interfaces


  - Implement createSMSGateway factory function
  - _Requirements: 5.2, 5.3_

- [x] 3. Implement MSG91 SMS gateway

  - Create MSG91Gateway class implementing ISMSGateway
  - Integrate with MSG91 API for sending OTP
  - Handle API responses and errors
  - Read configuration from environment variables
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 5.2_



- [ ] 3.1 Create MSG91 gateway file
  - Create src/lib/smsGateways/msg91.ts
  - Define MSG91Gateway class
  - Set up constructor with environment variables
  - _Requirements: 5.1, 5.2_


- [ ] 3.2 Implement MSG91 sendOTP method
  - Write API call to MSG91 flow endpoint
  - Format request with OTP and phone number
  - Parse response and return SMSResponse

  - Handle errors and network failures
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.1, 7.2_

- [ ] 4. Implement Twilio SMS gateway
  - Create TwilioGateway class implementing ISMSGateway


  - Integrate with Twilio API for sending OTP
  - Handle API responses and errors
  - Read configuration from environment variables
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 5.2_

- [x] 4.1 Create Twilio gateway file

  - Create src/lib/smsGateways/twilio.ts
  - Define TwilioGateway class
  - Set up constructor with environment variables
  - _Requirements: 5.1, 5.2_


- [ ] 4.2 Implement Twilio sendOTP method
  - Write API call to Twilio Messages endpoint
  - Format request with Basic auth and parameters
  - Parse response and return SMSResponse
  - Handle errors and network failures


  - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.1, 7.2_

- [ ] 5. Implement TextLocal SMS gateway
  - Create TextLocalGateway class implementing ISMSGateway
  - Integrate with TextLocal API for sending OTP
  - Handle API responses and errors

  - Read configuration from environment variables
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 5.2_

- [ ] 5.1 Create TextLocal gateway file
  - Create src/lib/smsGateways/textlocal.ts

  - Define TextLocalGateway class
  - Set up constructor with environment variables
  - _Requirements: 5.1, 5.2_

- [ ] 5.2 Implement TextLocal sendOTP method
  - Write API call to TextLocal send endpoint

  - Format request with API key and parameters
  - Parse response and return SMSResponse
  - Handle errors and network failures

  - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.1, 7.2_

- [ ] 6. Create rate limiter module
  - Implement rate limiting logic for OTP requests
  - Check hourly attempt limits (3 per hour)
  - Enforce cooldown period (60 seconds)
  - Query database for attempt history
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6.1 Create rateLimiter.ts file
  - Create src/lib/rateLimiter.ts
  - Define RateLimitResult interface
  - Define rate limit constants
  - _Requirements: 3.1_

- [ ] 6.2 Implement checkRateLimit function
  - Query otp_verifications table for recent attempts
  - Check if hourly limit (3 attempts) exceeded
  - Check if cooldown period (60s) active
  - Return rate limit result with error messages
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6.3 Implement cleanupExpiredOTPs function
  - Delete OTP records older than 24 hours
  - Run cleanup to maintain database performance
  - _Requirements: 4.4_

- [x] 7. Update OTP service with SMS integration

  - Update otpService.ts to use SMS gateways
  - Integrate rate limiting checks
  - Add proper error handling and logging
  - Support development mode (console logging)
  - _Requirements: 2.1, 2.2, 2.5, 3.1, 4.1, 5.4, 7.1, 7.2, 7.3, 9.1, 9.2, 9.3_

- [x] 7.1 Update sendOTPSMS function

  - Use createSMSGateway factory to get provider
  - Format phone number for SMS
  - Call gateway sendOTP method
  - Handle development mode (log to console)
  - Log success and failure events
  - _Requirements: 2.1, 2.2, 2.5, 5.3, 5.4, 7.1, 7.2, 9.1, 9.2_

- [x] 7.2 Update sendOTP function

  - Add rate limit check before sending OTP
  - Return rate limit errors to caller
  - Include remaining attempts in response
  - Handle SMS gateway failures
  - _Requirements: 3.1, 3.2, 3.3, 7.1, 7.2, 7.3_

- [x] 7.3 Update verifyOTP function

  - Ensure OTP expiry check works correctly
  - Mark OTP as used after verification
  - Log verification attempts
  - _Requirements: 4.1, 4.2, 4.3, 9.3_

- [x] 8. Update Signup page with enhanced validation


  - Integrate phone validation before OTP request
  - Display validation errors clearly
  - Show rate limit messages and remaining attempts
  - Improve error handling for SMS failures
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.2, 6.1, 6.2, 6.3, 6.4, 6.5, 7.2, 7.3, 8.1, 8.2, 8.3_

- [x] 8.1 Add phone validation to handleSendOTP

  - Import validateIndianPhone function
  - Validate phone before checking database
  - Display specific validation error messages
  - Use formatted phone number for all operations
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 8.2 Update OTP sending logic

  - Handle rate limit errors from sendOTP
  - Display remaining attempts to user
  - Show appropriate error messages for SMS failures
  - Disable send button during rate limit cooldown
  - _Requirements: 3.2, 6.2, 6.3, 7.2, 7.3_

- [x] 8.3 Enhance duplicate phone check

  - Check for verified accounts and show login message
  - Allow re-verification for unverified accounts
  - Display clear messages for each scenario
  - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [x] 8.4 Update OTP verification UI

  - Show phone number in formatted display
  - Display clear error for expired OTP
  - Show clear error for invalid OTP
  - Improve resend OTP button with countdown
  - _Requirements: 4.1, 4.2, 4.5, 6.4_

- [x] 9. Create environment configuration template


  - Create .env.example file with all SMS provider options
  - Document required variables for each provider
  - Add comments explaining each configuration
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 9.1 Create .env.example file

  - Create file in project root
  - Add SMS provider selection variable
  - Add MSG91 configuration variables
  - Add Twilio configuration variables (commented)
  - Add TextLocal configuration variables (commented)
  - Add helpful comments for each section
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 10. Add error logging and monitoring

  - Add comprehensive logging for OTP operations
  - Log SMS gateway responses
  - Track rate limit violations
  - Log verification attempts
  - _Requirements: 7.1, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 10.1 Add logging to OTP service

  - Log OTP generation with timestamp
  - Log SMS sending attempts and results
  - Log verification attempts (success/failure)
  - Include phone number (masked) in logs
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 10.2 Add logging to rate limiter

  - Log rate limit checks
  - Log rate limit violations with details
  - Track cooldown period violations
  - _Requirements: 9.4_

- [x] 11. Update AuthContext with better error handling


  - Improve error messages in verifyOTP
  - Handle network failures gracefully
  - Provide user-friendly error feedback
  - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [x] 11.1 Update verifyOTP in AuthContext

  - Add try-catch for network errors
  - Provide specific error messages
  - Handle expired OTP scenario
  - Handle invalid OTP scenario
  - _Requirements: 4.1, 4.2, 7.2, 7.3_

- [x] 12. Test phone verification system



  - Test phone validation with various formats
  - Test SMS sending with real phone numbers
  - Test rate limiting functionality
  - Test OTP expiration
  - Test error handling scenarios
  - _Requirements: All_

- [x] 12.1 Test phone validation

  - Test valid Indian phone numbers (starting with 6/7/8/9)
  - Test invalid formats (wrong length, wrong prefix)
  - Test phone formatting functions
  - Verify error messages are clear
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 12.2 Test SMS gateway integration

  - Configure SMS provider credentials
  - Test OTP sending to real phone number
  - Verify SMS message format and content
  - Test with different SMS providers
  - Verify development mode works (console logging)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 12.3 Test rate limiting

  - Send 3 OTP requests rapidly
  - Verify 4th request is blocked
  - Test cooldown period (60 seconds)
  - Verify rate limit resets after 1 hour
  - Check error messages are displayed correctly
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 12.4 Test OTP expiration and verification

  - Generate OTP and wait 10+ minutes
  - Verify expired OTP is rejected
  - Test valid OTP verification
  - Test invalid OTP rejection
  - Verify OTP cannot be reused
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 12.5 Test duplicate phone prevention

  - Attempt signup with existing verified phone
  - Verify appropriate error message
  - Test with unverified phone number
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 12.6 Test error handling

  - Test with invalid SMS credentials
  - Test with network disconnected
  - Test with malformed phone numbers
  - Verify all error messages are user-friendly
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
