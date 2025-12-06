-- ============================================
-- COMPLETE FIX: Auth Callback Stuck Issue
-- This fixes the issue for ALL users, not just one
-- ============================================

-- ============================================
-- PART 1: Fix RLS Policies for Students Table
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own student record" ON students;
DROP POLICY IF EXISTS "Users can create own student record" ON students;
DROP POLICY IF EXISTS "Users can update own student record" ON students;

-- Allow users to read their own student record
CREATE POLICY "Users can read own student record"
ON students FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

-- Allow users to insert their own student record
CREATE POLICY "Users can create own student record"
ON students FOR INSERT
TO authenticated
WITH CHECK (auth_user_id = auth.uid());

-- Allow users to update their own student record
CREATE POLICY "Users can update own student record"
ON students FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- ============================================
-- PART 2: Create/Fix Database Trigger
-- This automatically creates student records for new users
-- ============================================

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert new student record
  INSERT INTO public.students (
    auth_user_id,
    email,
    name,
    avatar_url,
    email_verified,
    is_verified
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email_confirmed_at IS NOT NULL,
    false
  )
  ON CONFLICT (auth_user_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, students.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, students.avatar_url),
    email_verified = EXCLUDED.email_verified;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth
    RAISE WARNING 'Error creating student record: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger to call function on new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PART 3: Backfill Missing Student Records
-- Create student records for existing auth users who don't have one
-- ============================================

INSERT INTO public.students (
  auth_user_id,
  email,
  name,
  avatar_url,
  email_verified,
  is_verified
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', u.email),
  u.raw_user_meta_data->>'avatar_url',
  u.email_confirmed_at IS NOT NULL,
  false
FROM auth.users u
LEFT JOIN public.students s ON s.auth_user_id = u.id
WHERE s.auth_user_id IS NULL
ON CONFLICT (auth_user_id) DO NOTHING;

-- ============================================
-- PART 4: Verify Everything is Working
-- ============================================

-- Check all policies on students table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'students'
ORDER BY policyname;

-- Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Count auth users vs student records
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.students) as total_student_records,
  (SELECT COUNT(*) FROM auth.users u LEFT JOIN public.students s ON u.id = s.auth_user_id WHERE s.auth_user_id IS NULL) as missing_student_records;

-- Show any users without student records
SELECT 
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN public.students s ON u.id = s.auth_user_id
WHERE s.auth_user_id IS NULL;


-- ============================================
-- SUCCESS!
-- ============================================
-- After running this script:
-- 1. All existing users will have student records
-- 2. New users will automatically get student records via trigger
-- 3. RLS policies allow users to read/update their own records
-- 4. Auth callback should work for everyone
-- ============================================
