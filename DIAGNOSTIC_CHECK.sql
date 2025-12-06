-- DIAGNOSTIC: Check Current RLS State and Data
-- Run this to see what's going on with your students table

-- ============================================
-- 1. Check RLS Status
-- ============================================
SELECT 
  schemaname,
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS ENABLED' ELSE '❌ RLS DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'students';

-- ============================================
-- 2. Check Current Policies
-- ============================================
SELECT 
  policyname,
  cmd,
  roles::text,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'students'
ORDER BY policyname;

-- ============================================
-- 3. Check Grants
-- ============================================
SELECT 
  grantee,
  string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'students'
  AND grantee IN ('anon', 'authenticated', 'service_role')
GROUP BY grantee;

-- ============================================
-- 4. Check Existing Students (Sample)
-- ============================================
SELECT 
  email,
  username,
  name,
  is_verified,
  email_verified,
  created_at
FROM students
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- 5. Count Total Students
-- ============================================
SELECT COUNT(*) as total_students FROM students;

-- If you want to see ALL data (for debugging):
-- SELECT * FROM students ORDER BY created_at DESC;
