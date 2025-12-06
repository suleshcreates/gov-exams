-- =====================================================
-- ADMIN RLS DEBUGGING SCRIPT
-- Run these queries to diagnose why admin dashboard is empty
-- =====================================================

-- Step 1: Check if is_admin() function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'is_admin';
-- Expected: Should return 1 row with is_admin function

-- Step 2: Test is_admin() function (will only work if you're logged in)
SELECT is_admin() as am_i_admin;
-- Expected: Should return TRUE if you're logged in as admin

-- Step 3: Check current user's JWT email
SELECT auth.jwt() ->> 'email' as my_email;
-- Expected: Should return your admin email (suleshvi43@gmail.com)

-- Step 4: Verify admin exists in admins table
SELECT * FROM admins WHERE email = 'suleshvi43@gmail.com';
-- Expected: Should return 1 row with admin user

-- Step 5: Check if RLS policies exist for students table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'students';
-- Expected: Should see "Admins can view all students" policy

-- Step 6: Try to query students directly (to test if RLS allows it)
SELECT COUNT(*) as total_students FROM students;
-- Expected: Should return count > 0 if policies are working

-- Step 7: Check students table RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'students';
-- Expected: rowsecurity should be TRUE

-- =====================================================
-- COMMON ISSUES & FIXES
-- =====================================================

-- Issue 1: is_admin() returns FALSE even when logged in as admin
-- Fix: The JWT might not have the email claim
-- Solution: Check auth.jwt() and ensure it contains email

-- Issue 2: Policies exist but queries still fail
-- Fix: RLS might be enabled but policies are wrong
-- Solution: Drop and recreate policies

-- Issue 3: Admin user doesn't exist in admins table
-- Fix: User was created in auth.users but not in admins table
-- Solution: Run INSERT INTO admins...

-- =====================================================
-- NUCLEAR OPTION: Temporarily disable RLS for debugging
-- =====================================================

-- WARNING: Only use for debugging! Re-enable after testing!

-- Disable RLS on students table
-- ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- Query should work now
-- SELECT COUNT(*) FROM students;

-- Re-enable RLS
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FIX: Recreate is_admin() with better logging
-- =====================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_email TEXT;
  admin_exists BOOLEAN;
BEGIN
  -- Get email from JWT
  current_email := auth.jwt() ->> 'email';
  
  -- Log for debugging (will appear in Supabase logs)
  RAISE NOTICE 'Checking admin for email: %', current_email;
  
  -- Check if admin exists
  SELECT EXISTS (
    SELECT 1 FROM admins WHERE email = current_email
  ) INTO admin_exists;
  
  RAISE NOTICE 'Admin exists: %', admin_exists;
  
  RETURN admin_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
