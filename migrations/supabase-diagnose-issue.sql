-- Diagnostic Script for Admin Panel Issues
-- Run this to identify what's causing the 500 error

-- 1. Check if tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('subjects', 'question_sets', 'questions', 'admins') 
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('subjects', 'question_sets', 'questions', 'admins')
ORDER BY table_name;

-- 2. Check RLS status
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN '🔒 RLS ENABLED'
    ELSE '🔓 RLS DISABLED'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('subjects', 'question_sets', 'questions', 'admins');

-- 3. Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN '✅ HAS USING'
    ELSE '❌ NO USING'
  END as has_using_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('subjects', 'question_sets', 'questions', 'admins')
ORDER BY tablename, policyname;

-- 4. Check your admin user
SELECT 
  id,
  email,
  raw_user_meta_data,
  raw_app_meta_data,
  CASE 
    WHEN raw_user_meta_data->>'role' = 'admin' THEN '✅ Admin in user_meta_data'
    WHEN raw_app_meta_data->>'role' = 'admin' THEN '✅ Admin in app_meta_data'
    ELSE '❌ NOT AN ADMIN'
  END as admin_status
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 5. Test if you can insert into subjects (this will fail if RLS is blocking)
-- Uncomment to test:
-- INSERT INTO subjects (name, description) 
-- VALUES ('Test Subject', 'This is a test') 
-- RETURNING *;

-- 6. Check current user context
SELECT 
  auth.uid() as current_user_id,
  auth.jwt() as current_jwt,
  auth.role() as current_role;
