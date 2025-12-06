-- Diagnose Auth Redirect Issue
-- This script checks the current RLS policies and student records

-- 1. Check current RLS policies on students table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'students'
ORDER BY policyname;

-- 2. Check if RLS is enabled on students table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'students';

-- 3. Check student records (replace with your auth_user_id)
-- Get your auth_user_id from: SELECT auth.uid();
SELECT 
  id,
  auth_user_id,
  email,
  username,
  phone,
  name,
  is_verified,
  created_at
FROM students
WHERE auth_user_id = '40733b06-40ad-48d4-b148-56ec4e7dd036';

-- 4. Check if there are any students records at all
SELECT COUNT(*) as total_students FROM students;

-- 5. Test if you can read your own record
-- Run this while logged in as the user
SELECT 
  id,
  email,
  username,
  phone
FROM students
WHERE auth_user_id = auth.uid();
