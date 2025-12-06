# Troubleshooting Admin Panel 500 Errors

## You have tables but still getting 500 errors?

This is likely a **Row Level Security (RLS)** permissions issue. Here's how to fix it:

## Quick Diagnosis

### Step 1: Run the Diagnostic Script

1. Open Supabase SQL Editor
2. Run `supabase-diagnose-issue.sql`
3. Check the results:
   - ✅ All tables should exist
   - 🔒 RLS should be enabled
   - ✅ Policies should exist
   - ✅ Your user should show as admin

### Step 2: Check Your Admin User

In Supabase Dashboard → Authentication → Users:

1. Click on your user
2. Look at **User Metadata** section
3. You should see:
   ```json
   {
     "role": "admin"
   }
   ```

If you don't see this, add it and save.

### Step 3: Fix RLS Policies

If the diagnostic shows missing or incorrect policies:

1. Open `supabase-fix-rls-policies.sql`
2. Run it in Supabase SQL Editor
3. This will recreate all policies correctly

## Common Issues & Solutions

### Issue 1: "new row violates row-level security policy"

**Cause:** RLS is blocking your insert/update
**Solution:** 
- Make sure your user has `"role": "admin"` in user metadata
- Run `supabase-fix-rls-policies.sql` to fix policies

### Issue 2: 500 error with no specific message

**Cause:** RLS is silently blocking the operation
**Solution:**
- Temporarily disable RLS to test (see below)
- Then fix the policies properly

### Issue 3: Can read but can't write

**Cause:** SELECT policy works but INSERT/UPDATE/DELETE policies don't
**Solution:**
- Run `supabase-fix-rls-policies.sql`
- Policies need to check both `raw_user_meta_data` and `raw_app_meta_data`

## Temporary Fix (Development Only)

If you need to test quickly, you can temporarily disable RLS:

```sql
-- ONLY FOR DEVELOPMENT/TESTING
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_sets DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
```

⚠️ **WARNING:** This removes all security. Only use for local development!

To re-enable:
```sql
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
```

## Verify It's Working

After fixing, test by:

1. Go to Admin Panel → Subjects
2. Click "Add Subject"
3. Create a test subject
4. If it works, RLS is configured correctly! ✅

## Still Not Working?

Check the browser console for the exact error:

1. Open DevTools (F12)
2. Go to Console tab
3. Try the operation again
4. Look for the Supabase error message
5. Share the error message for more specific help

## Need More Help?

Run this query to see your current user's permissions:

```sql
SELECT 
  auth.uid() as my_user_id,
  (SELECT raw_user_meta_data FROM auth.users WHERE id = auth.uid()) as my_metadata,
  (SELECT raw_app_meta_data FROM auth.users WHERE id = auth.uid()) as my_app_metadata;
```

This will show if your admin role is properly set.
