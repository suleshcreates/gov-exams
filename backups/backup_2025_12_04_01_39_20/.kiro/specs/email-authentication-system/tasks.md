# Implementation Plan

- [ ] 1. Update database schema for email authentication
  - Modify students table to use email and username instead of phone
  - Update foreign keys in related tables (exam_results, exam_progress, user_plans)
  - Create indexes for email and username
  - Add auth_user_id column for Supabase Auth integration
  - _Requirements: 1.1, 1.2, 7.4, 7.5_

- [ ] 1.1 Create database migration SQL script
  - Write SQL to add email and username columns
  - Write SQL to add auth_user_id column
  - Write SQL to update foreign keys in related tables
  - Write SQL to create indexes
  - _Requirements: 1.1, 1.2_

- [ ] 1.2 Execute database migration
  - Run migration script in Supabase SQL editor
  - Verify all columns and indexes created
  - Test foreign key constraints
  - _Requirements: 1.1, 1.2_

- [ ] 2. Create username validation module
  - Create usernameValidation.ts with validation logic
  - Implement username format validation (3-20 chars, alphanumeric + underscore)
  - Implement email format validation
  - Export validation functions and interfaces
  - _Requirements: 1.2, 8.1, 8.2, 8.3_

- [ ] 2.1 Create usernameValidation.ts file
  - Create new file at src/lib/usernameValidation.ts
  - Define UsernameValidationResult interface
  - _Requirements: 8.1_

- [ ] 2.2 Implement validateUsername function
  - Check length (3-20 characters)
  - Check format (alphanumeric and underscores only)
  - Check cannot start/end with underscore
  - Check no consecutive underscores
  - Return validation result with error messages
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 2.3 Implement validateEmail function
  - Check email format using regex
  - Return validation result with error message
  - _Requirements: 1.2_

- [ ] 3. Update Supabase service with email authentication methods
  - Add username availability check
  - Add email availability check
  - Add create student with Supabase Auth
  - Add login with email or username
  - Add email verification methods
  - Add password reset methods
  - _Requirements: 1.2, 1.3, 4.1, 4.2, 6.2, 6.3, 7.1, 7.2, 9.2, 9.3_

- [ ] 3.1 Add username and email availability checks
  - Implement isUsernameAvailable method
  - Implement isEmailAvailable method
  - Query students table for uniqueness
  - _Requirements: 1.2, 8.3_

- [ ] 3.2 Implement createStudentWithAuth method
  - Create Supabase Auth user with signUp
  - Pass user metadata (name, username)
  - Set email redirect URL for verification
  - Create student record in students table
  - Link auth_user_id to Supabase Auth user
  - _Requirements: 1.5, 2.1, 2.2, 7.1, 7.2, 7.4, 7.5_

- [ ] 3.3 Implement getStudentByEmailOrUsername method
  - Query students table with OR condition
  - Support both email and username lookup
  - Return student data or null
  - _Requirements: 4.1_

- [ ] 3.4 Implement loginWithEmailOrUsername method
  - Get student by email or username
  - Use student's email for Supabase Auth login
  - Return user and student data
  - _Requirements: 4.1, 4.2_

- [ ] 3.5 Implement email verification methods
  - Add updateEmailVerification method
  - Add resendVerificationEmail method using Supabase Auth
  - _Requirements: 2.5, 3.1, 3.2, 6.2, 6.3_

- [ ] 3.6 Implement password reset methods
  - Add requestPasswordReset method
  - Add updatePassword method
  - Use Supabase Auth password reset flow
  - _Requirements: 9.2, 9.3, 9.4, 9.5_

- [ ] 4. Update AuthContext for email authentication
  - Update User type to use email and username
  - Implement Supabase Auth session management
  - Update signup method for email/username
  - Update login method to accept email or username
  - Add resendVerification method
  - Add requestPasswordReset method
  - Listen for Supabase Auth state changes
  - _Requirements: 1.1, 2.1, 4.1, 4.2, 4.3, 6.1, 6.2, 9.1, 9.2_

- [ ] 4.1 Update AuthContext types and state
  - Change User type from phone to email/username
  - Update AuthState interface
  - Update AuthContextType interface
  - _Requirements: 1.1, 4.1_

