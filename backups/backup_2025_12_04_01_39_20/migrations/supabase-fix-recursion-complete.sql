-- COMPLETE Fix for Infinite Recursion - Nuclear Option
-- This completely removes recursion by simplifying all policies

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================

-- Drop all students policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'students') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON students';
    END LOOP;
END $$;

-- Drop all user_plans policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_plans') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_plans';
    END LOOP;
END $$;

-- Drop all exam_results policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'exam_results') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON exam_results';
    END LOOP;
END $$;

-- ============================================
-- STEP 2: CREATE SIMPLE ADMIN FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins WHERE auth_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- STEP 3: STUDENTS TABLE - SIMPLE POLICIES
-- ============================================

-- Allow users to see their own profile
CREATE POLICY "students_own_select"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "students_own_update"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Allow users to insert their own profile
CREATE POLICY "students_own_insert"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Allow admins full access
CREATE POLICY "students_admin_all"
  ON students
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- STEP 4: USER_PLANS TABLE - NO RECURSION
-- ============================================

-- Allow admins full access (first policy, highest priority)
CREATE POLICY "user_plans_admin_all"
  ON user_plans
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Allow users to see plans with their phone number
CREATE POLICY "user_plans_own_select"
  ON user_plans
  FOR SELECT
  TO authenticated
  USING (
    student_phone = (SELECT phone FROM students WHERE auth_user_id = auth.uid() LIMIT 1)
  );

-- Allow users to insert plans with their phone number
CREATE POLICY "user_plans_own_insert"
  ON user_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_phone = (SELECT phone FROM students WHERE auth_user_id = auth.uid() LIMIT 1)
  );

-- ============================================
-- STEP 5: EXAM_RESULTS TABLE - NO RECURSION
-- ============================================

-- Allow admins full access (first policy, highest priority)
CREATE POLICY "exam_results_admin_all"
  ON exam_results
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Allow users to see their own results
CREATE POLICY "exam_results_own_select"
  ON exam_results
  FOR SELECT
  TO authenticated
  USING (
    student_phone = (SELECT phone FROM students WHERE auth_user_id = auth.uid() LIMIT 1) OR
    student_phone = (SELECT email FROM students WHERE auth_user_id = auth.uid() LIMIT 1)
  );

-- Allow users to insert their own results
CREATE POLICY "exam_results_own_insert"
  ON exam_results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_phone = (SELECT phone FROM students WHERE auth_user_id = auth.uid() LIMIT 1) OR
    student_phone = (SELECT email FROM students WHERE auth_user_id = auth.uid() LIMIT 1)
  );

-- ============================================
-- STEP 6: ENSURE RLS IS ENABLED
-- ============================================

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 7: GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON students TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON exam_results TO authenticated;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('students', 'user_plans', 'exam_results')
ORDER BY tablename, policyname;
