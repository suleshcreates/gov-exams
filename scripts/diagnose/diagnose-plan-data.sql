-- Diagnose Plan Access Data
-- Run this in Supabase SQL Editor to see what's in the database

-- 1. Check plan templates and their subjects
SELECT 
  id,
  name,
  subjects,
  subjects::text as subjects_raw,
  is_active,
  display_order
FROM plan_templates
WHERE is_active = true
ORDER BY display_order;

-- 2. Check user plans for a specific phone
-- Replace '8055115752' with your actual phone number
SELECT 
  id,
  student_phone,
  student_name,
  plan_id,
  plan_template_id,
  plan_name,
  exam_ids,
  exam_ids::text as exam_ids_raw,
  is_active,
  expires_at,
  purchased_at
FROM user_plans
WHERE student_phone = '8055115752'
ORDER BY purchased_at DESC;

-- 3. Check if exam_ids is an array or string
SELECT 
  plan_name,
  exam_ids,
  pg_typeof(exam_ids) as exam_ids_type,
  array_length(exam_ids, 1) as exam_count,
  CASE 
    WHEN exam_ids @> ARRAY['exam-1']::text[] THEN 'Has exam-1'
    ELSE 'No exam-1'
  END as exam_1_check
FROM user_plans
WHERE student_phone = '8055115752'
  AND is_active = true;

-- 4. List all students with their phones
SELECT 
  auth_user_id,
  email,
  username,
  name,
  phone,
  email_verified,
  is_verified
FROM students
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check RLS policies on user_plans
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'user_plans';
