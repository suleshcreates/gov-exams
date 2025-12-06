-- Test if tables exist and are accessible
SELECT 'students table' as test, COUNT(*) as count FROM students;
SELECT 'admins table' as test, COUNT(*) as count FROM admins;
SELECT 'subjects table' as test, COUNT(*) as count FROM subjects;

-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('students', 'admins', 'subjects');

-- Check if there are any RLS policies blocking queries
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('students', 'admins', 'subjects');

-- Disable RLS on all tables for testing
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_sets DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('students', 'admins', 'subjects', 'question_sets', 'questions');
