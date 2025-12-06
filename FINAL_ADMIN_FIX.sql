-- FINAL ADMIN FIX - Fixes missing column error
-- 1. Adds 'role' column to admins table if missing
-- 2. Inserts admin user safely
-- 3. Re-applies permissions

-- ============================================
-- 1. Fix Schema - Add role column
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'role') THEN
        ALTER TABLE admins ADD COLUMN role text DEFAULT 'admin';
    END IF;
END $$;

-- ============================================
-- 2. Ensure Admin User Exists
-- ============================================
-- We use a safe insert block instead of ON CONFLICT to avoid constraint errors if email isn't PK
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM admins WHERE email = 'dmltadamany23@gmail.com') THEN
        INSERT INTO admins (email, name, role)
        VALUES ('dmltadamany23@gmail.com', 'Main Admin', 'admin');
    ELSE
        UPDATE admins 
        SET role = 'admin' 
        WHERE email = 'dmltadamany23@gmail.com';
    END IF;
END $$;

-- ============================================
-- 3. Update Check Function
-- ============================================
CREATE OR REPLACE FUNCTION check_if_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_email text;
  is_admin_in_table boolean;
  is_admin_in_metadata boolean;
BEGIN
  -- Get email from JWT
  user_email := auth.jwt() ->> 'email';
  
  -- Check 1: Is email in admins table? (Case insensitive)
  SELECT EXISTS (
    SELECT 1 FROM admins
    WHERE lower(email) = lower(user_email)
  ) INTO is_admin_in_table;

  -- Check 2: Does user have admin role in metadata?
  is_admin_in_metadata := (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin') OR 
                          (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

  RETURN is_admin_in_table OR is_admin_in_metadata;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION check_if_admin() TO authenticated;

-- ============================================
-- 4. Re-Apply Policies
-- ============================================

-- SUBJECTS
DROP POLICY IF EXISTS "Admins modify subjects" ON subjects;
CREATE POLICY "Admins modify subjects" ON subjects FOR ALL TO authenticated USING (check_if_admin()) WITH CHECK (check_if_admin());

-- PLAN TEMPLATES
DROP POLICY IF EXISTS "Admins modify templates" ON plan_templates;
CREATE POLICY "Admins modify templates" ON plan_templates FOR ALL TO authenticated USING (check_if_admin()) WITH CHECK (check_if_admin());

-- QUESTION SETS
DROP POLICY IF EXISTS "Admins modify question_sets" ON question_sets;
CREATE POLICY "Admins modify question_sets" ON question_sets FOR ALL TO authenticated USING (check_if_admin()) WITH CHECK (check_if_admin());

-- QUESTIONS
DROP POLICY IF EXISTS "Admins modify questions" ON questions;
CREATE POLICY "Admins modify questions" ON questions FOR ALL TO authenticated USING (check_if_admin()) WITH CHECK (check_if_admin());

-- USER PLANS
DROP POLICY IF EXISTS "Admins full access plans" ON user_plans;
CREATE POLICY "Admins full access plans" ON user_plans FOR ALL TO authenticated USING (check_if_admin()) WITH CHECK (check_if_admin());

-- EXAM RESULTS
DROP POLICY IF EXISTS "Admins full access results" ON exam_results;
CREATE POLICY "Admins full access results" ON exam_results FOR ALL TO authenticated USING (check_if_admin()) WITH CHECK (check_if_admin());

-- STUDENTS
DROP POLICY IF EXISTS "Admins full access students" ON students;
CREATE POLICY "Admins full access students" ON students FOR ALL TO authenticated USING (check_if_admin()) WITH CHECK (check_if_admin());

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ FINAL ADMIN FIX APPLIED!';
  RAISE NOTICE '1. Added role column to admins table';
  RAISE NOTICE '2. Added admin user';
  RAISE NOTICE '3. Updated permissions';
  RAISE NOTICE '';
END $$;
