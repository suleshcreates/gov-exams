# Fix: Users Bypassing Profile Completion After Signup

## Problem
When users click "Sign Up" with Google OAuth, they are being logged in directly and redirected to the home page, bypassing the profile completion page where they should enter their username and phone number.

## Root Cause Analysis

The issue occurs because:

1. **Google OAuth Flow**: When a user signs up with Google, Supabase creates an auth user
2. **Trigger Execution**: The `handle_new_user()` trigger should create a student record with NULL username and phone
3. **Profile Check**: The `AuthCallback` component checks if username and phone exist
4. **Bypass**: If username/phone are somehow populated (or the check fails), users skip the complete-profile page

## Potential Causes

1. **Database Trigger Issue**: The trigger might be creating records with username/phone populated from Google metadata
2. **Timing Issue**: The student record might not be created yet when the profile check happens
3. **Data Type Issue**: Empty strings (`''`) vs NULL values causing the check to pass incorrectly
4. **Existing Data**: Old records might have been created with username/phone already populated

## Solution

### 1. Database Fix (FIX_SIGNUP_PROFILE_FLOW.sql)

Run this SQL script to:
- Ensure the trigger explicitly sets username and phone to NULL
- Reset any existing unverified users to have NULL username/phone
- Verify the trigger is working correctly

```sql
-- See FIX_SIGNUP_PROFILE_FLOW.sql for full script
```

### 2. Enhanced Logging (AuthContext.tsx)

Added detailed logging to help debug:
- Shows exact values of username and phone
- Shows data types (null vs empty string)
- Shows verification status

### 3. Profile Completion Checks

The checks in `AuthCallback.tsx` and `CompleteProfile.tsx` already handle:
- NULL values
- Undefined values
- Empty strings
- Whitespace-only strings

```typescript
const hasUsername = auth.user.username && auth.user.username.trim() !== '';
const hasPhone = auth.user.phone && auth.user.phone.trim() !== '';
```

## Testing Steps

1. **Run the SQL fix**:
   ```bash
   # In Supabase SQL Editor, run FIX_SIGNUP_PROFILE_FLOW.sql
   ```

2. **Test new signup**:
   - Clear browser cache and cookies
   - Go to /signup
   - Click "Sign up with Google"
   - After OAuth, you should land on /complete-profile
   - Check browser console for logs

3. **Check the logs**:
   Look for these log messages:
   ```
   [AuthContext] Profile data: {
     username: null,
     phone: null,
     usernameIsNull: true,
     phoneIsNull: true
   }
   [AuthCallback] Profile incomplete, redirecting to complete-profile
   ```

4. **Verify database**:
   ```sql
   -- Check recent signups
   SELECT auth_user_id, email, username, phone, is_verified, created_at
   FROM students
   ORDER BY created_at DESC
   LIMIT 5;
   ```

## Diagnostic Queries

Use `diagnose-signup-flow.sql` to check:
- Recent student records and their username/phone status
- Trigger status
- What data Google provides
- Any users with unexpected data

## Expected Behavior

After the fix:

1. User clicks "Sign Up with Google"
2. Google OAuth completes
3. Trigger creates student record with:
   - ✅ email (from Google)
   - ✅ name (from Google)
   - ✅ avatar_url (from Google)
   - ❌ username = NULL
   - ❌ phone = NULL
   - ❌ is_verified = false
4. AuthCallback detects incomplete profile
5. User is redirected to /complete-profile
6. User enters username and phone
7. Profile is updated with is_verified = true
8. User is redirected to home page

## If Issue Persists

1. **Check browser console** for the detailed logs
2. **Run diagnostic query** to see actual database values
3. **Check if trigger is firing** by looking at recent student records
4. **Verify RLS policies** aren't blocking the student record creation
5. **Check for race conditions** - the student record might not exist yet when the profile check happens

## Additional Notes

- The trigger uses `ON CONFLICT (auth_user_id) DO NOTHING` to prevent duplicate records
- The trigger has error handling to not fail the auth process
- The profile completion check is strict: both username AND phone must be non-null, non-empty strings
- The `is_verified` flag is set to false until profile completion
