-- Fix Auth Redirect Issue
-- This script ensures proper RLS policies and creates missing student records

-- Step 1: Drop all existing policies on students table to start fresh
DROP POLICY IF EXISTS "students_select_own" ON students;
DROP POLICY IF EXISTS "students_update_own" ON students;
DROP POLICY IF EXISTS "students_insert_own" ON students;
DROP POLICY IF EXISTS "students_admin_all" ON students;
DROP POLICY IF EXISTS "students_own_select" ON students;
DROP POLICY IF EXISTS "students_own_update" ON students;
DROP POLICY IF EXISTS "students_own_insert" ON students;
DROP POLICY IF EXISTS "students_select" ON students;
DROP POLICY IF EXISTS "students_update" ON students;
DROP POLICY IF EXISTS "students_insert" ON students;
DROP POLICY IF EXISTS "students_delete" ON students;
DROP POLICY IF EXISTS "students_read_all" ON students;
DROP POLICY IF EXISTS "Admins have full access to students" ON students;
DROP POLICY IF EXISTS "Enable all access for admins on students" ON students;

-- Step 2: Enable RLS on students table
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Step 3: Create simple, working RLS policies

-- Policy 1: Allow users to SELECT their own profile
CREATE POLICY "students_select_own"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Policy 2: Allow users to UPDATE their own profile
CREATE POLICY "students_update_own"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Policy 3: Allow users to INSERT their own profile
CREATE POLICY "students_insert_own"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Policy 4: Allow admins full access (using metadata check)
CREATE POLICY "students_admin_all"
  ON students
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Step 4: Create a database function to automatically create student records
-- This function will be triggered when a new user signs up via OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new student record when a new auth user is created
  INSERT INTO public.students (
    auth_user_id,
    email,
    name,
    username,
    phone,
    is_verified,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NULL, -- Will be set when user completes profile
    NULL, -- Will be set when user completes profile
    false,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger to automatically create student records for new OAuth users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Backfill - Create student records for existing OAuth users who don't have one
INSERT INTO public.students (
  auth_user_id,
  email,
  name,
  username,
  phone,
  is_verified,
  created_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  NULL,
  NULL,
  false,
  au.created_at
FROM auth.users au
LEFT JOIN public.students s ON s.auth_user_id = au.id
WHERE s.auth_user_id IS NULL
  AND au.email IS NOT NULL
ON CONFLICT (auth_user_id) DO NOTHING;

-- Step 7: Verify the fix - Check all students
SELECT 
  s.id,
  s.auth_user_id,
  s.email,
  s.username,
  s.phone,
  s.is_verified,
  s.created_at
FROM students s
ORDER BY s.created_at DESC
LIMIT 10;