- [ ] 4.2 Implement Supabase Auth session management
  - Check for existing session on mount
  - Listen for auth state changes
  - Update auth state on sign in/out
  - Verify email_verified status
  - _Requirements: 4.3, 7.3_

- [ ] 4.3 Update signup method
  - Accept name, username, email, password
  - Call supabaseService.createStudentWithAuth
  - Handle errors appropriately
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 4.4 Update login method
  - Accept identifier (email or username) and password
  - Call supabaseService.loginWithEmailOrUsername
  - Check email_verified status
  - Throw specific error for unverified email
  - Update auth state on success
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1_

- [ ] 4.5 Add resendVerification method
  - Call supabaseService.resendVerificationEmail
  - Handle errors
  - _Requirements: 6.2, 6.3_

- [ ] 4.6 Add requestPasswordReset method
  - Call supabaseService.requestPasswordReset
  - Handle errors
  - _Requirements: 9.2_

- [ ] 5. Update Signup page for email/username registration
  - Replace phone field with email and username fields
  - Add real-time username availability checking
  - Add email format validation
  - Update form validation logic
  - Remove OTP verification step
  - Show "check your email" message after signup
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.4, 8.1, 8.2, 8.3, 8.4_

- [ ] 5.1 Update Signup form fields
  - Remove phone number field
  - Add email field with validation
  - Add username field with validation
  - Update form state
  - _Requirements: 1.1, 1.2_

- [ ] 5.2 Implement real-time username validation
  - Add debounced username availability check
  - Show availability indicator (checkmark/x)
  - Display validation errors in real-time
  - _Requirements: 8.3, 8.4_

- [ ] 5.3 Update form submission logic
  - Remove OTP sending logic
  - Call signup with email and username
  - Show success message with email verification instructions
  - Redirect to login page
  - _Requirements: 1.5, 2.1, 2.4_

- [ ] 6. Update Login page for email/username login
  - Change phone field to email/username field
  - Update login logic to accept either identifier
  - Add error handling for unverified email
  - Add "Resend Verification Email" option
  - Add "Forgot Password" link
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.5, 6.1, 9.1_

- [ ] 6.1 Update Login form
  - Change label to "Email or Username"
  - Update input field placeholder
  - Remove phone number validation
  - _Requirements: 4.1_

- [ ] 6.2 Update login submission logic
  - Call login with identifier (email or username)
  - Handle unverified email error specifically
  - Show appropriate error messages
  - _Requirements: 4.2, 4.3, 5.1, 5.2, 5.3_

- [ ] 6.3 Add resend verification option
  - Show "Resend Verification Email" button for unverified accounts
  - Prompt for email address
  - Call resendVerification method
  - Show success/error toast
  - _Requirements: 5.1, 6.1, 6.2_

- [ ] 6.4 Add forgot password link
  - Add "Forgot Password?" link below login button
  - Link to /forgot-password route
  - _Requirements: 9.1_

- [ ] 7. Create Email Verification page
  - Create new VerifyEmail.tsx page
  - Handle Supabase Auth verification callback
  - Update student email_verified status
  - Show verification status (success/error)
  - Redirect to login after successful verification
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 7.1 Create VerifyEmail.tsx file
  - Create new file at src/pages/VerifyEmail.tsx
  - Set up component structure
  - Add status state (verifying/success/error)
  - _Requirements: 3.1_

- [ ] 7.2 Implement verification logic
  - Check Supabase Auth session on mount
  - Update student email_verified in database
  - Set status based on result
  - Auto-redirect to login after 3 seconds on success
  - _Requirements: 3.2, 3.3, 3.4_

- [ ] 7.3 Build verification UI
  - Show loading spinner during verification
  - Show success message with checkmark
  - Show error message with retry option
  - Add manual "Go to Login" button
  - _Requirements: 3.3, 3.4, 3.5_

- [ ] 8. Create Forgot Password page
  - Create new ForgotPassword.tsx page
  - Add email input form
  - Send password reset email via Supabase Auth
  - Show confirmation message
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 8.1 Create ForgotPassword.tsx file
  - Create new file at src/pages/ForgotPassword.tsx
  - Set up form with email field
  - Add loading and success states
  - _Requirements: 9.1_

