# Admin Google OAuth Setup

This guide explains how to enable Google OAuth for admin users.

## Overview

Admin users can authenticate using either:
1. Email/password (traditional method)
2. Google OAuth (if admin role is set)

The admin authentication system checks for the `role: 'admin'` in the user's metadata after authentication.

## Setting Up Admin Users with Google OAuth

### Method 1: Set Admin Role via SQL (Recommended)

After a user signs in with Google OAuth for the first time, you can grant them admin access:

```sql
-- Update user metadata to add admin role
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@example.com';

-- Also update app_metadata (alternative location)
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@example.com';
```

### Method 2: Set Admin Role via Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Users**
3. Find the user you want to make an admin
4. Click on the user to view details
5. Scroll to **User Metadata** section
6. Click **Edit**
7. Add the following JSON:
   ```json
   {
     "role": "admin"
   }
   ```
8. Click **Save**

### Method 3: Create Admin Record in Database

You can also create an admin record in the `admins` table:

```sql
-- Insert admin record
INSERT INTO admins (auth_user_id, email, name, role)
VALUES (
  'user-uuid-from-auth-users',
  'admin@example.com',
  'Admin Name',
  'admin'
);
```

## How It Works

1. **User Signs In**: Admin user signs in with Google OAuth or email/password
2. **Role Check**: The `AdminAuthContext` checks for `role: 'admin'` in:
   - `user_metadata.role`
   - `app_metadata.role`
3. **Access Granted**: If admin role is found, user is authenticated as admin
4. **Access Denied**: If no admin role, user is signed out and denied access

## Admin Login Flow

### With Email/Password

1. Admin goes to `/admin/login`
2. Enters email and password
3. System authenticates via Supabase Auth
4. Checks for admin role
5. Grants access if admin role exists

### With Google OAuth

1. Admin goes to `/admin/login`
2. Clicks "Sign in with Google" (if implemented)
3. Authenticates with Google
4. System checks for admin role in user metadata
5. Grants access if admin role exists

## Security Considerations

1. **Role Assignment**: Only assign admin role to trusted users
2. **Metadata Protection**: User metadata can only be modified via:
   - Supabase Dashboard (by project admins)
   - SQL queries (by database admins)
   - Server-side code with service role key
3. **Client-Side Safety**: Users cannot modify their own metadata from the client
4. **RLS Policies**: Ensure RLS policies on admin tables check for admin role

## Testing Admin Google OAuth

1. Create a test admin user:
   ```sql
   -- First, sign in with Google OAuth as a regular user
   -- Then run this SQL to grant admin access:
   UPDATE auth.users
   SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
   WHERE email = 'your-test-email@gmail.com';
   ```

2. Sign out and sign in again
3. Navigate to `/admin/dashboard`
4. Verify admin access is granted

## Troubleshooting

### "User does not have admin role" Error

**Cause**: The user's metadata doesn't contain `role: 'admin'`

**Solution**:
- Verify the user's metadata in Supabase Dashboard
- Run the SQL query to add admin role
- Sign out and sign in again

### Admin Can't Access After Google OAuth

**Cause**: Session might not have refreshed after role assignment

**Solution**:
- Clear browser cookies
- Sign out completely
- Sign in again with Google OAuth

### Multiple Admin Accounts

You can have multiple admin users:

```sql
-- Grant admin role to multiple users
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email IN (
  'admin1@example.com',
  'admin2@example.com',
  'admin3@example.com'
);
```

## Future Enhancements

Consider implementing:

1. **Admin Invitation System**: Send invitation emails to new admins
2. **Role Management UI**: Admin panel to manage user roles
3. **Granular Permissions**: Different admin levels (super admin, moderator, etc.)
4. **Audit Logging**: Track admin actions for security
5. **Two-Factor Authentication**: Extra security for admin accounts

## Related Files

- `src/admin/context/AdminAuthContext.tsx` - Admin authentication logic
- `src/admin/pages/AdminLogin.tsx` - Admin login page
- `GOOGLE_OAUTH_SETUP.md` - General Google OAuth setup guide
