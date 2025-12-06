# Requirements Document

## Introduction

This feature implements an email-based authentication system for the DMLT Academy Exam Portal that allows students to register with email and username, verify their email address, and login using either email or username. This replaces the current phone-based authentication system.

## Glossary

- **Email Verification**: Process of confirming a user's email address by sending a verification link or code
- **Username**: Unique identifier chosen by the user for login (alphanumeric, 3-20 characters)
- **Email**: User's email address used for authentication and communication
- **Verification Token**: Unique token sent via email to verify email ownership
- **Portal**: The DMLT Academy Exam Portal application
- **Student**: A registered user of the Portal

## Requirements

### Requirement 1

**User Story:** As a student, I want to register with my email and username, so that I can create an account without providing my phone number.

#### Acceptance Criteria

1. WHEN a student visits the signup page, THE Portal SHALL display fields for name, username, email, and password
2. THE Portal SHALL validate that the username is unique and follows format rules (3-20 alphanumeric characters, underscores allowed)
3. THE Portal SHALL validate that the email is in proper format and is unique
4. THE Portal SHALL validate that the password meets minimum requirements (6+ characters)
5. THE Portal SHALL create an unverified account upon successful form submission

### Requirement 2

**User Story:** As a student, I want to receive an email verification link, so that I can verify my email address.

#### Acceptance Criteria

1. WHEN a student completes signup, THE Portal SHALL send a verification email to the provided address
2. THE Portal SHALL include a unique verification link in the email
3. THE Portal SHALL set the verification link to expire after 24 hours
4. THE Portal SHALL display a message instructing the user to check their email
5. THE Portal SHALL allow users to resend the verification email if needed

### Requirement 3

**User Story:** As a student, I want to verify my email by clicking a link, so that I can activate my account easily.

#### Acceptance Criteria

1. WHEN a student clicks the verification link, THE Portal SHALL validate the token
2. THE Portal SHALL mark the account as verified if the token is valid and not expired
3. THE Portal SHALL redirect to login page with success message after verification
4. THE Portal SHALL display an error message if the token is invalid or expired
5. THE Portal SHALL provide option to resend verification email if token expired

### Requirement 4

**User Story:** As a student, I want to login with either my email or username, so that I have flexibility in how I access my account.

#### Acceptance Criteria

1. WHEN a student enters credentials, THE Portal SHALL accept either email or username in the login field
2. THE Portal SHALL verify the password against the stored hash
3. THE Portal SHALL only allow login for verified accounts
4. THE Portal SHALL display appropriate error messages for unverified accounts
5. THE Portal SHALL create a session upon successful login

### Requirement 5

**User Story:** As a student, I want clear error messages during login, so that I know why login failed.

#### Acceptance Criteria

1. WHEN login fails due to unverified email, THE Portal SHALL display "Please verify your email" with resend option
2. WHEN login fails due to incorrect credentials, THE Portal SHALL display "Invalid email/username or password"
3. WHEN login fails due to account not found, THE Portal SHALL display "Invalid email/username or password"
4. THE Portal SHALL not reveal whether an email/username exists for security reasons
5. THE Portal SHALL provide a "Resend Verification Email" option for unverified accounts

### Requirement 6

**User Story:** As a student, I want to resend the verification email, so that I can verify my account if I didn't receive the original email.

#### Acceptance Criteria

1. THE Portal SHALL provide a "Resend Verification Email" button on the login page
2. WHEN a student requests resend, THE Portal SHALL prompt for email address
3. THE Portal SHALL send a new verification email with a new token
4. THE Portal SHALL invalidate previous verification tokens for that email
5. THE Portal SHALL limit resend requests to prevent abuse (3 per hour)

### Requirement 7

**User Story:** As a developer, I want to use Supabase Auth for email verification, so that I can leverage built-in security features.

#### Acceptance Criteria

1. THE Portal SHALL use Supabase Auth for email verification and authentication
2. THE Portal SHALL configure Supabase email templates for verification emails
3. THE Portal SHALL handle Supabase Auth callbacks for email verification
4. THE Portal SHALL store additional user data (username, name) in the students table
5. THE Portal SHALL sync Supabase Auth users with the students table

### Requirement 8

**User Story:** As a student, I want my username to be unique and properly formatted, so that I can be uniquely identified in the system.

#### Acceptance Criteria

1. THE Portal SHALL validate username is 3-20 characters long
2. THE Portal SHALL allow only alphanumeric characters and underscores in usernames
3. THE Portal SHALL check username uniqueness before account creation
4. THE Portal SHALL display real-time validation feedback for username
5. THE Portal SHALL prevent username changes after account creation

### Requirement 9

**User Story:** As a student, I want password reset functionality via email, so that I can recover my account if I forget my password.

#### Acceptance Criteria

1. THE Portal SHALL provide a "Forgot Password" link on the login page
2. WHEN a student requests password reset, THE Portal SHALL send a reset link via email
3. THE Portal SHALL set the reset link to expire after 1 hour
4. THE Portal SHALL allow the student to set a new password using the reset link
5. THE Portal SHALL invalidate the reset link after successful password change
