# Fix: Stuck on "Completing sign in..." Screen

## Problem
After clearing site data and trying to sign in with Google OAuth, the app gets stuck on the "Completing sign in..." screen.

## Changes Made

### Enhanced AuthCallback with Better Debugging
- Added 15-second timeout to prevent infinite loading
- Added detailed console logging with `[AuthCallback]` prefix
- Better error handling and cleanup
- Check for access token in URL hash
- Proper timeout cleanup on unmount

## Immediate Fix Steps

### 1. Check Browser Console
Open DevTools (F12) and look for logs starting with `[AuthCallback]`. You should see:
```
[AuthCallback] Starting OAuth callback handling...
[AuthCallback] Hash params: Present/Missing
[AuthCallback] Access token: Present/Missing
[AuthCallback] Session found for user: your-email
[AuthCallback] Checking for student record...
```

### 2. Check the URL
When stuck, look at your browser URL. It should be:
```
http://localhost:8080/auth/callback#access_token=...&refresh_token=...
```

If the URL doesn't have the hash parameters, the OAuth redirect failed.

### 3. Verify Supabase OAuth Settings

Go to Supabase Dashboard → Authentication → URL Configuration:

**Redirect URLs must include:**
```
http://localhost:8080/auth/callback
http://localhost:5173/auth/callback  (if using Vite default port)
```

**Site URL:**
```
http://localhost:8080
```

### 4. Check Google OAuth Configuration

In Google Cloud Console → APIs & Services → Credentials:

**Authorized redirect URIs must include:**
```
https://YOUR-PROJECT.supabase.co/auth/v1/callback
```

## Common Issues & Solutions

### Issue 1: No Hash Parameters in URL
**Symptom:** URL is just `/auth/callback` without `#access_token=...`

**Solution:**
1. Check Supabase redirect URLs (see step 3 above)
2. Verify Google OAuth redirect URI
3. Try signing in again

### Issue 2: RLS Policy Blocking Student Creation
**Symptom:** Console shows "Error creating student" or "Permission denied"

**Solution:** Run this SQL in Supabase:
```sql
-- Allow authenticated users to insert their own student record
CREATE POLICY "Users can create own student record"
ON students FOR INSERT
TO authenticated
WITH CHECK (auth_user_id = auth.uid());

-- Allow users to read their own student record
CREATE POLICY "Users can read own student record"
ON students FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

-- Allow users to update their own student record
CREATE POLICY "Users can update own student record"
ON students FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());
```

### Issue 3: Database Trigger Not Working
**Symptom:** Student record not created automatically

**Solution:** The app now creates the student record manually if the trigger fails, so this should work automatically.

### Issue 4: Timeout After 15 Seconds
**Symptom:** Error message "Authentication is taking too long"

**Possible causes:**
- Slow database connection
- RLS policies blocking queries
- Network issues

**Solution:**
1. Check Supabase project status (not paused)
2. Verify RLS policies (see Issue 2)
3. Check network tab for failed requests

## Testing Steps

### 1. Clear Everything
```
1. Open DevTools (F12)
2. Application → Storage → Clear site data
3. Close all tabs of your app
4. Close DevTools
```

### 2. Fresh Start
```
1. Open your app in a new tab
2. Open DevTools (F12) → Console tab
3. Click "Sign in with Google"
4. Watch the console logs
```

### 3. What to Look For

**Good flow:**
```
[AuthCallback] Starting OAuth callback handling...
[AuthCallback] Hash params: Present
[AuthCallback] Access token: Present
[AuthCallback] Session found for user: your@email.com
[AuthCallback] Waiting for student record creation...
[AuthCallback] Checking for student record...
[AuthCallback] Student record found: your@email.com
[AuthCallback] Profile incomplete, redirecting to complete-profile
```

**If student doesn't exist:**
```
[AuthCallback] Student record not found, creating...
[AuthCallback] Student record created, redirecting to profile completion
```

## Manual Workaround

If still stuck, you can manually create the student record:

### 1. Get Your Auth User ID
In browser console while stuck:
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('User ID:', session?.user?.id);
console.log('Email:', session?.user?.email);
```

### 2. Create Student Record in Supabase
Go to Supabase Dashboard → Table Editor → students → Insert row:
```
auth_user_id: [paste the user ID from step 1]
email: [your email]
name: [your name]
email_verified: true
is_verified: false
```

### 3. Refresh the Page
The callback should now complete successfully.

## Prevention

To prevent this in the future:

### 1. Ensure Database Trigger Exists
Run this SQL in Supabase:
```sql
-- Function to create student record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.students (auth_user_id, email, name, email_verified, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email_confirmed_at IS NOT NULL,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Verify RLS Policies
Make sure all the policies from Issue 2 above are in place.

### 3. Test in Incognito
Always test OAuth flows in incognito mode to avoid cached sessions.

## Still Not Working?

If you're still stuck:

1. **Share console logs** - Copy all logs with `[AuthCallback]` prefix
2. **Check URL** - Share the full URL when stuck (remove sensitive tokens)
3. **Check Network tab** - Look for failed requests (401, 403, 500 errors)
4. **Verify Supabase project** - Make sure it's not paused
5. **Try different browser** - Rule out browser-specific issues

## Quick Reset

If you want to start completely fresh:

```sql
-- In Supabase SQL Editor
-- WARNING: This deletes your student record
DELETE FROM students WHERE email = 'your@email.com';

-- Then sign out from Supabase Auth
DELETE FROM auth.sessions WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your@email.com'
);
```

Then clear browser data and try again.
