-- FIX ADMIN PERMISSIONS - Allow authenticated admins to modify data
-- This uses a SECURITY DEFINER function to safely check admin status

-- ============================================
-- 1. Create Helper Function
-- ============================================
CREATE OR REPLACE FUNCTION check_if_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM admins
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_if_admin() TO authenticated;

-- ============================================
-- 2. SUBJECTS - Allow admin modification
-- ============================================
DROP POLICY IF EXISTS "Service role modify subjects" ON subjects;
-- Keep "Public read subjects"

CREATE POLICY "Admins modify subjects"
  ON subjects FOR ALL
  TO authenticated
  USING (check_if_admin())
  WITH CHECK (check_if_admin());

-- ============================================
-- 3. PLAN_TEMPLATES - Allow admin modification
-- ============================================
DROP POLICY IF EXISTS "Service role modify templates" ON plan_templates;
DROP POLICY IF EXISTS "Service role full access templates" ON plan_templates;
-- Keep "Public read templates"

CREATE POLICY "Admins modify templates"
  ON plan_templates FOR ALL
  TO authenticated
  USING (check_if_admin())
  WITH CHECK (check_if_admin());

-- ============================================
-- 4. QUESTION_SETS - Allow admin modification
-- ============================================
DROP POLICY IF EXISTS "Service role modify question_sets" ON question_sets;
-- Keep "Public read question_sets"

CREATE POLICY "Admins modify question_sets"
  ON question_sets FOR ALL
  TO authenticated
  USING (check_if_admin())
  WITH CHECK (check_if_admin());

-- ============================================
-- 5. QUESTIONS - Allow admin modification
-- ============================================
DROP POLICY IF EXISTS "Service role modify questions" ON questions;
-- Keep "Public read questions"

CREATE POLICY "Admins modify questions"
  ON questions FOR ALL
  TO authenticated
  USING (check_if_admin())
  WITH CHECK (check_if_admin());

-- ============================================
-- 6. USER_PLANS - Allow admin full access
-- ============================================
-- Keep existing policies for users
-- Add admin override
CREATE POLICY "Admins full access plans"
  ON user_plans FOR ALL
  TO authenticated
  USING (check_if_admin())
  WITH CHECK (check_if_admin());

-- ============================================
-- 7. EXAM_RESULTS - Allow admin full access
-- ============================================
-- Keep existing policies for users
-- Add admin override
CREATE POLICY "Admins full access results"
  ON exam_results FOR ALL
  TO authenticated
  USING (check_if_admin())
  WITH CHECK (check_if_admin());

-- ============================================
-- 8. STUDENTS - Allow admin full access
-- ============================================
-- Keep existing policies for users
-- Add admin override
CREATE POLICY "Admins full access students"
  ON students FOR ALL
  TO authenticated
  USING (check_if_admin())
  WITH CHECK (check_if_admin());

-- ============================================
-- 9. ADMINS - Allow admins to read admins (for context)
-- ============================================
-- Currently only service_role can access.
-- Allow admins to read the list of admins
CREATE POLICY "Admins read admins"
  ON admins FOR SELECT
  TO authenticated
  USING (check_if_admin());

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ ADMIN PERMISSIONS FIXED!';
  RAISE NOTICE '';
  RAISE NOTICE 'Created check_if_admin() function.';
  RAISE NOTICE 'Updated policies for Subjects, Plans, Questions, etc.';
  RAISE NOTICE 'Admins logged in via frontend can now modify data.';
  RAISE NOTICE '';
END $$;
