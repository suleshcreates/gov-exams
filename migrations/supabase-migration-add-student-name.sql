-- Migration: Add Student Name to Tables for Easy Identification
-- Run this in your Supabase SQL Editor
-- This adds student_name column to exam_results, exam_progress, and user_plans tables

-- Add student_name to exam_results table
ALTER TABLE exam_results 
ADD COLUMN IF NOT EXISTS student_name VARCHAR(255);

-- Add student_name to exam_progress table
ALTER TABLE exam_progress 
ADD COLUMN IF NOT EXISTS student_name VARCHAR(255);

-- Add student_name to user_plans table (if it exists)
ALTER TABLE user_plans 
ADD COLUMN IF NOT EXISTS student_name VARCHAR(255);

-- Update existing records to populate student_name from students table
-- This will backfill the name for existing records
UPDATE exam_results er
SET student_name = s.name
FROM students s
WHERE er.student_phone = s.phone
AND er.student_name IS NULL;

UPDATE exam_progress ep
SET student_name = s.name
FROM students s
WHERE ep.student_phone = s.phone
AND ep.student_name IS NULL;

UPDATE user_plans up
SET student_name = s.name
FROM students s
WHERE up.student_phone = s.phone
AND up.student_name IS NULL;

-- Create indexes for better query performance when searching by name
CREATE INDEX IF NOT EXISTS idx_exam_results_student_name ON exam_results(student_name);
CREATE INDEX IF NOT EXISTS idx_exam_progress_student_name ON exam_progress(student_name);
CREATE INDEX IF NOT EXISTS idx_user_plans_student_name ON user_plans(student_name);

-- Add comments to explain the columns
COMMENT ON COLUMN exam_results.student_name IS 'Student name for easy identification in queries';
COMMENT ON COLUMN exam_progress.student_name IS 'Student name for easy identification in queries';
COMMENT ON COLUMN user_plans.student_name IS 'Student name for easy identification in queries';

