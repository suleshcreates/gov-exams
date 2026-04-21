# Requirements Document

## Introduction

This feature implements a proper phone verification system for the DMLT Academy Exam Portal that validates Indian phone numbers, integrates with SMS gateway services for OTP delivery, and ensures secure authentication. The system replaces the current placeholder implementation that accepts any 10-digit number and logs OTP to console.

## Glossary

- **OTP**: One-Time Password - A 6-digit code sent via SMS for phone verification
- **SMS Gateway**: Third-party service provider for sending SMS messages (e.g., Twilio, MSG91, TextLocal)
- **Phone Validation**: Process of verifying that a phone number is valid and properly formatted
- **Indian Phone Number**: 10-digit mobile number starting with 6, 7, 8, or 9
- **Rate Limiting**: Mechanism to prevent abuse by limiting OTP requests per phone number
- **Portal**: The DMLT Academy Exam Portal application
- **Student**: A registered user of the Portal

## Requirements

### Requirement 1

**User Story:** As a student, I want the system to validate my phone number format before sending OTP, so that I don't waste time with invalid numbers.

#### Acceptance Criteria

1. WHEN a student enters a phone number, THE Portal SHALL validate that it is exactly 10 digits
2. THE Portal SHALL validate that the phone number starts with 6, 7, 8, or 9 (valid Indian mobile prefixes)
3. THE Portal SHALL reject phone numbers with invalid formats before attempting to send OTP
4. THE Portal SHALL display clear error messages for invalid phone number formats
5. THE Portal SHALL prevent form submission with invalid phone numbers

### Requirement 2

**User Story:** As a student, I want to receive OTP via SMS on my actual phone, so that I can verify my identity securely.

#### Acceptance Criteria

1. WHEN a student requests OTP, THE Portal SHALL send the OTP via SMS gateway to the provided phone number
2. THE Portal SHALL use a reliable SMS gateway service (MSG91, Twilio, or TextLocal)
3. THE Portal SHALL include the 6-digit OTP code in the SMS message
4. THE Portal SHALL include the application name and validity period in the SMS message
5. THE Portal SHALL confirm successful SMS delivery to the user

### Requirement 3

**User Story:** As a student, I want the system to prevent OTP spam, so that my phone is not flooded with messages.

#### Acceptance Criteria

1. THE Portal SHALL limit OTP requests to 3 attempts per phone number per hour
2. WHEN the rate limit is exceeded, THE Portal SHALL display a clear error message with wait time
3. THE Portal SHALL enforce a 60-second cooldown between consecutive OTP requests
4. THE Portal SHALL track OTP request attempts in the database
5. THE Portal SHALL reset the rate limit counter after the time window expires

### Requirement 4

**User Story:** As a student, I want my OTP to expire after a reasonable time, so that old codes cannot be misused.

#### Acceptance Criteria

1. THE Portal SHALL set OTP expiration time to 10 minutes from generation
2. WHEN a student enters an expired OTP, THE Portal SHALL reject it with an appropriate message
3. THE Portal SHALL mark used OTPs as invalid to prevent reuse
4. THE Portal SHALL automatically clean up expired OTPs from the database
5. THE Portal SHALL allow students to request a new OTP if the previous one expired

### Requirement 5

**User Story:** As a system administrator, I want to configure SMS gateway settings via environment variables, so that I can easily switch providers or update credentials.

#### Acceptance Criteria

1. THE Portal SHALL read SMS gateway API credentials from environment variables
2. THE Portal SHALL support configuration for multiple SMS providers (MSG91, Twilio, TextLocal)
3. THE Portal SHALL allow selection of SMS provider via environment variable
4. THE Portal SHALL validate that required environment variables are present before sending SMS
5. THE Portal SHALL provide clear error messages if SMS configuration is missing

### Requirement 6

**User Story:** As a student, I want to see clear feedback during the OTP process, so that I know what's happening at each step.

#### Acceptance Criteria

1. WHEN OTP is being sent, THE Portal SHALL display a loading indicator
2. WHEN OTP is sent successfully, THE Portal SHALL show a success message with the phone number
3. WHEN OTP sending fails, THE Portal SHALL display a specific error message
4. THE Portal SHALL show a countdown timer for the resend OTP button
5. THE Portal SHALL display remaining attempts when rate limit is approaching

### Requirement 7

**User Story:** As a developer, I want comprehensive error handling for SMS failures, so that users receive helpful feedback when issues occur.

#### Acceptance Criteria

1. WHEN SMS gateway returns an error, THE Portal SHALL log the error details for debugging
2. THE Portal SHALL display user-friendly error messages without exposing technical details
3. THE Portal SHALL handle network failures gracefully with retry suggestions
4. THE Portal SHALL handle invalid API credentials with appropriate error messages
5. THE Portal SHALL provide fallback instructions if SMS delivery fails repeatedly

### Requirement 8

**User Story:** As a student, I want the system to verify that my phone number is not already registered, so that I don't create duplicate accounts.

#### Acceptance Criteria

1. WHEN a student enters a phone number during signup, THE Portal SHALL check if it already exists
2. THE Portal SHALL prevent OTP sending if the phone number is already registered
3. THE Portal SHALL display a message directing existing users to the login page
4. THE Portal SHALL allow verified users to login without re-verification
5. THE Portal SHALL handle unverified accounts appropriately (allow re-verification)

### Requirement 9

**User Story:** As a system administrator, I want to monitor OTP usage and failures, so that I can identify and resolve issues quickly.

#### Acceptance Criteria

1. THE Portal SHALL log all OTP generation attempts with timestamps
2. THE Portal SHALL log SMS sending success and failure events
3. THE Portal SHALL track OTP verification attempts (success and failure)
4. THE Portal SHALL store rate limit violations for monitoring
5. THE Portal SHALL provide metrics on OTP delivery success rate
