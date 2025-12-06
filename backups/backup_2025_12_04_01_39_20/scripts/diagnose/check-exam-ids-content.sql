-- Check what's actually in exam_ids for this user
-- Run this in Supabase SQL Editor

-- First, check the data type
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'user_plans' 
  AND column_name IN ('exam_ids', 'plan_id', 'plan_template_id');

-- Now check the actual data
SELECT 
  student_phone,
  plan_name,
  exam_ids,
  pg_typeof(exam_ids) as exam_ids_pg_type,
  exam_ids::text as exam_ids_as_text
FROM user_plans
WHERE student_phone = '0987654321'
  AND is_active = true;

-- Check plan template
SELECT 
  pt.id,
  pt.name as template_name,
  pt.subjects,
  pg_typeof(pt.subjects) as subjects_pg_type,
  pt.subjects::text as subjects_as_text
FROM plan_templates pt
WHERE pt.id IN (
  SELECT plan_template_id 
  FROM user_plans 
  WHERE student_phone = '0987654321'
);
