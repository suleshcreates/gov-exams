-- COMPLETE ROLLBACK AND PROPER FIX
-- This will restore functionality while preventing infinite recursion

-- ============================================
-- STEP 1: DROP ALL POLICIES COMPLETELY
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all students policies
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'students') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON students';
    END LOOP;
    
    -- Drop all user_plans policies
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_plans') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_plans';
    END LOOP;
    
    -- Drop all exam_results policies
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'exam_results') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON exam_results';
    END LOOP;
END $$;

-- ============================================
-- STEP 2: DISABLE RLS TEMPORARILY
-- ============================================

ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: CREATE SIMPLE HELPER FUNCTIONS
-- ============================================

-- Drop existing functions
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.get_user_phone();
DROP FUNCTION IF EXISTS public.get_user_email();

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins WHERE auth_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- STEP 4: CREATE SIMPLE, WORKING POLICIES
-- ============================================

-- STUDENTS TABLE
-- Allow authenticated users to read all students (needed for lookups)
CREATE POLICY "students_read_all"
  ON students FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own profile
CREATE POLICY "students_insert_own"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "students_update_own"
  ON students FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Allow admins to do everything
CREATE POLICY "students_admin_all"
  ON students FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- USER_PLANS TABLE
-- Allow authenticated users to read all plans (for admin dashboard)
CREATE POLICY "user_plans_read_all"
  ON user_plans FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert plans
CREATE POLICY "user_plans_insert_auth"
  ON user_plans FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow admins to do everything
CREATE POLICY "user_plans_admin_all"
  ON user_plans FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- EXAM_RESULTS TABLE
-- Allow authenticated users to read all results (for admin dashboard)
CREATE POLICY "exam_results_read_all"
  ON exam_results FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert results
CREATE POLICY "exam_results_insert_auth"
  ON exam_results FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow admins to do everything
CREATE POLICY "exam_results_admin_all"
  ON exam_results FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- STEP 5: RE-ENABLE RLS
-- ============================================

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON students TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON exam_results TO authenticated;

GRANT SELECT ON students TO anon;
GRANT SELECT ON user_plans TO anon;
GRANT SELECT ON exam_results TO anon;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 
  tablename,
  policyname,
  cmd,
  qual IS NOT NULL as has_using,
  with_check IS NOT NULL as has_check
FROM pg_policies
WHERE tablename IN ('students', 'user_plans', 'exam_results')
ORDER BY tablename, policyname;
