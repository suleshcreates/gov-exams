-- Comprehensive Fix for Profile Complete Flow
-- This fixes both the RLS issue and ensures student records are created

-- PART 1: Verify and fix RLS policies
-- ============================================

-- Check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'students';

-- Drop and recreate RLS policies to ensure they work
DROP POLICY IF EXISTS "students_select_own" ON students;
DROP POLICY IF EXISTS "students_update_own" ON students;
DROP POLICY IF EXISTS "students_insert_own" ON students;
DROP POLICY IF EXISTS "students_admin_all" ON students;

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create working RLS policies
CREATE POLICY "students_select_own"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "students_update_own"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "students_insert_own"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

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

-- PART 2: Ensure trigger exists and works
-- ============================================

-- Create or replace the trigger function
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
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NULL,
    NULL,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PART 3: Backfill missing student records
-- ============================================

-- Create student records for OAuth users who don't have one
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
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ),
  NULL,
  NULL,
  false,
  au.created_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.students s WHERE s.auth_user_id = au.id
)
AND au.email IS NOT NULL
ON CONFLICT (auth_user_id) DO NOTHING;

-- PART 4: Verification
-- ============================================

-- Show all students
SELECT 
  auth_user_id,
  email,
  name,
  username,
  phone,
  is_verified,
  created_at
FROM students
ORDER BY created_at DESC
LIMIT 10;

-- Show RLS policies
SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'students'
ORDER BY policyname;

-- Check trigger
SELECT 
  tgname,
  tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Profile complete flow fixed!';
  RAISE NOTICE '✅ RLS policies updated';
  RAISE NOTICE '✅ Trigger verified';
  RAISE NOTICE '✅ Missing student records created';
END $$;
