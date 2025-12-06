-- ENHANCED ADMIN FIX
-- 1. Inserts the admin email into the admins table
-- 2. Updates the check function to be more robust (case-insensitive + metadata check)

-- ============================================
-- 1. Ensure Admin User Exists
-- ============================================
INSERT INTO admins (email, role, name)
VALUES ('dmltadamany23@gmail.com', 'admin', 'Main Admin')
ON CONFLICT (email) DO UPDATE
SET role = 'admin';

-- ============================================
-- 2. Update Check Function (More Robust)
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

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION check_if_admin() TO authenticated;

-- ============================================
-- 3. Re-Apply Policies (Just to be safe)
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

-- ============================================
-- 4. Debugging Helper
-- ============================================
-- Allow anyone to read admins table temporarily to verify it's populated
DROP POLICY IF EXISTS "Public read admins debug" ON admins;
CREATE POLICY "Public read admins debug" ON admins FOR SELECT TO authenticated USING (true);

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ ENHANCED ADMIN FIX APPLIED!';
  RAISE NOTICE '';
  RAISE NOTICE '1. Added dmltadamany23@gmail.com to admins table';
  RAISE NOTICE '2. Updated check_if_admin() to be case-insensitive';
  RAISE NOTICE '3. Added fallback to check user_metadata for admin role';
  RAISE NOTICE '';
END $$;
