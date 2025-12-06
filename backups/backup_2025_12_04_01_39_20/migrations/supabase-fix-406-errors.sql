-- Fix 406 Errors - Comprehensive RLS Policy Fix
-- This script fixes all RLS policies causing 406 (Not Acceptable) errors

-- ============================================
-- 1. STUDENTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can read own profile" ON students;
DROP POLICY IF EXISTS "Users can insert own profile" ON students;
DROP POLICY IF EXISTS "Users can update own profile" ON students;
DROP POLICY IF EXISTS "Admins have full access to students" ON students;
DROP POLICY IF EXISTS "Allow public read for phone lookup" ON students;

-- Allow users to read their own profile by auth_user_id
CREATE POLICY "Users can read own profile by auth_user_id"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- Allow users to read their own profile by phone (for legacy phone auth)
CREATE POLICY "Users can read own profile by phone"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    phone IS NOT NULL AND 
    phone IN (
      SELECT phone FROM students WHERE auth_user_id = auth.uid()
    )
  );

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Allow admins full access
CREATE POLICY "Admins have full access to students"
  ON students
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON students TO authenticated;

-- ============================================
-- 2. EXAM_PROGRESS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own progress" ON exam_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON exam_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON exam_progress;
DROP POLICY IF EXISTS "Admins have full access to exam_progress" ON exam_progress;

-- Allow users to read their own exam progress
CREATE POLICY "Users can read own exam progress"
  ON exam_progress
  FOR SELECT
  TO authenticated
  USING (
    student_phone IN (
      SELECT phone FROM students WHERE auth_user_id = auth.uid()
    )
  );

-- Allow users to insert their own exam progress
CREATE POLICY "Users can insert own exam progress"
  ON exam_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_phone IN (
      SELECT phone FROM students WHERE auth_user_id = auth.uid()
    )
  );

-- Allow users to update their own exam progress
CREATE POLICY "Users can update own exam progress"
  ON exam_progress
  FOR UPDATE
  TO authenticated
  USING (
    student_phone IN (
      SELECT phone FROM students WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    student_phone IN (
      SELECT phone FROM students WHERE auth_user_id = auth.uid()
    )
  );

-- Allow admins full access
CREATE POLICY "Admins have full access to exam_progress"
  ON exam_progress
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

ALTER TABLE exam_progress ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON exam_progress TO authenticated;

-- ============================================
-- 3. EXAM_RESULTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own results" ON exam_results;
DROP POLICY IF EXISTS "Users can insert own results" ON exam_results;
DROP POLICY IF EXISTS "Admins have full access to exam_results" ON exam_results;

-- Allow users to read their own exam results
CREATE POLICY "Users can read own exam results"
  ON exam_results
  FOR SELECT
  TO authenticated
  USING (
    student_phone IN (
      SELECT phone FROM students WHERE auth_user_id = auth.uid()
    )
  );

-- Allow users to insert their own exam results
CREATE POLICY "Users can insert own exam results"
  ON exam_results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_phone IN (
      SELECT phone FROM students WHERE auth_user_id = auth.uid()
    )
  );

-- Allow admins full access
CREATE POLICY "Admins have full access to exam_results"
  ON exam_results
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON exam_results TO authenticated;

-- ============================================
-- 4. USER_PLANS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own plans" ON user_plans;
DROP POLICY IF EXISTS "Users can insert own plans" ON user_plans;
DROP POLICY IF EXISTS "Admins have full access to user_plans" ON user_plans;

-- Allow users to read their own plans
CREATE POLICY "Users can read own user plans"
  ON user_plans
  FOR SELECT
  TO authenticated
  USING (
    student_phone IN (
      SELECT phone FROM students WHERE auth_user_id = auth.uid()
    )
  );

-- Allow users to insert their own plans
CREATE POLICY "Users can insert own user plans"
  ON user_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_phone IN (
      SELECT phone FROM students WHERE auth_user_id = auth.uid()
    )
  );

-- Allow users to update their own plans
CREATE POLICY "Users can update own user plans"
  ON user_plans
  FOR UPDATE
  TO authenticated
  USING (
    student_phone IN (
      SELECT phone FROM students WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    student_phone IN (
      SELECT phone FROM students WHERE auth_user_id = auth.uid()
    )
  );

-- Allow admins full access
CREATE POLICY "Admins have full access to user_plans"
  ON user_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON user_plans TO authenticated;

-- ============================================
-- 5. PLAN_TEMPLATES TABLE (Public Read)
-- ============================================
DROP POLICY IF EXISTS "Anyone can read plan templates" ON plan_templates;
DROP POLICY IF EXISTS "Admins can insert plan templates" ON plan_templates;
DROP POLICY IF EXISTS "Admins can update plan templates" ON plan_templates;
DROP POLICY IF EXISTS "Admins can delete plan templates" ON plan_templates;

-- Everyone can read plan templates (including anonymous users)
CREATE POLICY "Public can read plan templates"
  ON plan_templates
  FOR SELECT
  USING (true);

-- Admins can insert
CREATE POLICY "Admins can insert plan templates"
  ON plan_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Admins can update
CREATE POLICY "Admins can update plan templates"
  ON plan_templates
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Admins can delete
CREATE POLICY "Admins can delete plan templates"
  ON plan_templates
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

ALTER TABLE plan_templates ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON plan_templates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON plan_templates TO authenticated;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('students', 'exam_progress', 'exam_results', 'user_plans', 'plan_templates')
ORDER BY tablename, policyname;

-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('students', 'exam_progress', 'exam_results', 'user_plans', 'plan_templates');

-- Check grants
SELECT 
  table_name,
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name IN ('students', 'exam_progress', 'exam_results', 'user_plans', 'plan_templates')
ORDER BY table_name, grantee, privilege_type;
