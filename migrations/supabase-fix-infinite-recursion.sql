-- Fix Infinite Recursion in RLS Policies
-- The issue is that policies on students table are referencing students table in their checks
-- This creates infinite recursion. We need to use direct auth.uid() checks instead.

-- ============================================
-- STUDENTS TABLE - FIX INFINITE RECURSION
-- ============================================

-- Drop ALL existing policies on students table
DROP POLICY IF EXISTS "Enable all access for admins on students" ON students;
DROP POLICY IF EXISTS "Admins can view all students" ON students;
DROP POLICY IF EXISTS "Admins can update all students" ON students;
DROP POLICY IF EXISTS "Admins can manage all students" ON students;
DROP POLICY IF EXISTS "Users can view own profile" ON students;
DROP POLICY IF EXISTS "Users can update own profile" ON students;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON students;
DROP POLICY IF EXISTS "Enable read access for users to own profile" ON students;
DROP POLICY IF EXISTS "Enable update access for users to own profile" ON students;

-- Create simple, non-recursive policies for students table
-- Policy 1: Users can read their own profile
CREATE POLICY "students_select_own"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Policy 2: Users can update their own profile
CREATE POLICY "students_update_own"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Policy 3: Users can insert their own profile
CREATE POLICY "students_insert_own"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Policy 4: Admins can do everything (using direct admin check)
CREATE POLICY "students_admin_all"
  ON students
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (SELECT auth_user_id FROM admins)
  )
  WITH CHECK (
    auth.uid() IN (SELECT auth_user_id FROM admins)
  );

-- ============================================
-- USER PLANS TABLE - FIX RECURSION
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for users to own plans" ON user_plans;
DROP POLICY IF EXISTS "Enable all access for admins on user_plans" ON user_plans;
DROP POLICY IF EXISTS "Users can view own plans" ON user_plans;
DROP POLICY IF EXISTS "Admins can view all plans" ON user_plans;
DROP POLICY IF EXISTS "Admins can manage all plans" ON user_plans;

-- Create simple, non-recursive policies for user_plans
-- Policy 1: Users can read their own plans (using student_id directly)
CREATE POLICY "user_plans_select_own"
  ON user_plans
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE auth_user_id = auth.uid()
    )
  );

-- Policy 2: Users can insert their own plans
CREATE POLICY "user_plans_insert_own"
  ON user_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE auth_user_id = auth.uid()
    )
  );

-- Policy 3: Admins can do everything
CREATE POLICY "user_plans_admin_all"
  ON user_plans
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (SELECT auth_user_id FROM admins)
  )
  WITH CHECK (
    auth.uid() IN (SELECT auth_user_id FROM admins)
  );

-- ============================================
-- EXAM RESULTS TABLE - FIX RECURSION
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for users to own results" ON exam_results;
DROP POLICY IF EXISTS "Enable all access for admins on exam_results" ON exam_results;
DROP POLICY IF EXISTS "Users can view own results" ON exam_results;
DROP POLICY IF EXISTS "Admins can view all results" ON exam_results;

-- Create simple, non-recursive policies for exam_results
-- Note: exam_results uses student_phone/student_email, not student_id
-- Policy 1: Users can read their own results (matching by phone or email)
CREATE POLICY "exam_results_select_own"
  ON exam_results
  FOR SELECT
  TO authenticated
  USING (
    student_phone IN (SELECT phone FROM students WHERE auth_user_id = auth.uid())
    OR student_phone IN (SELECT email FROM students WHERE auth_user_id = auth.uid())
  );

-- Policy 2: Users can insert their own results
CREATE POLICY "exam_results_insert_own"
  ON exam_results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_phone IN (SELECT phone FROM students WHERE auth_user_id = auth.uid())
    OR student_phone IN (SELECT email FROM students WHERE auth_user_id = auth.uid())
  );

-- Policy 3: Admins can do everything
CREATE POLICY "exam_results_admin_all"
  ON exam_results
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (SELECT auth_user_id FROM admins)
  )
  WITH CHECK (
    auth.uid() IN (SELECT auth_user_id FROM admins)
  );

-- ============================================
-- ENSURE RLS IS ENABLED
-- ============================================

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify all policies are in place
SELECT 
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('students', 'user_plans', 'exam_results')
ORDER BY tablename, policyname;
