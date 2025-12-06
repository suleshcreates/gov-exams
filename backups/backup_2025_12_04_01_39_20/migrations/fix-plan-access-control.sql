-- Fix Plan Access Control Issue
-- This script fixes the exam_ids in student_plans to use correct exam IDs

-- Step 1: Check current state
SELECT 
  id,
  student_phone,
  plan_name,
  exam_ids,
  jsonb_typeof(exam_ids) as exam_ids_type,
  CASE 
    WHEN jsonb_typeof(exam_ids) = 'array' THEN jsonb_array_length(exam_ids)
    ELSE NULL
  END as num_exams
FROM user_plans
WHERE is_active = true
ORDER BY created_at DESC;

-- Step 2: Create a mapping function to convert subject UUIDs to exam IDs
CREATE OR REPLACE FUNCTION map_subjects_to_exam_ids(subject_uuids jsonb)
RETURNS jsonb AS $$
DECLARE
  result jsonb := '[]'::jsonb;
  subject_record RECORD;
BEGIN
  -- Loop through each subject UUID
  FOR subject_record IN 
    SELECT 
      s.id,
      s.name,
      CASE 
        WHEN s.name = 'Mathematics' THEN 'exam-1'
        WHEN s.name = 'Physics' THEN 'exam-2'
        WHEN s.name = 'Chemistry' THEN 'exam-3'
        WHEN s.name = 'Biology' THEN 'exam-4'
        WHEN s.name = 'General Knowledge' THEN 'exam-5'
        -- Add DMLT-specific mappings if needed
        WHEN s.name ILIKE '%anatomy%' THEN 'exam-1'
        WHEN s.name ILIKE '%physiology%' THEN 'exam-2'
        WHEN s.name ILIKE '%biochemistry%' THEN 'exam-3'
        WHEN s.name ILIKE '%microbiology%' THEN 'exam-4'
        WHEN s.name ILIKE '%pathology%' THEN 'exam-5'
        ELSE NULL
      END as exam_id
    FROM subjects s
    WHERE s.id::text = ANY(SELECT jsonb_array_elements_text(subject_uuids))
  LOOP
    IF subject_record.exam_id IS NOT NULL THEN
      result := result || jsonb_build_array(subject_record.exam_id);
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Update all user_plans to use correct exam IDs
-- This will convert any UUID-based exam_ids to the correct exam-1, exam-2, etc. format
UPDATE user_plans
SET exam_ids = map_subjects_to_exam_ids(exam_ids)
WHERE jsonb_typeof(exam_ids) = 'array'
  AND jsonb_array_length(exam_ids) > 0
  AND NOT (exam_ids->0)::text LIKE '%exam-%';

-- Step 4: Verify the fix
SELECT 
  id,
  student_phone,
  plan_name,
  exam_ids,
  jsonb_typeof(exam_ids) as exam_ids_type,
  CASE 
    WHEN jsonb_typeof(exam_ids) = 'array' THEN jsonb_array_length(exam_ids)
    ELSE NULL
  END as num_exams,
  'Fixed' as status
FROM user_plans
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;

-- Step 5: Show subject to exam ID mapping
SELECT 
  id,
  name,
  CASE 
    WHEN name = 'Mathematics' THEN 'exam-1'
    WHEN name = 'Physics' THEN 'exam-2'
    WHEN name = 'Chemistry' THEN 'exam-3'
    WHEN name = 'Biology' THEN 'exam-4'
    WHEN name = 'General Knowledge' THEN 'exam-5'
    WHEN name ILIKE '%anatomy%' THEN 'exam-1'
    WHEN name ILIKE '%physiology%' THEN 'exam-2'
    WHEN name ILIKE '%biochemistry%' THEN 'exam-3'
    WHEN name ILIKE '%microbiology%' THEN 'exam-4'
    WHEN name ILIKE '%pathology%' THEN 'exam-5'
    ELSE 'unmapped'
  END as exam_id
FROM subjects
ORDER BY name;
