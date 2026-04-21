# Fix Plan Template 409 Error

## Problem
Getting a **409 Conflict** error when trying to update plan templates in the admin panel.

## Error Message
```
Failed to load resource: the server responded with a status of 409 ()
[adminService] Error updating plan template: Object
Error saving plan: Object
```

## Root Cause
The RLS (Row Level Security) policies on the `plan_templates` table are blocking admin updates.

## Quick Fix

### Step 1: Run the RLS Fix Script

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of `supabase-fix-plan-templates-rls.sql`
5. Click **Run**
6. Verify you see success messages

### Step 2: Verify Admin User

Make sure your admin user has the admin role set:

```sql
-- Check if you're an admin
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as user_role,
  u.raw_app_meta_data->>'role' as app_role,
  EXISTS (
    SELECT 1 FROM admins WHERE admins.auth_user_id = u.id
  ) as has_admin_record
FROM auth.users u
WHERE u.email = 'your-admin-email@example.com';
```

If you're not an admin, set the role:

```sql
-- Set admin role in user metadata
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-admin-email@example.com';

-- Also create admin record if it doesn't exist
INSERT INTO admins (auth_user_id, email, name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email),
  'admin'
FROM auth.users
WHERE email = 'your-admin-email@example.com'
ON CONFLICT (auth_user_id) DO NOTHING;
```

### Step 3: Sign Out and Sign In Again

1. Click **Logout** in the admin panel
2. Close your browser completely
3. Reopen browser
4. Go to `/admin/login`
5. Sign in again

### Step 4: Test Plan Template Update

1. Go to **Pricing** > **Plan Templates**
2. Click **Edit** on any plan
3. Make a change
4. Click **Update Plan**
5. Verify it saves successfully

## What the Fix Does

The SQL script:

1. **Drops old policies** that might be blocking updates
2. **Creates new policies** that allow:
   - Everyone to read plan templates (for students)
   - Admins to insert, update, and delete plan templates
3. **Enables RLS** on the tables
4. **Grants permissions** to authenticated users
5. **Fixes related tables** (subject_pricing, plan_discounts)

## Verification

After running the fix, you should see these policies:

```sql
-- Check policies
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'plan_templates';
```

Expected output:
- `Enable read access for all users` (SELECT)
- `Enable insert for admins` (INSERT)
- `Enable update for admins` (UPDATE)
- `Enable delete for admins` (DELETE)

## Common Issues

### Issue 1: "Permission Denied" Error

**Cause**: You're not logged in as an admin

**Fix**:
1. Check if you have admin role (see Step 2 above)
2. Sign out and sign in again
3. Clear browser cache

### Issue 2: "Table doesn't exist" Error

**Cause**: Plan templates table not created

**Fix**:
Run the schema creation script first:
```bash
# In Supabase SQL Editor
# Run: supabase-plan-pricing-schema.sql
```

### Issue 3: Still Getting 409 Error

**Cause**: Browser cache or session issue

**Fix**:
1. Open DevTools (F12)
2. Go to **Application** tab
3. Clear all **Cookies**
4. Clear **Local Storage**
5. Clear **Session Storage**
6. Close browser
7. Reopen and try again

### Issue 4: "Admins table doesn't exist"

**Cause**: Admin panel schema not set up

**Fix**:
```sql
-- Create admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Admins can view all admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.auth_user_id = auth.uid()
    )
  );
```

## Testing Checklist

After applying the fix:

- [ ] Can view plan templates list
- [ ] Can click "Edit" on a plan
- [ ] Can modify plan details
- [ ] Can click "Update Plan"
- [ ] No 409 errors in console
- [ ] Plan is updated successfully
- [ ] Changes are saved in database
- [ ] Can create new plan templates
- [ ] Can delete plan templates
- [ ] Students can view active plans

## Browser Console Debugging

Check the console for these logs:

```
[adminService] Updating plan template: [id] [data]
[adminService] Plan template updated successfully: [plan]
```

If you see error logs:

```
[adminService] Supabase error updating plan template: {...}
```

Look for:
- `code: '42501'` = Permission denied (not admin)
- `code: '23505'` = Duplicate name
- `code: 'PGRST116'` = Row not found

## Manual Update (Emergency)

If you need to update a plan manually:

```sql
-- Update plan template directly
UPDATE plan_templates
SET 
  name = 'Updated Plan Name',
  description = 'Updated description',
  price = 999,
  validity_days = 365,
  subjects = '["subject-id-1", "subject-id-2"]'::jsonb,
  badge = 'Popular',
  display_order = 1,
  is_active = true,
  updated_at = NOW()
WHERE id = 'your-plan-id';
```

## Prevention

To prevent this issue in the future:

1. **Always run RLS fix scripts** after creating new tables
2. **Test admin operations** after schema changes
3. **Keep admin role** properly set in user metadata
4. **Monitor Supabase logs** for permission errors
5. **Document admin users** and their roles

## Success Indicators

You'll know it's fixed when:

1. No 409 errors in console
2. Plan updates save successfully
3. Console shows: "Plan template updated successfully"
4. Changes appear in the plan templates list
5. Database shows updated values
6. No permission errors in Supabase logs

## Need More Help?

If the issue persists:

1. Check Supabase logs for detailed errors
2. Verify RLS policies are correct
3. Confirm you're logged in as admin
4. Try in incognito mode
5. Check network tab for response details
6. Export error logs and share for support
