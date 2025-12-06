# Fix Signup Errors - Quick Guide

## Issues Fixed

1. ✅ **406 Error on username check** - Changed from `.single()` to `.maybeSingle()`
2. ✅ **500 Error on signup** - Manual student record creation instead of relying on trigger

## Steps to Complete the Fix

### 1. Run the Fix Script in Supabase

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy and paste** the contents of `supabase-fix-trigger.sql`
3. **Click "Run"**

This will:
- Fix the trigger function to handle errors gracefully
- Temporarily allow NULL values for migration
- Update any existing records
- Re-enable NOT NULL constraints

### 2. Restart Your Dev Server

The code changes have been applied. Restart the server to see the changes:

```bash
# The server should auto-reload, but if not:
npm run dev
```

### 3. Test Signup Again

1. **Go to** http://localhost:8080/signup
2. **Fill in the form:**
   - Name: Your Name
   - Username: testuser (will check availability)
   - Email: your.email@gmail.com
   - Password: password123
3. **Click "Create Account"**
4. **Check your email** for verification link

## What Changed in the Code

### 1. Username/Email Availability Check
**Before:**
```typescript
.single(); // Throws 406 if no results
```

**After:**
```typescript
.maybeSingle(); // Returns null if no results, no error
```

### 2. Student Record Creation
**Before:**
```typescript
// Relied on database trigger
return { user: authData.user };
```

**After:**
```typescript
// Manually create student record
await supabase.from('students').insert([{
  email, username, name, auth_user_id, email_verified, password_hash
}]);
```

## Expected Behavior Now

### Username Check
- ✅ Types username → Real-time availability check
- ✅ Shows checkmark if available
- ✅ Shows X if taken
- ✅ No 406 errors

### Signup
- ✅ Creates Supabase Auth user
- ✅ Creates student record in database
- ✅ Sends verification email
- ✅ Redirects to login with success message

### Email Verification
- ✅ Click link in email
- ✅ Account marked as verified
- ✅ Can now login

## Troubleshooting

### Still Getting 500 Error?
1. Check Supabase logs in Dashboard → Logs
2. Make sure the fix script ran successfully
3. Verify the trigger function exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

### Username Check Still Failing?
1. Check browser console for errors
2. Verify RLS policies allow SELECT on students table
3. Try with a different username

### Email Not Received?
1. Check spam folder
2. Verify Supabase email settings
3. Check Supabase logs for email delivery

## Testing Checklist

- [ ] Username availability check works (no 406 errors)
- [ ] Signup creates account successfully (no 500 errors)
- [ ] Verification email is received
- [ ] Clicking verification link works
- [ ] Can login after verification
- [ ] Can login with both email and username

## Success!

Once you run the fix script and test signup, everything should work smoothly! 🎉

---

**Need help?** Check the browser console and Supabase logs for detailed error messages.
