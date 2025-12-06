-- ULTIMATE Fix for Infinite Recursion
-- Uses SECURITY DEFINER functions to bypass RLS in subqueries

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'students') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON students';
    END LOOP;
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_plans') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_plans';
    END LOOP;
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'exam_results') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON exam_results';
    END LOOP;
END $$;

-- ============================================
-- STEP 2: CREATE HELPER FUNCTIONS (BYPASS RLS)
-- ============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins WHERE auth_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get user's phone (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_phone()
RETURNS TEXT AS $$
DECLARE
  user_phone TEXT;
BEGIN
  SELECT phone INTO user_phone
  FROM public.students
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
  
  RETURN user_phone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get user's email (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_email()
RETURNS TEXT AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM public.students
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
  
  RETURN user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- STEP 3: STUDENTS TABLE - SIMPLE POLICIES
-- ============================================

CREATE POLICY "students_own_select"
  ON students FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "students_own_update"
  ON students FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "students_own_insert"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "students_admin_all"
  ON students FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- STEP 4: USER_PLANS - USE HELPER FUNCTIONS
-- ============================================

CREATE POLICY "user_plans_admin_all"
  ON user_plans FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "user_plans_own_select"
  ON user_plans FOR SELECT
  TO authenticated
  USING (student_phone = public.get_user_phone());

CREATE POLICY "user_plans_own_insert"
  ON user_plans FOR INSERT
  TO authenticated
  WITH CHECK (student_phone = public.get_user_phone());

-- ============================================
-- STEP 5: EXAM_RESULTS - USE HELPER FUNCTIONS
-- ============================================

CREATE POLICY "exam_results_admin_all"
  ON exam_results FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "exam_results_own_select"
  ON exam_results FOR SELECT
  TO authenticated
  USING (
    student_phone = public.get_user_phone() OR
    student_phone = public.get_user_email()
  );

CREATE POLICY "exam_results_own_insert"
  ON exam_results FOR INSERT
  TO authenticated
  WITH CHECK (
    student_phone = public.get_user_phone() OR
    student_phone = public.get_user_email()
  );

-- ============================================
-- STEP 6: ENABLE RLS
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
  cmd
FROM pg_policies
WHERE tablename IN ('students', 'user_plans', 'exam_results')
ORDER BY tablename, policyname;
