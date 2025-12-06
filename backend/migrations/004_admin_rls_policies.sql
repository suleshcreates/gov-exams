-- =====================================================
-- Admin RLS Policies - Safe Version
-- Only includes tables that exist in your database
-- =====================================================

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Students Table - Admin Read Access
-- =====================================================

CREATE POLICY "Admins can view all students"
  ON students
  FOR SELECT
  USING (is_admin());

-- =====================================================
-- User Plans Table - Admin Read Access
-- =====================================================

CREATE POLICY "Admins can view all user plans"
  ON user_plans
  FOR SELECT
  USING (is_admin());

-- =====================================================
-- Exam Results Table - Admin Read Access
-- =====================================================

CREATE POLICY "Admins can view all exam results"
  ON exam_results
  FOR SELECT
  USING (is_admin());

-- =====================================================
-- Subjects Table - Admin Read/Write Access
-- =====================================================

CREATE POLICY "Admins can view all subjects"
  ON subjects
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can create subjects"
  ON subjects
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update subjects"
  ON subjects
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete subjects"
  ON subjects
  FOR DELETE
  USING (is_admin());

-- =====================================================
-- Question Sets Table - Admin Read/Write Access
-- =====================================================

CREATE POLICY "Admins can view all question sets"
  ON question_sets
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can create question sets"
  ON question_sets
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update question sets"
  ON question_sets
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete question sets"
  ON question_sets
  FOR DELETE
  USING (is_admin());

-- =====================================================
-- Questions Table - Admin Read/Write Access
-- =====================================================

CREATE POLICY "Admins can view all questions"
  ON questions
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can create questions"
  ON questions
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update questions"
  ON questions
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete questions"
  ON questions
  FOR DELETE
  USING (is_admin());

-- =====================================================
-- Exams Table - Admin Read Access (if exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'exams') THEN
    EXECUTE 'CREATE POLICY "Admins can view all exams" ON exams FOR SELECT USING (is_admin())';
  END IF;
END $$;

-- =====================================================
-- Subject Pricing Table - Admin Read/Write Access (if exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subject_pricing') THEN
    EXECUTE 'CREATE POLICY "Admins can view all subject pricing" ON subject_pricing FOR SELECT USING (is_admin())';
    EXECUTE 'CREATE POLICY "Admins can create subject pricing" ON subject_pricing FOR INSERT WITH CHECK (is_admin())';
    EXECUTE 'CREATE POLICY "Admins can update subject pricing" ON subject_pricing FOR UPDATE USING (is_admin())';
    EXECUTE 'CREATE POLICY "Admins can delete subject pricing" ON subject_pricing FOR DELETE USING (is_admin())';
  END IF;
END $$;

-- =====================================================
-- Plan Templates Table - Admin Read/Write Access (if exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'plan_templates') THEN
    EXECUTE 'CREATE POLICY "Admins can view all plan templates" ON plan_templates FOR SELECT USING (is_admin())';
    EXECUTE 'CREATE POLICY "Admins can create plan templates" ON plan_templates FOR INSERT WITH CHECK (is_admin())';
    EXECUTE 'CREATE POLICY "Admins can update plan templates" ON plan_templates FOR UPDATE USING (is_admin())';
    EXECUTE 'CREATE POLICY "Admins can delete plan templates" ON plan_templates FOR DELETE USING (is_admin())';
  END IF;
END $$;

-- =====================================================
-- Sessions Table - Admin can manage all sessions (if exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sessions') THEN
    EXECUTE 'CREATE POLICY "Admins can view all sessions" ON sessions FOR SELECT USING (is_admin())';
    EXECUTE 'CREATE POLICY "Admins can delete any session" ON sessions FOR DELETE USING (is_admin())';
  END IF;
END $$;

-- =====================================================
-- NOTES:
-- 1. Only creates policies for core tables that exist
-- 2. Optional tables checked with IF EXISTS
-- 3. Admins get full CRUD on content tables, READ on data tables
-- =====================================================
