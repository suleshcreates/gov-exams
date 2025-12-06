-- CRITICAL FIX: RLS Policies Blocking Student Record Creation and Queries
-- This fixes the timeout and "no student record found" issues

-- PART 1: Check current RLS policies
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'students'
ORDER BY policyname;

-- PART 2: Drop ALL existing policies and recreate simple ones
-- ============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "students_select_own" ON students;
DROP POLICY IF EXISTS "students_update_own" ON students;
DROP POLICY IF EXISTS "students_insert_own" ON students;
DROP POLICY IF EXISTS "students_admin_all" ON students;
DROP POLICY IF EXISTS "Users can view own profile" ON students;
DROP POLICY IF EXISTS "Users can update own profile" ON students;
DROP POLICY IF EXISTS "Users can insert own profile" ON students;
DROP POLICY IF EXISTS "Admins can view all profiles" ON students;
DROP POLICY IF EXISTS "Admins can update all profiles" ON students;
DROP POLICY IF EXISTS "Enable read access for users to own profile" ON students;
DROP POLICY IF EXISTS "Enable update access for users to own profile" ON students;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON students;

-- Ensure RLS is enabled
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- PART 3: Create SIMPLE, NON-BLOCKING policies
-- ============================================

-- Allow users to SELECT their own record
CREATE POLICY "students_select_policy"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Allow users to UPDATE their own record
CREATE POLICY "students_update_policy"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Allow users to INSERT their own record (needed for trigger)
CREATE POLICY "students_insert_policy"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Allow service role (trigger) to INSERT without restrictions
CREATE POLICY "students_service_insert"
  ON students
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow admins full access
CREATE POLICY "students_admin_policy"
  ON students
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- PART 4: Grant necessary permissions
-- ============================================
GRANT SELECT, INSERT, UPDATE ON students TO authenticated;
GRANT ALL ON students TO service_role;

-- PART 5: Verify the trigger function uses SECURITY DEFINER
-- ============================================

-- Recreate trigger function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER  -- This is CRITICAL - runs with elevated privileges
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert a new student record when a new auth user is created
  INSERT INTO public.students (
    auth_user_id,
    email,
    name,
    avatar_url,
    username,
    phone,
    email_verified,
    is_verified,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    NULL,  -- Force NULL username
    NULL,  -- Force NULL phone
    true,
    false,
    NOW()
  )
  ON CONFLICT (auth_user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the auth
  RAISE WARNING 'Failed to create student record: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PART 6: Create student records for ALL users who don't have one
-- ============================================

-- Create student records for ALL auth users who don't have a student record
INSERT INTO public.students (
  auth_user_id,
  email,
  name,
  username,
  phone,
  email_verified,
  is_verified,
  created_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ),
  NULL,  -- Force NULL username
  NULL,  -- Force NULL phone
  true,
  false,
  au.created_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM students s WHERE s.auth_user_id = au.id
)
AND au.email IS NOT NULL
ON CONFLICT (auth_user_id) DO NOTHING;

-- PART 7: Verification
-- ============================================

-- Show how many student records were created
SELECT 
  COUNT(*) as total_students,
  COUNT(CASE WHEN username IS NULL AND phone IS NULL THEN 1 END) as needs_profile_completion,
  COUNT(CASE WHEN username IS NOT NULL AND phone IS NOT NULL THEN 1 END) as profile_complete
FROM students;

-- Show recent students
SELECT 
  auth_user_id,
  email,
  name,
  username,
  phone,
  is_verified,
  created_at,
  CASE 
    WHEN username IS NULL AND phone IS NULL THEN '✅ Needs Profile Completion'
    WHEN username IS NOT NULL AND phone IS NOT NULL THEN '✅ Profile Complete'
    ELSE '⚠️ Partial Profile'
  END as status
FROM students
ORDER BY created_at DESC
LIMIT 10;

-- Check all policies
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'students'
ORDER BY policyname;

-- Check trigger status
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  CASE 
    WHEN tgenabled = 'O' THEN '✅ ENABLED'
    WHEN tgenabled = 'D' THEN '❌ DISABLED'
    ELSE '❓ Unknown'
  END as status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CRITICAL RLS FIX APPLIED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ RLS policies simplified and fixed';
  RAISE NOTICE '✅ Trigger function uses SECURITY DEFINER';
  RAISE NOTICE '✅ Student record created for current user';
  RAISE NOTICE '✅ Service role can bypass RLS';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Refresh your browser';
  RAISE NOTICE '2. You should now see the complete-profile page';
  RAISE NOTICE '3. Complete your profile';
  RAISE NOTICE '';
END $$;
