# Fix: Session Logout on Page Refresh

## Problem
Users are getting logged out when they refresh the page, even though they were previously authenticated.

## Changes Made

### 1. Enhanced AuthContext Session Recovery
- Added better error handling in session initialization
- Added `mounted` flag to prevent state updates after unmount
- Added more detailed console logging with `[AuthContext]` prefix
- Handle `USER_UPDATED` and `TOKEN_REFRESHED` events properly
- Don't clear session on profile load errors

### 2. Improved Supabase Client Configuration
- Added debug mode in development environment
- Added initial session check logging
- Ensured proper storage configuration

### 3. Better Error Handling
- Profile load errors no longer clear the authentication session
- Added try-catch blocks with proper error logging
- Session persists even if student profile fails to load

## How to Test

1. **Clear your browser storage first:**
   - Open DevTools (F12)
   - Go to Application tab → Storage → Clear site data
   - Or manually clear localStorage

2. **Login and test:**
   ```
   - Login with your account
   - Check browser console for logs starting with [AuthContext] or [Supabase]
   - Refresh the page (F5)
   - You should stay logged in
   ```

3. **Check localStorage:**
   - Open DevTools → Application → Local Storage
   - Look for key: `dmlt-academy-auth`
   - It should contain your session data

## Debugging Steps

### Check Console Logs
Look for these log messages:
```
[Supabase] Initial session check: Session exists
[AuthContext] Initializing auth...
[AuthContext] Session found for: your-email@example.com
[AuthContext] Loading user profile for: user-id
[AuthContext] User profile loaded successfully: your-email@example.com
```

### If Still Logging Out

1. **Check if session is being stored:**
   ```javascript
   // In browser console
   localStorage.getItem('dmlt-academy-auth')
   ```
   Should return a JSON string with session data

2. **Check for errors:**
   - Look for any red errors in console
   - Check Network tab for failed requests
   - Look for 401/403 errors

3. **Verify Supabase Configuration:**
   - Check `.env` file has correct values:
     ```
     VITE_SUPABASE_URL=your-url
     VITE_SUPABASE_ANON_KEY=your-key
     ```
   - Restart dev server after changing .env

4. **Check RLS Policies:**
   - Ensure `students` table has proper SELECT policy
   - User should be able to read their own profile

5. **Browser Issues:**
   - Try in incognito/private mode
   - Try different browser
   - Check if browser is blocking localStorage
   - Disable browser extensions that might interfere

## Common Causes

### 1. RLS Policy Issues
If the `students` table query fails due to RLS, the profile won't load but session should still persist.

**Fix:** Run this SQL in Supabase:
```sql
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON students FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());
```

### 2. CORS Issues
If requests are being blocked by CORS, check Supabase dashboard settings.

### 3. Session Expiry
Default session expires after 1 hour. Check if you need to adjust:
```sql
-- In Supabase Dashboard → Authentication → Settings
-- Adjust "JWT expiry limit"
```

### 4. Multiple Tabs
Having multiple tabs open can sometimes cause session conflicts. Close all tabs and try again.

## Additional Improvements

### Add Session Refresh Indicator
You can add a visual indicator when session is being refreshed:

```typescript
// In your app
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'TOKEN_REFRESHED') {
      console.log('Session refreshed successfully');
    }
  });
  return () => subscription.unsubscribe();
}, []);
```

### Monitor Session Health
Add this to check session health:

```typescript
// Check session periodically
setInterval(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Session health check:', session ? 'Active' : 'Expired');
}, 60000); // Every minute
```

## Next Steps

1. Clear browser cache and localStorage
2. Login again
3. Check console for the new detailed logs
4. Refresh page and verify you stay logged in
5. If issue persists, check the debugging steps above

## Support

If the issue continues:
1. Share the console logs (with [AuthContext] and [Supabase] prefixes)
2. Check Network tab for any failed auth requests
3. Verify your Supabase project is active and not paused
4. Check if other users have the same issue (might be account-specific)
