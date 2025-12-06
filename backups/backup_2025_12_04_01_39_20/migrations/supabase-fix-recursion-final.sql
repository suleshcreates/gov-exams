-- FINAL Fix for Infinite Recursion in RLS Policies
-- Corrected to use actual column names from schema

-- ============================================
-- STEP 1: CREATE HELPER FUNCTION FOR ADMIN CHECK
-- ============================================

-- Create a function to check if user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE auth_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- STEP 2: STUDENTS TABLE - FIX INFINITE RECURSION
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
DROP POLICY IF EXISTS "students_select_own" ON students;
DROP POLICY IF EXISTS "students_update_own" ON students;
DROP POLICY IF EXISTS "students_insert_own" ON students;
DROP POLICY IF EXISTS "students_admin_all" ON students;
DROP POLICY IF EXISTS "students_select" ON students;
DROP POLICY IF EXISTS "students_update" ON students;
DROP POLICY IF EXISTS "students_insert" ON students;
DROP POLICY IF EXISTS "students_delete" ON students;

-- Create simple, non-recursive policies for students table
-- Policy 1: Users can read their own profile OR admins can read all
CREATE POLICY "students_select"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid() OR is_admin());

-- Policy 2: Users can update their own profile OR admins can update all
CREATE POLICY "students_update"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid() OR is_admin())
  WITH CHECK (auth_user_id = auth.uid() OR is_admin());

-- Policy 3: Users can insert their own profile OR admins can insert
CREATE POLICY "students_insert"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid() OR is_admin());

-- Policy 4: Only admins can delete
CREATE POLICY "students_delete"
  ON students
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- STEP 3: USER PLANS TABLE - FIX RECURSION
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for users to own plans" ON user_plans;
DROP POLICY IF EXISTS "Enable all access for admins on user_plans" ON user_plans;
DROP POLICY IF EXISTS "Users can view own plans" ON user_plans;
DROP POLICY IF EXISTS "Admins can view all plans" ON user_plans;
DROP POLICY IF EXISTS "Admins can manage all plans" ON user_plans;
DROP POLICY IF EXISTS "user_plans_select_own" ON user_plans;
DROP POLICY IF EXISTS "user_plans_insert_own" ON user_plans;
DROP POLICY IF EXISTS "user_plans_admin_all" ON user_plans;
DROP POLICY IF EXISTS "user_plans_admin" ON user_plans;
DROP POLICY IF EXISTS "user_plans_select" ON user_plans;
DROP POLICY IF EXISTS "user_plans_insert" ON user_plans;

-- Note: user_plans uses student_phone, not student_id
-- Admins can do everything on user_plans
CREATE POLICY "user_plans_admin"
  ON user_plans
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Users can view their own plans (matching by phone)
CREATE POLICY "user_plans_select"
  ON user_plans
  FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    student_phone IN (SELECT phone FROM students WHERE auth_user_id = auth.uid())
  );

-- Users can insert their own plans
CREATE POLICY "user_plans_insert"
  ON user_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin() OR
    student_phone IN (SELECT phone FROM students WHERE auth_user_id = auth.uid())
  );

-- ============================================
-- STEP 4: EXAM RESULTS TABLE - FIX RECURSION
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for users to own results" ON exam_results;
DROP POLICY IF EXISTS "Enable all access for admins on exam_results" ON exam_results;
DROP POLICY IF EXISTS "Users can view own results" ON exam_results;
DROP POLICY IF EXISTS "Admins can view all results" ON exam_results;
DROP POLICY IF EXISTS "exam_results_select_own" ON exam_results;
DROP POLICY IF EXISTS "exam_results_insert_own" ON exam_results;
DROP POLICY IF EXISTS "exam_results_admin_all" ON exam_results;
DROP POLICY IF EXISTS "exam_results_admin" ON exam_results;
DROP POLICY IF EXISTS "exam_results_select" ON exam_results;
DROP POLICY IF EXISTS "exam_results_insert" ON exam_results;

-- Note: exam_results uses student_phone
-- Admins can do everything on exam_results
CREATE POLICY "exam_results_admin"
  ON exam_results
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Users can view their own results (matching by phone or email)
CREATE POLICY "exam_results_select"
  ON exam_results
  FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    student_phone IN (SELECT phone FROM students WHERE auth_user_id = auth.uid()) OR
    student_phone IN (SELECT email FROM students WHERE auth_user_id = auth.uid())
  );

-- Users can insert their own results
CREATE POLICY "exam_results_insert"
  ON exam_results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin() OR
    student_phone IN (SELECT phone FROM students WHERE auth_user_id = auth.uid()) OR
    student_phone IN (SELECT email FROM students WHERE auth_user_id = auth.uid())
  );

-- ============================================
-- STEP 5: ENSURE RLS IS ENABLED
-- ============================================

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: GRANT NECESSARY PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON students TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON exam_results TO authenticated;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify all policies are in place
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('students', 'user_plans', 'exam_results')
ORDER BY tablename, policyname;
