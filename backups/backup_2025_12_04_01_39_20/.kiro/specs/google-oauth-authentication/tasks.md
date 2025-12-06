# Implementation Plan

- [x] 1. Update database schema for Google OAuth support


  - Add auth_user_id column to students table with foreign key to auth.users
  - Add avatar_url column for Google profile pictures
  - Make password_hash, username, and phone columns nullable
  - Create index on auth_user_id for performance
  - Create database trigger to auto-create student records on new auth user
  - _Requirements: 1.3, 2.2, 5.1_



- [ ] 2. Configure Google OAuth in Supabase
  - Document steps to enable Google provider in Supabase dashboard
  - Document steps to create Google Cloud OAuth credentials
  - Document redirect URL configuration for development and production

  - Create setup guide file with all configuration steps


  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 3. Update AuthContext to use Supabase Auth
  - [ ] 3.1 Remove custom authentication logic
    - Remove bcrypt password hashing code

    - Remove custom login function with email/password
    - Remove custom signup function with password
    - Remove localStorage-based session management
    - _Requirements: 4.1, 4.2, 4.3, 6.4_
  
  - [ ] 3.2 Implement Supabase Auth integration
    - Add signInWithGoogle function using supabase.auth.signInWithOAuth()
    - Add session initialization using supabase.auth.getSession()

    - Add auth state listener using supabase.auth.onAuthStateChange()
    - Add signOut function using supabase.auth.signOut()
    - Add loadUserProfile function to fetch student data by auth_user_id
    - Update User interface to include id and avatar_url
    - _Requirements: 2.5, 6.1, 6.2, 8.1, 8.2, 8.3, 8.4, 8.5_
  

  - [x] 3.3 Add profile update functionality


    - Create updateProfile function to update username and phone
    - Add validation for username uniqueness
    - Add validation for phone format
    - Update student record in database
    - Refresh user state after update
    - _Requirements: 3.3, 3.4_


- [ ] 4. Create Profile Completion page
  - [ ] 4.1 Build ProfileCompletion component
    - Create new page at /complete-profile route
    - Add form with username and phone fields
    - Add real-time validation for username and phone


    - Add loading and error states
    - Redirect to home if profile already complete
    - _Requirements: 3.1, 3.2_
  
  - [ ] 4.2 Implement form validation and submission
    - Validate username is 3+ characters and alphanumeric
    - Validate phone is exactly 10 digits

    - Check username uniqueness against database


    - Call updateProfile from AuthContext on submit
    - Show success message and redirect to home
    - _Requirements: 3.3, 3.4, 3.5_

- [x] 5. Create Auth Callback handler

  - Create AuthCallback component at /auth/callback route
  - Check authentication status on mount
  - Redirect to /complete-profile if username or phone missing
  - Redirect to home if profile complete
  - Show loading state during check


  - Handle errors and redirect to login on failure
  - _Requirements: 1.4, 2.3, 2.4_

- [ ] 6. Update Login page for Google OAuth
  - [ ] 6.1 Replace email/password form with Google button
    - Remove email and password input fields

    - Add "Sign in with Google" button with Google branding
    - Add Google logo image or icon
    - Style button to match Google's design guidelines
    - _Requirements: 2.1, 7.5_
  
  - [ ] 6.2 Implement Google sign-in handler
    - Add click handler that calls signInWithGoogle from AuthContext
    - Add loading state during OAuth flow
    - Display error messages if OAuth fails
    - Show redirect message when navigating to Google
    - _Requirements: 2.1, 7.1, 7.2, 7.3_

- [ ] 7. Update Signup page for Google OAuth
  - Replace registration form with Google sign-up button
  - Add explanation that additional info will be collected after Google sign-in
  - Use same Google button styling as Login page
  - Add click handler for Google OAuth
  - Add loading and error states
  - _Requirements: 1.1, 7.5_

- [x] 8. Update routing configuration

  - Add /complete-profile route for ProfileCompletion component
  - Add /auth/callback route for AuthCallback component
  - Ensure protected routes check Supabase Auth session
  - Update route guards to use new auth state
  - _Requirements: 1.4, 2.3_

- [x] 9. Remove bcrypt dependency


  - Remove bcrypt from package.json
  - Run npm uninstall bcryptjs
  - Remove @types/bcryptjs if installed
  - Verify no remaining imports of bcrypt in codebase
  - _Requirements: 4.2_

- [x] 10. Update admin authentication


  - Update admin auth to check for admin role in Supabase Auth
  - Ensure admin users can also use Google OAuth
  - Update AdminAuthContext to use Supabase Auth sessions
  - Test admin login flow with Google OAuth
  - _Requirements: 2.2, 8.5_

- [x] 11. Add error boundary for auth errors


  - Create error boundary component for authentication errors
  - Wrap auth-dependent components with error boundary
  - Display user-friendly error messages
  - Provide retry and logout options
  - _Requirements: 7.2_

- [x] 12. Add loading states and transitions



  - Add skeleton loaders for auth state initialization
  - Add smooth transitions between auth states
  - Add loading spinner during OAuth redirect
  - Add progress indicator for profile completion
  - _Requirements: 7.1, 7.3, 7.4_
