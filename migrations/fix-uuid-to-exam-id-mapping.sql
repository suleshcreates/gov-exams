-- Fix: Map Subject UUIDs to Exam IDs
-- Run each query separately, one at a time

-- ============================================
-- STEP 1: Check what subjects exist
-- ============================================
SELECT 
  id,
  name,
  description
FROM subjects
ORDER BY name;

-- ============================================
-- STEP 2: See current state
-- ============================================
SELECT 
  up.student_phone,
  up.plan_name,
  up.exam_ids,
  pt.subjects as template_subjects
FROM user_plans up
JOIN plan_templates pt ON up.plan_template_id = pt.id
WHERE up.is_active = true;

-- ============================================
-- STEP 3: SIMPLE FIX - Just give everyone all exams
-- ============================================
-- This is the quickest fix - give all active plans access to all 5 exams
UPDATE user_plans
SET exam_ids = '["exam-1", "exam-2", "exam-3", "exam-4", "exam-5"]'::jsonb
WHERE is_active = true;

-- ============================================
-- STEP 4: Verify it worked
-- ============================================
SELECT 
  student_phone,
  plan_name,
  exam_ids,
  exam_ids ? 'exam-1' as has_exam_1,
  exam_ids ? 'exam-2' as has_exam_2,
  exam_ids ? 'exam-3' as has_exam_3,
  exam_ids ? 'exam-4' as has_exam_4,
  exam_ids ? 'exam-5' as has_exam_5
FROM user_plans
WHERE is_active = true;
