-- ============================================
-- ENABLE ADMIN DIRECT ACCESS MIGRATION (FIXED)
-- ============================================
-- Run this in Supabase SQL Editor to enable persistent RLS policies
-- that allow admins (authenticated via Supabase Auth) to manage data directly.

-- 1. Ensure `is_admin()` exists and works
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Checks if the authenticated user's ID exists in the 'admins' table 'auth_user_id' column
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.auth_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. POLICIES (Drop existing first to avoid errors)

-- ================= PLAN TEMPLATES =================
ALTER TABLE plan_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access plan_templates" ON plan_templates;
CREATE POLICY "Admins full access plan_templates" ON plan_templates
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public read plan_templates" ON plan_templates;
CREATE POLICY "Public read plan_templates" ON plan_templates
  FOR SELECT TO public USING (true);


-- ================= USER PLANS =================
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access user_plans" ON user_plans;
CREATE POLICY "Admins full access user_plans" ON user_plans
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Note: Keeps existing user-specific policies if any


-- ================= SUBJECTS =================
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access subjects" ON subjects;
CREATE POLICY "Admins full access subjects" ON subjects
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public read subjects" ON subjects;
CREATE POLICY "Public read subjects" ON subjects
  FOR SELECT TO public USING (true);


-- ================= QUESTIONS & SETS =================
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access question_sets" ON question_sets;
CREATE POLICY "Admins full access question_sets" ON question_sets
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public read question_sets" ON question_sets;
CREATE POLICY "Public read question_sets" ON question_sets
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins full access questions" ON questions;
CREATE POLICY "Admins full access questions" ON questions
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public read questions" ON questions;
CREATE POLICY "Public read questions" ON questions
  FOR SELECT TO public USING (true);


-- ================= EXAM RESULTS =================
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access exam_results" ON exam_results;
CREATE POLICY "Admins full access exam_results" ON exam_results
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());


-- ================= ADMINS TABLE ITSELF =================
DROP POLICY IF EXISTS "Admins read self" ON admins;
CREATE POLICY "Admins read self" ON admins
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());


-- ================= SUBJECT PRICING =================
ALTER TABLE subject_pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access subject_pricing" ON subject_pricing;
CREATE POLICY "Admins full access subject_pricing" ON subject_pricing
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public read subject_pricing" ON subject_pricing;
CREATE POLICY "Public read subject_pricing" ON subject_pricing
  FOR SELECT TO public USING (true);
