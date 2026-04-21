# OAuth Redirect Loop Fix

## Issue
After signing in with Google, users were being redirected back to the OAuth page instead of completing the authentication flow.

## Root Cause
The issue was caused by:
1. Race condition between OAuth callback and database trigger
2. AuthCallback component checking auth state before student record was created
3. Missing error handling for cases where student record doesn't exist

## Solution Implemented

### 1. Updated AuthCallback Component

**Changes**:
- Added direct session check instead of relying on AuthContext
- Added 1-second delay to allow database trigger to complete
- Added manual student record creation if trigger fails
- Added proper error handling and user feedback
- Used `replace: true` in navigation to prevent back button issues
- Added detailed console logging for debugging

**Key improvements**:
```typescript
// Wait for database trigger
await new Promise(resolve => setTimeout(resolve, 1000));

// Check if student exists
const { data: student, error } = await supabase
  .from('students')
  .select('*')
  .eq('auth_user_id', session.user.id)
  .single();

// Create student manually if trigger failed
if (error?.code === 'PGRST116') {
  await supabase.from('students').insert({...});
}
```

### 2. Updated AuthContext

**Changes**:
- Changed `single()` to `maybeSingle()` to handle missing records gracefully
- Added console logging for debugging
- Improved auth state change handling
- Added TOKEN_REFRESHED event handling

**Key improvements**:
```typescript
// Use maybeSingle instead of single
const { data, error } = await supabase
  .from('students')
  .select('*')
  .eq('auth_user_id', authUserId)
  .maybeSingle(); // Won't throw error if no record found
```

## Testing the Fix

### Test Case 1: New User Sign Up
1. Go to `/signup`
2. Click "Sign up with Google"
3. Complete Google OAuth
4. **Expected**: Redirect to `/complete-profile`
5. Enter username and phone
6. **Expected**: Redirect to `/` (home page)

### Test Case 2: Existing User Sign In
1. Go to `/login`
2. Click "Sign in with Google"
3. Complete Google OAuth
4. **Expected**: Redirect directly to `/` (home page)

### Test Case 3: Database Trigger Failure
1. Temporarily disable the database trigger
2. Sign in with Google
3. **Expected**: Student record created manually by AuthCallback
4. **Expected**: Redirect to `/complete-profile` or `/` as appropriate

## Debugging

If issues persist, check the browser console for these logs:

```
Session found for user: [email]
Student record found: [data]
Profile incomplete, redirecting to complete-profile
// OR
Profile complete, redirecting to home
```

### Common Issues

#### Still Redirecting to OAuth
**Cause**: Browser cache or cookies

**Fix**:
1. Clear browser cache and cookies
2. Sign out completely
3. Try in incognito/private window

#### "No student record found"
**Cause**: Database trigger not working

**Fix**:
1. Check if trigger exists in Supabase
2. Check trigger function has correct permissions
3. AuthCallback will create record manually as fallback

#### Stuck on "Completing sign in..."
**Cause**: Network error or database permission issue

**Fix**:
1. Check browser console for errors
2. Check Supabase logs
3. Verify RLS policies allow insert on students table

## Verification Checklist

After implementing the fix:

- [ ] New users can sign up with Google
- [ ] New users are redirected to profile completion
- [ ] Profile completion redirects to home
- [ ] Existing users are redirected directly to home
- [ ] No infinite redirect loops
- [ ] Browser back button works correctly
- [ ] Console shows appropriate logs
- [ ] Student records are created in database
- [ ] No errors in browser console
- [ ] No errors in Supabase logs

## Additional Improvements

### 1. Database Trigger Reliability

Ensure the trigger is working:

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check trigger function
SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';
```

### 2. RLS Policy Check

Ensure students table allows inserts:

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'students';

-- Ensure insert policy exists
CREATE POLICY "Users can insert own profile"
  ON students
  FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);
```

### 3. Monitoring

Add monitoring to track:
- OAuth success rate
- Profile completion rate
- Time to complete authentication
- Error rates

## Rollback

If issues occur, you can rollback to previous AuthCallback:

```typescript
// Simple version without manual creation
useEffect(() => {
  if (auth.loading) return;
  
  if (auth.isAuthenticated && auth.user) {
    if (!auth.user.username || !auth.user.phone) {
      navigate('/complete-profile');
    } else {
      navigate('/');
    }
  } else {
    navigate('/login');
  }
}, [auth, navigate]);
```

## Support

If users report issues:
1. Ask them to try in incognito mode
2. Check Supabase logs for their email
3. Verify student record exists in database
4. Check browser console for errors
5. Verify OAuth configuration in Google Cloud Console
