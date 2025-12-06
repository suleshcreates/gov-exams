-- Diagnose Plan Access Control Issue
-- This script checks what exam_ids are stored in student_plans

-- 1. Check all user plans and their exam_ids
SELECT 
  id,
  student_phone,
  student_name,
  plan_name,
  exam_ids,
  jsonb_typeof(exam_ids) as exam_ids_type,
  CASE 
    WHEN jsonb_typeof(exam_ids) = 'array' THEN jsonb_array_length(exam_ids)
    ELSE NULL
  END as exam_ids_count,
  is_active,
  expires_at,
  created_at
FROM user_plans
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check a specific user's plans (replace with actual phone number)
SELECT 
  id,
  plan_name,
  exam_ids,
  CASE 
    WHEN jsonb_typeof(exam_ids) = 'array' THEN jsonb_array_length(exam_ids)
    ELSE NULL
  END as num_exams,
  is_active,
  expires_at > NOW() as not_expired
FROM user_plans
WHERE student_phone = 'YOUR_PHONE_NUMBER_HERE'
ORDER BY created_at DESC;

-- 3. Check plan templates and their subjects
SELECT 
  id,
  name,
  subjects,
  jsonb_typeof(subjects) as subjects_type,
  CASE 
    WHEN jsonb_typeof(subjects) = 'array' THEN jsonb_array_length(subjects)
    ELSE NULL
  END as subjects_count,
  is_active
FROM plan_templates
WHERE is_active = true
ORDER BY display_order;

-- 4. Check if exam_ids contain actual exam IDs or UUIDs
SELECT 
  student_phone,
  plan_name,
  exam_ids,
  exam_ids->0 as first_exam_id,
  exam_ids->1 as second_exam_id,
  exam_ids->2 as third_exam_id,
  exam_ids->3 as fourth_exam_id
FROM user_plans
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 5;

-- 5. List all available exam IDs from mockData
-- These should match: anatomy, physiology, biochemistry, microbiology, pathology
-- Run this to see what's expected vs what's stored
