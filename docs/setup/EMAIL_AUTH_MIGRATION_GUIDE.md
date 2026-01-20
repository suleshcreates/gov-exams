# Email Authentication Migration Guide

## 🎯 Overview

This guide will help you migrate from phone-based to email-based authentication for the GovExams Exam Portal.

## ✅ What's Been Completed

1. ✅ Database migration SQL script created
2. ✅ Username validation module created
3. ✅ Supabase service updated with email auth methods
4. ✅ AuthContext updated for email authentication

## 📋 Next Steps

### Step 1: Run Database Migration

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Migration Script**
   - Open the file `supabase-migration-email-auth.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" or press Ctrl+Enter

4. **Verify Migration**
   - Check that new columns were added to `students` table:
     - `email`
     - `username`
     - `auth_user_id`
     - `email_verified`
   - Check that indexes were created
   - Check that the trigger `on_auth_user_created` was created

### Step 2: Configure Supabase Auth

1. **Go to Authentication Settings**
   - In Supabase Dashboard, click "Authentication" → "Settings"

2. **Configure Site URL**
   - Set Site URL to: `http://localhost:8081` (for development)
   - For production, use your actual domain

3. **Add Redirect URLs**
   - Add these URLs to "Redirect URLs":
     ```
     http://localhost:8081/verify-email
     http://localhost:8081/reset-password
     ```

4. **Enable Email Confirmation**
   - Make sure "Enable email confirmations" is checked
   - Set "Confirm email" to "Enabled"

5. **Configure Email Templates** (Optional but Recommended)
   - Go to "Authentication" → "Email Templates"
   - Customize "Confirm signup" template:
     ```html
     <h2>Welcome to GovExams!</h2>
     <p>Hi {{ .Data.name }},</p>
     <p>Thanks for signing up! Click the link below to verify your email address:</p>
     <p><a href="{{ .ConfirmationURL }}">Verify Email Address</a></p>
     <p>This link expires in 24 hours.</p>
     <p>If you didn't create an account, you can safely ignore this email.</p>
     ```
   
   - Customize "Reset password" template:
     ```html
     <h2>Reset Your Password</h2>
     <p>Hi,</p>
     <p>Click the link below to reset your password:</p>
     <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
     <p>This link expires in 1 hour.</p>
     <p>If you didn't request a password reset, you can safely ignore this email.</p>
     ```

### Step 3: Update Frontend Pages

The following pages need to be updated:

- [ ] **Signup.tsx** - Replace phone with email/username
- [ ] **Login.tsx** - Accept email or username
- [ ] **VerifyEmail.tsx** - Create new page for email verification
- [ ] **ForgotPassword.tsx** - Create new page
- [ ] **ResetPassword.tsx** - Create new page
- [ ] **Profile.tsx** - Show email/username instead of phone
- [ ] **App.tsx** - Add new routes

I'll continue implementing these pages next. Would you like me to proceed?

## 🧪 Testing Checklist

After migration, test these scenarios:

### Signup Flow
- [ ] Sign up with email and username
- [ ] Check email for verification link
- [ ] Click verification link
- [ ] Verify account is marked as verified in database

### Login Flow
- [ ] Login with email
- [ ] Login with username
- [ ] Try login before email verification (should fail)
- [ ] Try login with wrong password (should fail)

### Password Reset
- [ ] Click "Forgot Password"
- [ ] Enter email
- [ ] Check email for reset link
- [ ] Click reset link
- [ ] Set new password
- [ ] Login with new password

### Username Validation
- [ ] Try username < 3 characters (should fail)
- [ ] Try username > 20 characters (should fail)
- [ ] Try username with special characters (should fail)
- [ ] Try username starting with underscore (should fail)
- [ ] Try duplicate username (should fail)
- [ ] Try valid username (should succeed)

## 🔧 Troubleshooting

### Email Not Received
1. Check Supabase logs in Dashboard → Logs
2. Check spam folder
3. Verify email template is configured
4. Check that email confirmation is enabled

### Verification Link Not Working
1. Check that redirect URL is configured correctly
2. Verify the link hasn't expired (24 hours)
3. Check browser console for errors

### Login Fails After Verification
1. Check that `email_verified` is true in database
2. Check that Supabase Auth user exists
3. Verify `auth_user_id` is linked correctly

## 📚 API Reference

### New Supabase Service Methods

```typescript
// Check username availability
await supabaseService.isUsernameAvailable(username);

// Check email availability
await supabaseService.isEmailAvailable(email);

// Create student with auth
await supabaseService.createStudentWithAuth({
  name, username, email, password
});

// Login with email or username
await supabaseService.loginWithEmailOrUsername(identifier, password);

// Resend verification email
await supabaseService.resendVerificationEmail(email);

// Request password reset
await supabaseService.requestPasswordReset(email);

// Update password
await supabaseService.updatePassword(newPassword);
```

### New Auth Context Methods

```typescript
const { auth, login, logout, signup, resendVerification, requestPasswordReset } = useAuth();

// Signup
const result = await signup(name, username, email, password);

// Login
const result = await login(emailOrUsername, password);

// Logout
await logout();

// Resend verification
await resendVerification(email);

// Request password reset
await requestPasswordReset(email);
```

## 🎉 Benefits of Email Authentication

1. **No SMS Costs** - Email is free!
2. **Better UX** - Users prefer email verification
3. **More Secure** - Supabase Auth handles security
4. **Password Reset** - Built-in password recovery
5. **Username Login** - Users can choose memorable usernames
6. **Global Support** - Works anywhere in the world

## 🚀 Ready to Continue?

Let me know when you've completed the database migration and Supabase Auth configuration, and I'll continue with updating the frontend pages!