- [ ] 8.2 Implement password reset request
  - Validate email format
  - Call requestPasswordReset method
  - Show success message
  - Provide link back to login
  - _Requirements: 9.2, 9.3_

- [ ] 9. Create Reset Password page
  - Create new ResetPassword.tsx page
  - Handle Supabase Auth reset callback
  - Add new password form
  - Update password via Supabase Auth
  - Redirect to login after success
  - _Requirements: 9.3, 9.4, 9.5_

- [ ] 9.1 Create ResetPassword.tsx file
  - Create new file at src/pages/ResetPassword.tsx
  - Set up form with password fields
  - Add password strength indicator
  - _Requirements: 9.3_

- [ ] 9.2 Implement password update logic
  - Validate new password
  - Confirm password match
  - Call updatePassword method
  - Show success message and redirect
  - _Requirements: 9.4, 9.5_

- [ ] 10. Update App.tsx with new routes
  - Add /verify-email route
  - Add /forgot-password route
  - Add /reset-password route
  - Remove phone-related routes if any
  - _Requirements: 3.1, 9.1, 9.3_

- [ ] 10.1 Add new routes to App.tsx
  - Import new page components
  - Add Route for VerifyEmail
  - Add Route for ForgotPassword
  - Add Route for ResetPassword
  - _Requirements: 3.1, 9.1, 9.3_

- [ ] 11. Configure Supabase Auth settings
  - Set up email templates in Supabase dashboard
  - Configure redirect URLs
  - Enable email confirmation
  - Test email delivery
  - _Requirements: 2.1, 2.2, 7.2, 7.3, 9.2_

- [ ] 11.1 Configure email templates
  - Customize "Confirm Signup" template
  - Customize "Reset Password" template
  - Add branding and styling
  - _Requirements: 2.1, 2.2, 9.2_

- [ ] 11.2 Configure Auth settings
  - Set Site URL
  - Add redirect URLs for verify-email and reset-password
  - Enable email confirmation
  - Set token expiry times
  - _Requirements: 2.3, 7.3, 9.3_

- [ ] 12. Update Profile page to show email and username
  - Replace phone display with email
  - Add username display
  - Update any phone references
  - _Requirements: 1.1_

- [ ] 12.1 Update Profile.tsx
  - Change phone field to email
  - Add username field
  - Update user data display
  - _Requirements: 1.1_

- [ ] 13. Remove phone-based authentication code
  - Delete phone validation module
  - Delete SMS gateway modules
  - Delete rate limiter module
  - Delete OTP service
  - Clean up unused imports
  - _Requirements: All (cleanup)_

- [ ] 13.1 Delete phone-related files
  - Delete src/lib/phoneValidation.ts
  - Delete src/lib/smsGateways/ directory
  - Delete src/lib/rateLimiter.ts
  - Delete src/lib/otpService.ts
  - _Requirements: All (cleanup)_

- [ ] 13.2 Clean up environment variables
  - Remove SMS provider variables from .env
  - Update .env.example
  - Document new Supabase Auth requirements
  - _Requirements: All (cleanup)_

- [ ] 14. Test email authentication system
  - Test signup with email and username
  - Test email verification flow
  - Test login with email
  - Test login with username
  - Test unverified email error
  - Test resend verification email
  - Test forgot password flow
  - Test reset password flow
  - _Requirements: All_

- [ ] 14.1 Test signup and verification
  - Sign up with new email and username
  - Check email for verification link
  - Click verification link
  - Verify account is marked as verified
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 3.1, 3.2, 3.3_

- [ ] 14.2 Test login functionality
  - Login with email and password
  - Login with username and password
  - Verify session is created
  - Test invalid credentials error
  - Test unverified email error
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3_

- [ ] 14.3 Test resend verification
  - Attempt login with unverified account
  - Click "Resend Verification Email"
  - Check email for new verification link
  - Verify link works
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 14.4 Test password reset
  - Click "Forgot Password"
  - Enter email address
  - Check email for reset link
  - Click reset link
  - Set new password
  - Login with new password
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 14.5 Test username validation
  - Test various invalid username formats
  - Test username availability checking
  - Test duplicate username prevention
  - Verify real-time validation feedback
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
