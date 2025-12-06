-- TEMPORARY: Disable RLS for testing only
-- WARNING: This removes all security - only use for debugging!
-- DO NOT USE IN PRODUCTION

-- Disable RLS on problem tables
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('students', 'user_plans', 'exam_results');
