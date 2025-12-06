-- Fix RLS Policies for Google OAuth Profile Updates
-- This script ensures users can update their own profiles after OAuth sign-in

-- First, let's check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'students';

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can update own profile" ON students;
DROP POLICY IF EXISTS "Users can insert own profile" ON students;
DROP POLICY IF EXISTS "Users can view own profile" ON students;

-- Create new, correct policies

-- 1. Allow users to view their own profile
CREATE POLICY "Enable read access for users to own profile"
  ON students
  FOR SELECT
  USING (auth.uid() = auth_user_id);

-- 2. Allow users to insert their own profile (for OAuth callback)
CREATE POLICY "Enable insert for authenticated users"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

-- 3. Allow users to update their own profile
CREATE POLICY "Enable update for users to own profile"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- 4. Admin policies (if admins table exists)
CREATE POLICY "Enable all access for admins"
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

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON students TO authenticated;
GRANT SELECT, INSERT, UPDATE ON students TO anon;

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'students'
ORDER BY policyname;
