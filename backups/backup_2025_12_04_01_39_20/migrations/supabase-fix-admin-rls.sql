-- Fix RLS Policies for Admin Operations
-- This script ensures admins can perform all operations on plan-related tables

-- ============================================
-- PLAN TEMPLATES TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for everyone" ON plan_templates;
DROP POLICY IF EXISTS "Enable all access for admins" ON plan_templates;
DROP POLICY IF EXISTS "Admins can manage plan templates" ON plan_templates;

-- Create new policies for plan_templates
CREATE POLICY "Enable read access for everyone on plan_templates"
  ON plan_templates
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable all access for admins on plan_templates"
  ON plan_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE plan_templates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SUBJECT PRICING TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for everyone" ON subject_pricing;
DROP POLICY IF EXISTS "Enable all access for admins" ON subject_pricing;
DROP POLICY IF EXISTS "Admins can manage subject pricing" ON subject_pricing;

-- Create new policies for subject_pricing
CREATE POLICY "Enable read access for everyone on subject_pricing"
  ON subject_pricing
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable all access for admins on subject_pricing"
  ON subject_pricing
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE subject_pricing ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PLAN DISCOUNTS TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for everyone" ON plan_discounts;
DROP POLICY IF EXISTS "Enable all access for admins" ON plan_discounts;
DROP POLICY IF EXISTS "Admins can manage discounts" ON plan_discounts;

-- Create new policies for plan_discounts
CREATE POLICY "Enable read access for everyone on plan_discounts"
  ON plan_discounts
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Enable all access for admins on plan_discounts"
  ON plan_discounts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE plan_discounts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USER PLANS TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own plans" ON user_plans;
DROP POLICY IF EXISTS "Admins can view all plans" ON user_plans;
DROP POLICY IF EXISTS "Admins can manage all plans" ON user_plans;

-- Create new policies for user_plans
CREATE POLICY "Enable read access for users to own plans"
  ON user_plans
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM students WHERE id = user_plans.student_id
    )
  );

CREATE POLICY "Enable all access for admins on user_plans"
  ON user_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STUDENTS TABLE (Admin Access)
-- ============================================

-- Ensure admins can manage students
DROP POLICY IF EXISTS "Admins can view all students" ON students;
DROP POLICY IF EXISTS "Admins can update all students" ON students;
DROP POLICY IF EXISTS "Admins can manage all students" ON students;

CREATE POLICY "Enable all access for admins on students"
  ON students
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- ============================================
-- SUBJECTS TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for everyone" ON subjects;
DROP POLICY IF EXISTS "Enable all access for admins" ON subjects;
DROP POLICY IF EXISTS "Admins can manage subjects" ON subjects;

-- Create new policies for subjects
CREATE POLICY "Enable read access for everyone on subjects"
  ON subjects
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable all access for admins on subjects"
  ON subjects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- QUESTION SETS TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for everyone" ON question_sets;
DROP POLICY IF EXISTS "Enable all access for admins" ON question_sets;

-- Create new policies for question_sets
CREATE POLICY "Enable read access for everyone on question_sets"
  ON question_sets
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable all access for admins on question_sets"
  ON question_sets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;

-- ============================================
-- QUESTIONS TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for everyone" ON questions;
DROP POLICY IF EXISTS "Enable all access for admins" ON questions;

-- Create new policies for questions
CREATE POLICY "Enable read access for everyone on questions"
  ON questions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable all access for admins on questions"
  ON questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- EXAM RESULTS TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own results" ON exam_results;
DROP POLICY IF EXISTS "Admins can view all results" ON exam_results;

-- Create new policies for exam_results
CREATE POLICY "Enable read access for users to own results"
  ON exam_results
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM students WHERE phone = exam_results.student_phone OR email = exam_results.student_phone
    )
  );

CREATE POLICY "Enable all access for admins on exam_results"
  ON exam_results
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON plan_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON subject_pricing TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON plan_discounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON students TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON subjects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON question_sets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON questions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON exam_results TO authenticated;

-- Grant read access to anonymous users for public tables
GRANT SELECT ON plan_templates TO anon;
GRANT SELECT ON subject_pricing TO anon;
GRANT SELECT ON subjects TO anon;
GRANT SELECT ON question_sets TO anon;
GRANT SELECT ON questions TO anon;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify all policies are in place
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN (
  'plan_templates',
  'subject_pricing',
  'plan_discounts',
  'user_plans',
  'students',
  'subjects',
  'question_sets',
  'questions',
  'exam_results'
)
ORDER BY tablename, policyname;
