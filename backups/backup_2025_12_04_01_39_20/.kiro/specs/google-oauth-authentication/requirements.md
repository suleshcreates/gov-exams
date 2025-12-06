# Requirements Document

## Introduction

This document outlines the requirements for implementing Google OAuth authentication to replace the existing custom email/password authentication system in the exam portal. The Google OAuth integration will provide a simplified, secure authentication flow that eliminates the need for users to create and manage passwords while maintaining all existing user profile functionality.

## Glossary

- **Authentication System**: The component responsible for verifying user identity and managing user sessions
- **Google OAuth Provider**: Google's OAuth 2.0 authentication service that allows users to sign in using their Google accounts
- **Supabase Auth**: Supabase's built-in authentication service that supports multiple OAuth providers
- **User Profile**: The student record containing name, email, phone, username, and other user-specific data
- **Session Management**: The process of maintaining authenticated user state across page loads and browser sessions
- **Auth Context**: React context that provides authentication state and methods throughout the application

## Requirements

### Requirement 1

**User Story:** As a new user, I want to sign up using my Google account, so that I can quickly create an account without managing another password

#### Acceptance Criteria

1. WHEN a user clicks the "Sign in with Google" button on the signup page, THE Authentication System SHALL initiate the Google OAuth flow
2. WHEN Google OAuth returns user data, THE Authentication System SHALL create a new student record with the user's Google email and name
3. WHEN a new student record is created via Google OAuth, THE Authentication System SHALL set email_verified to true automatically
4. WHEN Google OAuth completes successfully, THE Authentication System SHALL redirect the user to the profile completion page to add username and phone number
5. IF the Google email already exists in the students table, THEN THE Authentication System SHALL prevent duplicate account creation and show an appropriate error message

### Requirement 2

**User Story:** As an existing user, I want to log in using my Google account, so that I can access my account without remembering a password

#### Acceptance Criteria

1. WHEN a user clicks the "Sign in with Google" button on the login page, THE Authentication System SHALL initiate the Google OAuth flow
2. WHEN Google OAuth returns successfully, THE Authentication System SHALL verify the user exists in the students table
3. IF the user's email exists in the students table, THEN THE Authentication System SHALL authenticate the user and redirect to the home page
4. IF the user's email does not exist in the students table, THEN THE Authentication System SHALL treat this as a new signup and redirect to profile completion
5. WHEN a user successfully authenticates, THE Authentication System SHALL maintain the session across page reloads

### Requirement 3

**User Story:** As a user who signed up with Google, I want to complete my profile with username and phone number, so that my account has all required information

#### Acceptance Criteria

1. WHEN a new Google OAuth user is created, THE Authentication System SHALL redirect to a profile completion page
2. THE Profile Completion Page SHALL display a form requesting username and phone number
3. WHEN the user submits the profile completion form, THE Authentication System SHALL validate that the username is unique
4. WHEN the user submits the profile completion form, THE Authentication System SHALL validate that the phone number is 10 digits
5. WHEN profile completion is successful, THE Authentication System SHALL update the student record and redirect to the home page

### Requirement 4

**User Story:** As a developer, I want to remove the custom email/password authentication code, so that the codebase is simplified and maintenance is reduced

#### Acceptance Criteria

1. THE Authentication System SHALL remove all password hashing logic from AuthContext
2. THE Authentication System SHALL remove the bcrypt dependency from the project
3. THE Authentication System SHALL remove custom login and signup functions that use email/password
4. THE Authentication System SHALL remove password input fields from Login and Signup pages
5. THE Authentication System SHALL update the students table schema to make password_hash nullable or remove it entirely

### Requirement 5

**User Story:** As a system administrator, I want Google OAuth configured in Supabase, so that the authentication flow works correctly

#### Acceptance Criteria

1. THE Authentication System SHALL use Supabase's built-in Google OAuth provider configuration
2. THE Authentication System SHALL store Google OAuth client ID and client secret in Supabase dashboard
3. THE Authentication System SHALL configure the OAuth redirect URL to match the application's domain
4. THE Authentication System SHALL enable Google as an authentication provider in Supabase Auth settings
5. THE Authentication System SHALL handle OAuth callback URLs correctly for both development and production environments

### Requirement 6

**User Story:** As a user, I want my authentication session to persist across browser sessions, so that I don't have to log in every time I visit the site

#### Acceptance Criteria

1. WHEN a user successfully authenticates via Google OAuth, THE Authentication System SHALL store the session in Supabase Auth
2. WHEN a user returns to the site, THE Authentication System SHALL automatically restore the session if valid
3. WHEN a user clicks logout, THE Authentication System SHALL clear the Supabase Auth session
4. THE Authentication System SHALL remove localStorage-based session management in favor of Supabase Auth sessions
5. THE Authentication System SHALL handle session expiration gracefully and prompt re-authentication when needed

### Requirement 7

**User Story:** As a user, I want clear visual feedback during the authentication process, so that I understand what's happening

#### Acceptance Criteria

1. WHEN the Google OAuth flow is initiated, THE Authentication System SHALL display a loading state on the button
2. IF Google OAuth fails, THEN THE Authentication System SHALL display a user-friendly error message
3. WHEN redirecting to Google, THE Authentication System SHALL show a brief message indicating the redirect
4. WHEN returning from Google OAuth, THE Authentication System SHALL show a loading state while processing the authentication
5. THE Login and Signup pages SHALL display the Google sign-in button prominently with Google branding

### Requirement 8

**User Story:** As a developer, I want the Auth Context to use Supabase Auth methods, so that authentication is handled consistently

#### Acceptance Criteria

1. THE Auth Context SHALL use supabase.auth.signInWithOAuth() for Google authentication
2. THE Auth Context SHALL use supabase.auth.getSession() to retrieve current session
3. THE Auth Context SHALL use supabase.auth.onAuthStateChange() to listen for authentication state changes
4. THE Auth Context SHALL use supabase.auth.signOut() for logout functionality
5. THE Auth Context SHALL fetch student profile data from the students table after successful authentication
