-- URGENT FIX: Allow users to sign in
-- This script fixes RLS policies that are blocking authentication

-- 1. Fix students table policies
DROP POLICY IF EXISTS "Enable read access for users to own profile" ON students;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON students;
DROP POLICY IF EXISTS "Enable update for users to own profile" ON students;
DROP POLICY IF EXISTS "Users can view own profile" ON students;
DROP POLICY IF EXISTS "Users can insert own profile" ON students;
DROP POLICY IF EXISTS "Users can update own profile" ON students;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- Allow users to insert their own profile (for OAuth)
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

-- Ensure RLS is enabled
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON students TO authenticated;

-- 2. Fix plan_templates policies (for later)
DROP POLICY IF EXISTS "Enable read access for all users" ON plan_templates;
DROP POLICY IF EXISTS "Enable insert for admins" ON plan_templates;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON plan_templates;

-- Everyone can read active plans
CREATE POLICY "Anyone can read plan templates"
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
GRANT SELECT ON plan_templates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON plan_templates TO authenticated;

-- Verify policies
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('students', 'plan_templates')
ORDER BY tablename, policyname;
