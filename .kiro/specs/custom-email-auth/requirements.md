# Custom Email Authentication System - Requirements

## Introduction

Replace the broken Supabase Auth system with a custom email-based authentication that uses password hashing and EmailJS for verification. The system SHALL collect phone numbers but SHALL NOT require phone verification.

## Glossary

- **Authentication System**: Custom login system using email and password without Supabase Auth
- **Email Verification**: Process of verifying user email using verification codes sent via EmailJS
- **Password Hashing**: Secure password storage using bcrypt
- **Student Record**: Database entry with email, password hash, phone, and verification status

## Requirements

### Requirement 1: User Registration

**User Story:** As a new user, I want to sign up with email, password, and phone number, so that I can create an account.

#### Acceptance Criteria

1. WHEN a user submits the signup form, THE Authentication System SHALL validate email format, password strength, and phone number format
2. WHEN a user provides valid credentials, THE Authentication System SHALL hash the password using bcrypt and store it in the database
3. THE Authentication System SHALL store email, password hash, phone number, name, and username in the students table
4. WHEN signup is successful, THE Authentication System SHALL send a verification email with a 6-digit code via EmailJS
5. THE Authentication System SHALL set email_verified to false until verification is complete

### Requirement 2: Email Verification

**User Story:** As a registered user, I want to verify my email address, so that I can access the platform.

#### Acceptance Criteria

1. WHEN a user signs up, THE Authentication System SHALL generate a 6-digit verification code
2. THE Authentication System SHALL send the verification code to the user's email via EmailJS
3. WHEN a user enters the correct verification code, THE Authentication System SHALL set email_verified to true
4. WHEN a user enters an incorrect code, THE Authentication System SHALL display an error message
5. THE Authentication System SHALL allow users to resend the verification code with a 60-second cooldown

### Requirement 3: User Login

**User Story:** As a registered user, I want to log in with my email and password, so that I can access my account.

#### Acceptance Criteria

1. WHEN a user submits login credentials, THE Authentication System SHALL query the students table by email
2. THE Authentication System SHALL compare the provided password with the stored hash using bcrypt
3. WHEN credentials are valid and email is verified, THE Authentication System SHALL create a session
4. WHEN credentials are valid but email is not verified, THE Authentication System SHALL redirect to verification page
5. WHEN credentials are invalid, THE Authentication System SHALL display an error message

### Requirement 4: Password Reset

**User Story:** As a user who forgot their password, I want to reset it via email, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN a user requests password reset, THE Authentication System SHALL send a reset code to their email via EmailJS
2. THE Authentication System SHALL generate a unique 6-digit reset code valid for 15 minutes
3. WHEN a user enters the correct reset code, THE Authentication System SHALL allow them to set a new password
4. THE Authentication System SHALL hash the new password and update the database
5. THE Authentication System SHALL invalidate the reset code after successful password change

### Requirement 5: Session Management

**User Story:** As a logged-in user, I want my session to persist across page refreshes, so that I don't have to log in repeatedly.

#### Acceptance Criteria

1. WHEN a user logs in successfully, THE Authentication System SHALL store session data in localStorage
2. THE Authentication System SHALL include user email, name, username, and verification status in the session
3. WHEN a user refreshes the page, THE Authentication System SHALL restore the session from localStorage
4. WHEN a user logs out, THE Authentication System SHALL clear the session from localStorage
5. THE Authentication System SHALL validate the session on protected routes
