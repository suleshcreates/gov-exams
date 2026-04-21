# Admin User Setup Guide

## Overview

The admin panel now uses **proper Supabase authentication** with role-based access control. No more hardcoded credentials!

## How It Works

1. Admin users authenticate through Supabase Auth
2. The system checks if the user has `role: "admin"` in their metadata
3. Only users with admin role can access the admin panel
4. Sessions are managed securely by Supabase

## Setting Up Admin Users

### Method 1: Through Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard** → Authentication → Users

2. **Create a new user** or select an existing one

3. **Add admin role to User Metadata:**
   - Click on the user
   - Scroll to "User Metadata" section
   - Click "Edit"
   - Add this JSON:
   ```json
   {
     "role": "admin",
     "name": "Admin Name"
   }
   ```
   - Click "Save"

4. **Set a password** (if creating new user):
   - Use a strong password
   - Consider using a password manager

### Method 2: Through SQL

Run this in Supabase SQL Editor:

```sql
-- Create a new admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@yourdomain.com',  -- Change this
  crypt('YourStrongPassword123!', gen_salt('bf')),  -- Change this
  NOW(),
  '{"role": "admin", "name": "Admin User"}'::jsonb,
  NOW(),
  NOW()
);
```

### Method 3: Promote Existing User

If you already have a user account, promote it to admin:

```sql
-- Update existing user to admin
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';
```

## Security Best Practices

### 1. Strong Passwords
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, and symbols
- Use a password manager

### 2. Limit Admin Accounts
- Only create admin accounts for trusted personnel
- Remove admin access when no longer needed

### 3. Monitor Admin Activity
- Check Supabase Auth logs regularly
- Review admin actions in your database

### 4. Two-Factor Authentication (Future Enhancement)
Consider adding 2FA for admin accounts:
```typescript
// Enable MFA for admin users
await supabase.auth.mfa.enroll({
  factorType: 'totp'
});
```

## Testing Admin Login

1. **Go to** `/admin/login`

2. **Enter credentials:**
   - Email: Your admin user email
   - Password: Your admin user password

3. **Verify access:**
   - Should redirect to `/admin/dashboard`
   - Should see admin panel navigation

4. **Check browser console:**
   - Should see `[AdminAuth] Admin login successful`
   - No error messages

## Troubleshooting

### "Invalid credentials" error
- ✅ Check email and password are correct
- ✅ Verify user exists in Supabase Auth
- ✅ Check password hasn't expired

### "User does not have admin role" error
- ✅ Check user metadata has `"role": "admin"`
- ✅ Try both `user_metadata` and `app_metadata`
- ✅ Refresh the user in Supabase dashboard

### Session not persisting
- ✅ Check browser allows localStorage
- ✅ Clear browser cache and try again
- ✅ Check Supabase session timeout settings

### Can't access admin panel after login
- ✅ Check browser console for errors
- ✅ Verify Supabase URL and keys in `.env`
- ✅ Check RLS policies aren't blocking access

## Removing Old Hardcoded Credentials

The old hardcoded credentials (`admin@example.com` / `admin123`) have been removed. All authentication now goes through Supabase.

## Environment Variables

Make sure these are set in your `.env`:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Next Steps

1. Create your first admin user using Method 1 above
2. Test login at `/admin/login`
3. Remove any test/demo admin accounts
4. Document your admin users securely
5. Consider implementing 2FA for production

## Security Checklist

- [ ] Created admin user with strong password
- [ ] Verified admin role in user metadata
- [ ] Tested login successfully
- [ ] Removed any test accounts
- [ ] Documented admin credentials securely
- [ ] Set up password rotation policy
- [ ] Enabled Supabase Auth email confirmations
- [ ] Reviewed RLS policies for admin tables
