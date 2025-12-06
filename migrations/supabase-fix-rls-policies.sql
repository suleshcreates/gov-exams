-- Fix RLS Policies for Admin Panel
-- Run this if you're getting 500 errors even though tables exist

-- First, let's check if RLS is enabled and causing issues
-- You can temporarily disable RLS for testing (NOT recommended for production)

-- Option 1: Disable RLS temporarily for testing (ONLY FOR DEVELOPMENT)
-- Uncomment these lines to test if RLS is the issue:
-- ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE question_sets DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Option 2: Fix the RLS policies (RECOMMENDED)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view subjects" ON subjects;
DROP POLICY IF EXISTS "Admins can insert subjects" ON subjects;
DROP POLICY IF EXISTS "Admins can update subjects" ON subjects;
DROP POLICY IF EXISTS "Admins can delete subjects" ON subjects;

DROP POLICY IF EXISTS "Admins can view question_sets" ON question_sets;
DROP POLICY IF EXISTS "Admins can insert question_sets" ON question_sets;
DROP POLICY IF EXISTS "Admins can update question_sets" ON question_sets;
DROP POLICY IF EXISTS "Admins can delete question_sets" ON question_sets;

DROP POLICY IF EXISTS "Admins can view questions" ON questions;
DROP POLICY IF EXISTS "Admins can insert questions" ON questions;
DROP POLICY IF EXISTS "Admins can update questions" ON questions;
DROP POLICY IF EXISTS "Admins can delete questions" ON questions;

-- Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create new policies that check for admin role
-- Subjects policies
CREATE POLICY "Admins can view subjects" ON subjects
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.uid() IS NOT NULL AND 
     EXISTS (
       SELECT 1 FROM auth.users
       WHERE auth.users.id = auth.uid()
       AND (
         auth.users.raw_user_meta_data->>'role' = 'admin' OR
         auth.users.raw_app_meta_data->>'role' = 'admin'
       )
     ))
  );

CREATE POLICY "Admins can insert subjects" ON subjects
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.uid() IS NOT NULL AND 
     EXISTS (
       SELECT 1 FROM auth.users
       WHERE auth.users.id = auth.uid()
       AND (
         auth.users.raw_user_meta_data->>'role' = 'admin' OR
         auth.users.raw_app_meta_data->>'role' = 'admin'
       )
     ))
  );

CREATE POLICY "Admins can update subjects" ON subjects
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.uid() IS NOT NULL AND 
     EXISTS (
       SELECT 1 FROM auth.users
       WHERE auth.users.id = auth.uid()
       AND (
         auth.users.raw_user_meta_data->>'role' = 'admin' OR
         auth.users.raw_app_meta_data->>'role' = 'admin'
       )
     ))
  );

CREATE POLICY "Admins can delete subjects" ON subjects
  FOR DELETE
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.uid() IS NOT NULL AND 
     EXISTS (
       SELECT 1 FROM auth.users
       WHERE auth.users.id = auth.uid()
       AND (
         auth.users.raw_user_meta_data->>'role' = 'admin' OR
         auth.users.raw_app_meta_data->>'role' = 'admin'
       )
     ))
  );

-- Question Sets policies
CREATE POLICY "Admins can view question_sets" ON question_sets
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.uid() IS NOT NULL AND 
     EXISTS (
       SELECT 1 FROM auth.users
       WHERE auth.users.id = auth.uid()
       AND (
         auth.users.raw_user_meta_data->>'role' = 'admin' OR
         auth.users.raw_app_meta_data->>'role' = 'admin'
       )
     ))
  );

CREATE POLICY "Admins can insert question_sets" ON question_sets
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.uid() IS NOT NULL AND 
     EXISTS (
       SELECT 1 FROM auth.users
       WHERE auth.users.id = auth.uid()
       AND (
         auth.users.raw_user_meta_data->>'role' = 'admin' OR
         auth.users.raw_app_meta_data->>'role' = 'admin'
       )
     ))
  );

CREATE POLICY "Admins can update question_sets" ON question_sets
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.uid() IS NOT NULL AND 
     EXISTS (
       SELECT 1 FROM auth.users
       WHERE auth.users.id = auth.uid()
       AND (
         auth.users.raw_user_meta_data->>'role' = 'admin' OR
         auth.users.raw_app_meta_data->>'role' = 'admin'
       )
     ))
  );

CREATE POLICY "Admins can delete question_sets" ON question_sets
  FOR DELETE
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.uid() IS NOT NULL AND 
     EXISTS (
       SELECT 1 FROM auth.users
       WHERE auth.users.id = auth.uid()
       AND (
         auth.users.raw_user_meta_data->>'role' = 'admin' OR
         auth.users.raw_app_meta_data->>'role' = 'admin'
       )
     ))
  );

-- Questions policies
CREATE POLICY "Admins can view questions" ON questions
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.uid() IS NOT NULL AND 
     EXISTS (
       SELECT 1 FROM auth.users
       WHERE auth.users.id = auth.uid()
       AND (
         auth.users.raw_user_meta_data->>'role' = 'admin' OR
         auth.users.raw_app_meta_data->>'role' = 'admin'
       )
     ))
  );

CREATE POLICY "Admins can insert questions" ON questions
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.uid() IS NOT NULL AND 
     EXISTS (
       SELECT 1 FROM auth.users
       WHERE auth.users.id = auth.uid()
       AND (
         auth.users.raw_user_meta_data->>'role' = 'admin' OR
         auth.users.raw_app_meta_data->>'role' = 'admin'
       )
     ))
  );

CREATE POLICY "Admins can update questions" ON questions
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.uid() IS NOT NULL AND 
     EXISTS (
       SELECT 1 FROM auth.users
       WHERE auth.users.id = auth.uid()
       AND (
         auth.users.raw_user_meta_data->>'role' = 'admin' OR
         auth.users.raw_app_meta_data->>'role' = 'admin'
       )
     ))
  );

CREATE POLICY "Admins can delete questions" ON questions
  FOR DELETE
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.uid() IS NOT NULL AND 
     EXISTS (
       SELECT 1 FROM auth.users
       WHERE auth.users.id = auth.uid()
       AND (
         auth.users.raw_user_meta_data->>'role' = 'admin' OR
         auth.users.raw_app_meta_data->>'role' = 'admin'
       )
     ))
  );

-- Admins table policies
CREATE POLICY "Admins can view admins" ON admins
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.uid() IS NOT NULL AND 
     EXISTS (
       SELECT 1 FROM auth.users
       WHERE auth.users.id = auth.uid()
       AND (
         auth.users.raw_user_meta_data->>'role' = 'admin' OR
         auth.users.raw_app_meta_data->>'role' = 'admin'
       )
     ))
  );

-- Test query to check if your user has admin role
-- Run this to verify your admin setup:
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as user_meta_role,
  raw_app_meta_data->>'role' as app_meta_role
FROM auth.users
WHERE email = 'your-admin-email@example.com'; -- Replace with your email
