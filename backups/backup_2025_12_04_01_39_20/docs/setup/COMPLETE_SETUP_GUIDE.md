# Complete Setup Guide - Email Authentication

## 🧹 Step 1: Clean Up Test Users

### In Supabase SQL Editor:
```sql
DELETE FROM students WHERE email = 'suleshwaghmare7875@gmail.com';
DELETE FROM students WHERE username = 'sulesh';
```

### In Supabase Dashboard:
1. Go to **Authentication** → **Users**
2. Find user: `suleshwaghmare7875@gmail.com`
3. Click the **...** menu → **Delete User**

## ⚙️ Step 2: Configure Supabase Auth Settings

### Go to Authentication → Settings in Supabase Dashboard

#### Site URL
```
http://localhost:8080
```

#### Redirect URLs (Add these)
```
http://localhost:8080/*
http://localhost:8080/verify-email
http://localhost:8080/reset-password
```

#### Email Auth Settings
- ✅ **Enable email provider**
- ✅ **Confirm email** - Set to "Enabled"
- ✅ **Secure email change** - Enabled
- ⚠️ **Double confirm email changes** - Disabled (for easier testing)

#### Email Rate Limits
- Increase if needed for testing

## 📧 Step 3: Check Email Templates

### Go to Authentication → Email Templates

#### Confirm Signup Template
Make sure it's enabled and has the confirmation URL:

```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

**Important:** Make sure `{{ .ConfirmationURL }}` is present!

## 🧪 Step 4: Test Signup Flow

### 1. Sign Up
1. Go to http://localhost:8080/signup
2. Use a **REAL email** you can access
3. Fill in:
   - Name: Your Name
   - Username: yourusername
   - Email: your.real.email@gmail.com
   - Password: password123
4. Click "Create Account"

### 2. Check Console
Should see:
```
[Auth] Starting signup for your.real.email@gmail.com
[Auth] Signup successful for your.real.email@gmail.com
```

### 3. Check Email
- Check inbox (and spam folder!)
- Look for email from Supabase
- Click the confirmation link

### 4. Login
1. Go to http://localhost:8080/login
2. Enter email or username
3. Enter password
4. Should login successfully!

## 🐛 Troubleshooting

### No Email Received?

#### Check Supabase Logs:
1. Go to **Logs** in Supabase Dashboard
2. Filter by "auth"
3. Look for email sending logs

#### Common Issues:
- **Email not configured** - Check Auth settings
- **Rate limited** - Wait a few minutes
- **Spam folder** - Check spam/junk
- **Email template disabled** - Enable in Email Templates

### 409 Conflict Error?

This means user already exists. Clean up:
```sql
-- Delete from students table
DELETE FROM students WHERE email = 'your.email@gmail.com';

-- Then delete from Auth Users in dashboard
```

### Login Says "Invalid Credentials"?

This means:
1. Student record doesn't exist in database
2. Email not verified
3. Wrong password

**Check in Supabase:**
```sql
-- Check if student exists
SELECT * FROM students WHERE email = 'your.email@gmail.com';

-- Check if auth user exists and is confirmed
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'your.email@gmail.com';
```

### Email Not Verified?

**Manually verify in Supabase:**
```sql
-- Update student record
UPDATE students 
SET email_verified = true 
WHERE email = 'your.email@gmail.com';

-- Update auth user
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'your.email@gmail.com';
```

## 🎯 Quick Test (Skip Email Verification)

For testing, you can manually verify:

### 1. Sign Up
Sign up normally at http://localhost:8080/signup

### 2. Manually Verify
Run in Supabase SQL Editor:
```sql
-- Replace with your email
UPDATE students 
SET email_verified = true 
WHERE email = 'your.email@gmail.com';

UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'your.email@gmail.com';
```

### 3. Login
Now you can login immediately!

## ✅ Success Checklist

- [ ] Cleaned up old test users
- [ ] Configured Site URL in Supabase
- [ ] Added Redirect URLs
- [ ] Enabled email confirmation
- [ ] Checked email templates
- [ ] Signed up with real email
- [ ] Received verification email
- [ ] Clicked verification link
- [ ] Logged in successfully

## 🚀 Production Checklist

Before going live:

- [ ] Update Site URL to production domain
- [ ] Update Redirect URLs to production
- [ ] Customize email templates with branding
- [ ] Test email delivery
- [ ] Set up custom SMTP (optional)
- [ ] Configure rate limits
- [ ] Test password reset flow
- [ ] Test with multiple email providers (Gmail, Outlook, etc.)

## 📞 Need Help?

If still having issues:

1. **Check Supabase Logs** - Most helpful for debugging
2. **Check Browser Console** - Shows client-side errors
3. **Check Database** - Verify records exist
4. **Check Auth Users** - Verify user is confirmed

---

**Remember:** Use a REAL email address you can access for testing!
