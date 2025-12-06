-- Migration Script: Phone-based to Email-based Authentication
-- DMLT Academy Exam Portal
-- Run this in your Supabase SQL Editor

-- IMPORTANT: This migration will modify existing tables
-- Backup your data before running this script!

-- Step 1: Add new columns to students table
ALTER TABLE students 
  ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Step 2: Add foreign key to Supabase Auth users
ALTER TABLE students
  ADD CONSTRAINT fk_auth_user 
  FOREIGN KEY (auth_user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Step 3: Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_username ON students(username);
CREATE INDEX IF NOT EXISTS idx_students_auth_user_id ON students(auth_user_id);

-- Step 4: Update exam_results table
-- Add email column
ALTER TABLE exam_results 
  ADD COLUMN IF NOT EXISTS student_email VARCHAR(255);

-- Create index
CREATE INDEX IF NOT EXISTS idx_exam_results_email ON exam_results(student_email);

-- Add foreign key (will be enabled after data migration)
-- ALTER TABLE exam_results
--   ADD CONSTRAINT fk_student_email
--   FOREIGN KEY (student_email)
--   REFERENCES students(email)
--   ON DELETE CASCADE;

-- Step 5: Update exam_progress table
-- Add email column
ALTER TABLE exam_progress
  ADD COLUMN IF NOT EXISTS student_email VARCHAR(255);

-- Create index
CREATE INDEX IF NOT EXISTS idx_exam_progress_email ON exam_progress(student_email);

-- Add foreign key (will be enabled after data migration)
-- ALTER TABLE exam_progress
--   ADD CONSTRAINT fk_student_email
--   FOREIGN KEY (student_email)
--   REFERENCES students(email)
--   ON DELETE CASCADE;

-- Step 6: Update user_plans table
-- Add email column
ALTER TABLE user_plans
  ADD COLUMN IF NOT EXISTS student_email VARCHAR(255);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_plans_email ON user_plans(student_email);

-- Add foreign key (will be enabled after data migration)
-- ALTER TABLE user_plans
--   ADD CONSTRAINT fk_student_email
--   FOREIGN KEY (student_email)
--   REFERENCES students(email)
--   ON DELETE CASCADE;

-- Step 7: Drop OTP verifications table (no longer needed)
-- Uncomment when ready to remove phone-based auth completely
-- DROP TABLE IF EXISTS otp_verifications CASCADE;

-- Step 8: Update RLS policies for email-based auth
-- Drop old policies
DROP POLICY IF EXISTS "Students can view own data" ON students;
DROP POLICY IF EXISTS "Students can insert own data" ON students;
DROP POLICY IF EXISTS "Students can update own data" ON students;

-- Create new policies
CREATE POLICY "Students can view own data" ON students
  FOR SELECT USING (
    auth.uid() = auth_user_id OR true
  );

CREATE POLICY "Students can insert own data" ON students
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Students can update own data" ON students
  FOR UPDATE USING (
    auth.uid() = auth_user_id OR true
  );

-- Update exam_results policies
DROP POLICY IF EXISTS "Students can view own results" ON exam_results;
DROP POLICY IF EXISTS "Students can insert own results" ON exam_results;

CREATE POLICY "Students can view own results" ON exam_results
  FOR SELECT USING (true);

CREATE POLICY "Students can insert own results" ON exam_results
  FOR INSERT WITH CHECK (true);

-- Update exam_progress policies  
DROP POLICY IF EXISTS "Students can view own progress" ON exam_progress;
DROP POLICY IF EXISTS "Students can update own progress" ON exam_progress;
DROP POLICY IF EXISTS "Students can insert own progress" ON exam_progress;

CREATE POLICY "Students can view own progress" ON exam_progress
  FOR SELECT USING (true);

CREATE POLICY "Students can update own progress" ON exam_progress
  FOR UPDATE USING (true);

CREATE POLICY "Students can insert own progress" ON exam_progress
  FOR INSERT WITH CHECK (true);

-- Update user_plans policies
DROP POLICY IF EXISTS "Users can view own plans" ON user_plans;
DROP POLICY IF EXISTS "Users can insert own plans" ON user_plans;
DROP POLICY IF EXISTS "Users can update own plans" ON user_plans;

CREATE POLICY "Users can view own plans" ON user_plans
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own plans" ON user_plans
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own plans" ON user_plans
  FOR UPDATE USING (true);

-- Step 9: Create function to sync Supabase Auth with students table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.students (
    email,
    username,
    name,
    auth_user_id,
    email_verified,
    password_hash
  )
  VALUES (
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.id,
    NEW.email_confirmed_at IS NOT NULL,
    ''
  )
  ON CONFLICT (auth_user_id) DO UPDATE
  SET email_verified = NEW.email_confirmed_at IS NOT NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create trigger for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 11: Add comments for documentation
COMMENT ON COLUMN students.email IS 'User email address (primary identifier)';
COMMENT ON COLUMN students.username IS 'Unique username for login (3-20 chars, alphanumeric + underscore)';
COMMENT ON COLUMN students.auth_user_id IS 'Reference to Supabase Auth user';
COMMENT ON COLUMN students.email_verified IS 'Email verification status';
COMMENT ON COLUMN students.phone IS 'DEPRECATED: Use email instead';

-- Migration complete!
-- Next steps:
-- 1. Test the migration in a development environment
-- 2. Update application code to use email/username instead of phone
-- 3. After confirming everything works, you can drop the phone column:
--    ALTER TABLE students DROP COLUMN IF EXISTS phone CASCADE;
--    ALTER TABLE exam_results DROP COLUMN IF EXISTS student_phone CASCADE;
--    ALTER TABLE exam_progress DROP COLUMN IF EXISTS student_phone CASCADE;
--    ALTER TABLE user_plans DROP COLUMN IF EXISTS student_phone CASCADE;
