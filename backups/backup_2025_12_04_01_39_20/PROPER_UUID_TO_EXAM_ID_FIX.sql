-- PROPER FIX: Map Subject UUIDs to Exam IDs
-- Run each section separately, one at a time

-- ============================================
-- STEP 1: Check subjects and their mapping
-- ============================================
SELECT 
  id,
  name,
  CASE 
    WHEN name = 'Mathematics' THEN 'exam-1'
    WHEN name = 'Physics' THEN 'exam-2'
    WHEN name = 'Chemistry' THEN 'exam-3'
    WHEN name = 'Biology' THEN 'exam-4'
    WHEN name = 'General Knowledge' THEN 'exam-5'
    ELSE 'unknown'
  END as exam_id
FROM subjects
ORDER BY name;

-- ============================================
-- STEP 2: Create a temporary mapping table
-- ============================================
CREATE TEMP TABLE IF NOT EXISTS subject_to_exam_mapping AS
SELECT 
  id::text as subject_uuid,
  CASE 
    WHEN name = 'Mathematics' THEN 'exam-1'
    WHEN name = 'Physics' THEN 'exam-2'
    WHEN name = 'Chemistry' THEN 'exam-3'
    WHEN name = 'Biology' THEN 'exam-4'
    WHEN name = 'General Knowledge' THEN 'exam-5'
    ELSE name
  END as exam_id
FROM subjects;

-- ============================================
-- STEP 3: Fix user_plans one by one
-- ============================================
-- For each user plan, convert UUIDs to exam IDs

DO $$
DECLARE
  plan_record RECORD;
  uuid_elem text;
  exam_ids_array text[];
BEGIN
  FOR plan_record IN 
    SELECT id, exam_ids 
    FROM user_plans 
    WHERE is_active = true
  LOOP
    exam_ids_array := ARRAY[]::text[];
    
    FOR uuid_elem IN 
      SELECT jsonb_array_elements_text(plan_record.exam_ids)
    LOOP
      exam_ids_array := array_append(
        exam_ids_array,
        COALESCE(
          (SELECT exam_id FROM subject_to_exam_mapping WHERE subject_uuid = uuid_elem),
          uuid_elem
        )
      );
    END LOOP;
    
    UPDATE user_plans
    SET exam_ids = to_jsonb(exam_ids_array)
    WHERE id = plan_record.id;
  END LOOP;
END $$;

-- ============================================
-- STEP 4: Verify user_plans are fixed
-- ============================================
SELECT 
  student_phone,
  plan_name,
  exam_ids
FROM user_plans
WHERE is_active = true
ORDER BY student_phone;

-- ============================================
-- STEP 5: Fix plan_templates
-- ============================================
DO $$
DECLARE
  template_record RECORD;
  uuid_elem text;
  exam_ids_array text[];
BEGIN
  FOR template_record IN 
    SELECT id, subjects 
    FROM plan_templates 
    WHERE is_active = true
  LOOP
    exam_ids_array := ARRAY[]::text[];
    
    FOR uuid_elem IN 
      SELECT jsonb_array_elements_text(template_record.subjects)
    LOOP
      exam_ids_array := array_append(
        exam_ids_array,
        COALESCE(
          (SELECT exam_id FROM subject_to_exam_mapping WHERE subject_uuid = uuid_elem),
          uuid_elem
        )
      );
    END LOOP;
    
    UPDATE plan_templates
    SET subjects = to_jsonb(exam_ids_array)
    WHERE id = template_record.id;
  END LOOP;
END $$;

-- ============================================
-- STEP 6: Verify plan_templates are fixed
-- ============================================
SELECT 
  name,
  subjects
FROM plan_templates
WHERE is_active = true
ORDER BY display_order;

-- ============================================
-- STEP 7: Clean up
-- ============================================
DROP TABLE IF EXISTS subject_to_exam_mapping;
