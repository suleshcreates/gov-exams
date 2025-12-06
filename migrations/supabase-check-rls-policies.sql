-- Check current RLS policies on students table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'students';

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'students';

-- Disable RLS temporarily for testing (or add proper policies)
-- Option 1: Disable RLS (NOT RECOMMENDED FOR PRODUCTION)
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- Option 2: Add permissive SELECT policy for authenticated users
-- DROP POLICY IF EXISTS "Allow authenticated users to read students" ON students;
-- CREATE POLICY "Allow authenticated users to read students"
--   ON students
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- Option 3: Add policy for anon users (for login lookup)
-- DROP POLICY IF EXISTS "Allow anon to read for login" ON students;
-- CREATE POLICY "Allow anon to read for login"
--   ON students
--   FOR SELECT
--   TO anon
--   USING (true);
