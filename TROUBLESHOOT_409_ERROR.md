# Troubleshooting 409 Conflict Error

## Problem
Getting a **409 Conflict** error when trying to update profile after Google OAuth sign-in.

## Error Message
```
Failed to load resource: the server responded with a status of 409 ()
Profile update error: Error: Failed to update profile
```

## Root Causes

The 409 error typically indicates:
1. **RLS Policy Issue**: Row Level Security policies are blocking the update
2. **Unique Constraint Violation**: Username or phone already exists
3. **Permission Issue**: User doesn't have permission to update the record
4. **Missing auth_user_id**: The record doesn't have the correct auth_user_id set

## Step-by-Step Fix

### Step 1: Run Diagnostic Script

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste contents of `supabase-diagnose-oauth.sql`
4. Click **Run**
5. Review the results to identify the issue

### Step 2: Fix RLS Policies

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste contents of `supabase-fix-oauth-rls.sql`
4. Click **Run**
5. Verify success message

### Step 3: Clear Browser Data

1. Open browser DevTools (F12)
2. Go to **Application** tab
3. Clear **Cookies** for your site
4. Clear **Local Storage**
5. Clear **Session Storage**
6. Close and reopen browser

### Step 4: Test Again

1. Go to `/login`
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Try to complete profile
5. Check browser console for detailed error logs

## Common Issues and Solutions

### Issue 1: RLS Policy Blocking Update

**Symptoms**: 
- 409 error
- Console shows "permission denied" or "policy violation"

**Solution**:
```sql
-- Run this in Supabase SQL Editor
DROP POLICY IF EXISTS "Users can update own profile" ON students;

CREATE POLICY "Enable update for users to own profile"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);
```

### Issue 2: Username Already Exists

**Symptoms**:
- 409 error
- Error code 23505
- Message about duplicate key

**Solution**:
1. Choose a different username
2. Or clear duplicate usernames:
```sql
-- Find duplicates
SELECT username, COUNT(*) 
FROM students 
WHERE username IS NOT NULL 
GROUP BY username 
HAVING COUNT(*) > 1;

-- Remove duplicates (keep most recent)
DELETE FROM students
WHERE id NOT IN (
  SELECT MAX(id)
  FROM students
  GROUP BY username
);
```

### Issue 3: auth_user_id Not Set

**Symptoms**:
- 409 error
- Update affects 0 rows
- Console shows "No rows updated"

**Solution**:
```sql
-- Check if auth_user_id is set
SELECT id, email, auth_user_id 
FROM students 
WHERE auth_user_id IS NULL;

-- Fix missing auth_user_id (if you know the user's email)
UPDATE students
SET auth_user_id = (
  SELECT id FROM auth.users WHERE email = students.email
)
WHERE auth_user_id IS NULL;
```

### Issue 4: Multiple Student Records

**Symptoms**:
- 409 error
- Multiple records for same user
- Constraint violations

**Solution**:
```sql
-- Find duplicate records
SELECT auth_user_id, COUNT(*) 
FROM students 
WHERE auth_user_id IS NOT NULL 
GROUP BY auth_user_id 
HAVING COUNT(*) > 1;

-- Keep only the most recent record
DELETE FROM students
WHERE id NOT IN (
  SELECT MAX(id)
  FROM students
  WHERE auth_user_id IS NOT NULL
  GROUP BY auth_user_id
);
```

## Detailed Debugging

### Check Browser Console

Look for these log messages:
```
Loading user profile for: [user-id]
User profile loaded: [email]
Updating profile for user: [user-id] with data: {...}
Profile update error details: {...}
```

### Check Supabase Logs

1. Go to Supabase Dashboard
2. Click **Logs** in sidebar
3. Select **Postgres Logs**
4. Look for errors around the time of the 409 error
5. Check for:
   - Policy violations
   - Constraint violations
   - Permission errors

### Check Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by **Fetch/XHR**
4. Find the failed request
5. Check:
   - Request payload
   - Response status
   - Response body
   - Request headers

## Prevention

### 1. Ensure Unique Constraints

```sql
-- Add unique constraint on auth_user_id
ALTER TABLE students
ADD CONSTRAINT students_auth_user_id_unique 
UNIQUE (auth_user_id);

-- Add unique constraint on username
ALTER TABLE students
ADD CONSTRAINT students_username_unique 
UNIQUE (username);
```

### 2. Proper RLS Policies

```sql
-- Ensure policies allow authenticated users to update their own records
CREATE POLICY "Enable update for users to own profile"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);
```

### 3. Validate Before Update

The code now includes better validation:
- Checks username format
- Checks username uniqueness
- Checks phone format
- Provides detailed error messages

## Testing Checklist

After applying fixes:

- [ ] Can sign in with Google
- [ ] Student record is created
- [ ] Can access profile completion page
- [ ] Can enter username and phone
- [ ] Can submit profile form
- [ ] No 409 errors in console
- [ ] Redirected to home page
- [ ] Profile data is saved
- [ ] Can sign out and sign in again
- [ ] Profile data persists

## Still Having Issues?

### Get More Details

Add this to your browser console:
```javascript
// Enable verbose logging
localStorage.setItem('supabase.auth.debug', 'true');

// Check current session
supabase.auth.getSession().then(console.log);

// Check current user
supabase.auth.getUser().then(console.log);
```

### Manual Profile Update

If you need to manually update a profile:
```sql
-- Replace with actual values
UPDATE students
SET 
  username = 'your_username',
  phone = '1234567890',
  is_verified = true
WHERE auth_user_id = 'your-auth-user-id';
```

### Contact Support

If none of these solutions work:
1. Export diagnostic results
2. Export browser console logs
3. Export Supabase logs
4. Share error details
5. Describe exact steps to reproduce

## Success Indicators

You'll know it's fixed when:
1. No 409 errors in console
2. Profile updates successfully
3. Console shows: "Profile updated successfully"
4. Redirected to home page
5. Username and phone are saved
6. Can sign out and sign in again
