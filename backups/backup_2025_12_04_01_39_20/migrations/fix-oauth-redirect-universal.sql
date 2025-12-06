-- ============================================
-- Universal OAuth Redirect Fix
-- ============================================
-- This script fixes the OAuth redirect issue for ALL users
-- No manual configuration needed - just run it!
-- ============================================

-- PART 1: Fix RLS Policies
-- ============================================

-- Drop all existing conflicting policies
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

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create clean, simple RLS policies
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

-- PART 2: Automatic Student Record Creation
-- ============================================

-- Create function to handle new OAuth users
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
    -- Try to get name from OAuth metadata, fallback to email username
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NULL, -- Will be set when user completes profile
    NULL, -- Will be set when user completes profile
    false,
    NOW()
  )
  ON CONFLICT (auth_user_id) DO NOTHING; -- Prevent duplicates
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic student record creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PART 3: Backfill Existing Users
-- ============================================

-- Create student records for existing OAuth users who don't have one
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
LEFT JOIN public.students s ON s.auth_user_id = au.id
WHERE s.auth_user_id IS NULL
  AND au.email IS NOT NULL
ON CONFLICT (auth_user_id) DO NOTHING;

-- PART 4: Verification
-- ============================================

-- Show summary of students
SELECT 
  COUNT(*) as total_students,
  COUNT(CASE WHEN username IS NOT NULL THEN 1 END) as with_username,
  COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) as with_phone,
  COUNT(CASE WHEN username IS NOT NULL AND phone IS NOT NULL THEN 1 END) as complete_profiles
FROM public.students;

-- Show recent students
SELECT *
FROM public.students
ORDER BY created_at DESC
LIMIT 10;

-- Show RLS policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'students'
ORDER BY policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ OAuth redirect fix applied successfully!';
  RAISE NOTICE '✅ RLS policies updated';
  RAISE NOTICE '✅ Automatic student record creation enabled';
  RAISE NOTICE '✅ Existing users backfilled';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 All users can now sign in with Google OAuth!';
END $$;
