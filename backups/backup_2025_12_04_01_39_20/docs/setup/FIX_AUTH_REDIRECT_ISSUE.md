# Fix Auth Redirect Issue

## Problem
After Google OAuth sign-in, users are getting stuck in a redirect loop or being signed out immediately. The logs show:
1. User signs in successfully
2. Profile loading times out after 10 seconds
3. User is redirected to `/complete-profile`
4. Session gets cleared (`SIGNED_OUT`)

## Root Cause
The profile query is timing out because of RLS (Row Level Security) policy issues on the `students` table. When the query times out, it causes auth state inconsistencies that lead to sign-out.

## Solution

### Step 1: Run Diagnostic Script
First, run `diagnose-auth-redirect-issue.sql` in your Supabase SQL Editor to check:
- Current RLS policies on students table
- Whether your student record exists
- If you can read your own record

### Step 2: Apply the Fix
Run `fix-auth-redirect-complete.sql` in your Supabase SQL Editor. This script:
1. Drops all conflicting RLS policies
2. Creates clean, simple RLS policies:
   - Users can SELECT/UPDATE/INSERT their own records
   - Admins have full access
3. Creates a database function and trigger to **automatically** create student records for ALL new OAuth users
4. Backfills student records for any existing OAuth users who don't have one
5. Verifies the fix

**No manual configuration needed** - the script will work for all users automatically!

### Step 3: Code Changes Applied
The following code changes have been made to improve the redirect flow:

1. **AuthCallback.tsx**: Added `hasRedirected` state to prevent multiple redirects and added better logging
2. **CompleteProfile.tsx**: Improved auth state checking with better logging and explicit loading checks

### Step 4: Test the Flow
1. Clear your browser's local storage and cookies
2. Sign in with Google OAuth
3. You should be redirected to `/auth/callback`
4. Then redirected to `/complete-profile` (if profile incomplete) or `/` (if complete)
5. Complete your profile with username and phone
6. You should be redirected to home page

## Expected Behavior After Fix

### For New Users (No Student Record)
1. Sign in with Google → `/auth/callback`
2. Student record created automatically
3. Redirect to `/complete-profile`
4. Fill in username and phone
5. Redirect to `/` (home page)

### For Existing Users (Incomplete Profile)
1. Sign in with Google → `/auth/callback`
2. Profile loads (username or phone missing)
3. Redirect to `/complete-profile`
4. Fill in missing information
5. Redirect to `/` (home page)

### For Existing Users (Complete Profile)
1. Sign in with Google → `/auth/callback`
2. Profile loads (username and phone present)
3. Redirect directly to `/` (home page)

## Troubleshooting

### If profile still times out:
1. Check RLS policies are correctly applied:
   ```sql
   SELECT policyname, cmd FROM pg_policies WHERE tablename = 'students';
   ```
2. Verify you can read your own record:
   ```sql
   SELECT * FROM students WHERE auth_user_id = auth.uid();
   ```

### If session still gets cleared:
1. Check browser console for any errors
2. Look for any code that calls `signOut()` unintentionally
3. Verify the auth state is properly maintained in AuthContext

### If redirect loop continues:
1. Clear browser local storage
2. Check that `hasRedirected` state is working in AuthCallback
3. Verify CompleteProfile isn't redirecting back to callback

## Files Modified
- `src/pages/AuthCallback.tsx` - Added redirect guard and better logging
- `src/pages/CompleteProfile.tsx` - Improved auth state checking
- `diagnose-auth-redirect-issue.sql` - New diagnostic script
- `fix-auth-redirect-complete.sql` - New fix script
