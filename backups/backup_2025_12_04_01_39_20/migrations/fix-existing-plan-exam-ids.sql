-- Fix ALL User Plans - Update exam_ids from plan_template
-- This script updates ALL user_plans to have the correct exam_ids from their plan_template
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Check data types first
-- ============================================

-- Check what type exam_ids is
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'user_plans' 
  AND column_name = 'exam_ids';

-- ============================================
-- STEP 2: Diagnose the problem
-- ============================================

-- Check how many plans have empty or null exam_ids
SELECT 
  COUNT(*) as total_plans,
  COUNT(CASE 
    WHEN exam_ids IS NULL THEN 1
    WHEN jsonb_typeof(exam_ids) = 'array' AND jsonb_array_length(exam_ids) = 0 THEN 1
  END) as plans_with_empty_exam_ids,
  COUNT(CASE 
    WHEN exam_ids IS NOT NULL AND jsonb_typeof(exam_ids) = 'array' AND jsonb_array_length(exam_ids) > 0 THEN 1
  END) as plans_with_exam_ids
FROM user_plans
WHERE is_active = true;

-- Show all plans with their current state
SELECT 
  up.id,
  up.student_phone,
  up.student_name,
  up.plan_name,
  up.plan_template_id,
  up.exam_ids as current_exam_ids,
  CASE 
    WHEN up.exam_ids IS NULL THEN 0
    WHEN jsonb_typeof(up.exam_ids) = 'array' THEN jsonb_array_length(up.exam_ids)
    ELSE 0
  END as current_exam_count,
  pt.name as template_name,
  pt.subjects as template_subjects,
  up.is_active,
  up.purchased_at
FROM user_plans up
LEFT JOIN plan_templates pt ON up.plan_template_id = pt.id
WHERE up.is_active = true
ORDER BY up.purchased_at DESC;

-- ============================================
-- STEP 3: Fix ALL plans
-- ============================================

-- Update ALL user_plans to use the subjects from plan_templates
-- Since exam_ids is JSONB, we copy the JSONB subjects directly
UPDATE user_plans up
SET exam_ids = pt.subjects
FROM plan_templates pt
WHERE pt.id = up.plan_template_id
  AND up.is_active = true
  AND (
    up.exam_ids IS NULL 
    OR jsonb_typeof(up.exam_ids) != 'array'
    OR jsonb_array_length(up.exam_ids) = 0
  );

-- ============================================
-- STEP 4: Verify the fix worked
-- ============================================

-- Check how many plans were fixed
SELECT 
  COUNT(*) as total_active_plans,
  COUNT(CASE 
    WHEN exam_ids IS NULL OR jsonb_typeof(exam_ids) != 'array' OR jsonb_array_length(exam_ids) = 0 THEN 1
  END) as still_empty,
  COUNT(CASE 
    WHEN exam_ids IS NOT NULL AND jsonb_typeof(exam_ids) = 'array' AND jsonb_array_length(exam_ids) > 0 THEN 1
  END) as now_have_exam_ids
FROM user_plans
WHERE is_active = true;

-- Show all plans after fix
SELECT 
  up.student_phone,
  up.student_name,
  up.plan_name,
  up.exam_ids,
  CASE 
    WHEN up.exam_ids IS NULL THEN 0
    WHEN jsonb_typeof(up.exam_ids) = 'array' THEN jsonb_array_length(up.exam_ids)
    ELSE 0
  END as exam_count,
  up.purchased_at
FROM user_plans up
WHERE up.is_active = true
ORDER BY up.purchased_at DESC;

-- ============================================
-- STEP 5: Test access for each exam
-- ============================================

-- Show which exams each user has access to
SELECT 
  up.student_phone,
  up.student_name,
  up.plan_name,
  up.exam_ids ? 'exam-1' as has_mathematics,
  up.exam_ids ? 'exam-2' as has_physics,
  up.exam_ids ? 'exam-3' as has_chemistry,
  up.exam_ids ? 'exam-4' as has_biology,
  up.exam_ids ? 'exam-5' as has_general_knowledge
FROM user_plans up
WHERE up.is_active = true
ORDER BY up.student_phone;

-- ============================================
-- EMERGENCY FIX: If plan_template_id is NULL
-- ============================================

-- If some plans don't have plan_template_id, give them all exams
-- (Only run this if needed - check first!)
-- UPDATE user_plans
-- SET exam_ids = '["exam-1", "exam-2", "exam-3", "exam-4", "exam-5"]'::jsonb
-- WHERE is_active = true
--   AND plan_template_id IS NULL
--   AND (exam_ids IS NULL OR jsonb_typeof(exam_ids) != 'array' OR jsonb_array_length(exam_ids) = 0);

-- ============================================
-- SUMMARY REPORT
-- ============================================

SELECT 
  'Total Active Plans' as metric,
  COUNT(*)::text as value
FROM user_plans
WHERE is_active = true

UNION ALL

SELECT 
  'Plans with Exam Access' as metric,
  COUNT(*)::text as value
FROM user_plans
WHERE is_active = true
  AND exam_ids IS NOT NULL
  AND jsonb_typeof(exam_ids) = 'array'
  AND jsonb_array_length(exam_ids) > 0

UNION ALL

SELECT 
  'Plans Still Broken' as metric,
  COUNT(*)::text as value
FROM user_plans
WHERE is_active = true
  AND (exam_ids IS NULL OR jsonb_typeof(exam_ids) != 'array' OR jsonb_array_length(exam_ids) = 0)

UNION ALL

SELECT 
  'Unique Students Affected' as metric,
  COUNT(DISTINCT student_phone)::text as value
FROM user_plans
WHERE is_active = true;
