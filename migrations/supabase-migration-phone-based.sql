-- Migration Script: Convert from Aadhaar-based to Phone-based Authentication
-- WARNING: This will delete all existing data. Run this only if you're starting fresh.
-- If you have existing data, you'll need to create a custom migration to preserve it.

-- Step 1: Drop existing foreign key constraints
ALTER TABLE exam_results DROP CONSTRAINT IF EXISTS exam_results_student_aadhaar_fkey;
ALTER TABLE exam_progress DROP CONSTRAINT IF EXISTS exam_progress_student_aadhaar_fkey;

-- Step 2: Drop existing tables (if you're starting fresh)
-- DROP TABLE IF EXISTS exam_results CASCADE;
-- DROP TABLE IF EXISTS exam_progress CASCADE;
-- DROP TABLE IF EXISTS students CASCADE;

-- Step 3: Recreate students table with phone as primary key
CREATE TABLE IF NOT EXISTS students (
  phone VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create OTP table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Update exam_results table
-- If table exists, rename column; otherwise create new table
DO $$
BEGIN
  -- Check if column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exam_results' AND column_name = 'student_aadhaar'
  ) THEN
    ALTER TABLE exam_results RENAME COLUMN student_aadhaar TO student_phone;
    ALTER TABLE exam_results ALTER COLUMN student_phone TYPE VARCHAR(20);
  END IF;
END $$;

-- Step 6: Update exam_progress table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exam_progress' AND column_name = 'student_aadhaar'
  ) THEN
    ALTER TABLE exam_progress RENAME COLUMN student_aadhaar TO student_phone;
    ALTER TABLE exam_progress ALTER COLUMN student_phone TYPE VARCHAR(20);
  END IF;
END $$;

-- Step 7: Add foreign key constraints
ALTER TABLE exam_results 
  ADD CONSTRAINT exam_results_student_phone_fkey 
  FOREIGN KEY (student_phone) REFERENCES students(phone) ON DELETE CASCADE;

ALTER TABLE exam_progress 
  ADD CONSTRAINT exam_progress_student_phone_fkey 
  FOREIGN KEY (student_phone) REFERENCES students(phone) ON DELETE CASCADE;

-- Step 8: Update indexes
DROP INDEX IF EXISTS idx_exam_results_student;
DROP INDEX IF EXISTS idx_exam_progress_student;
DROP INDEX IF EXISTS idx_students_aadhaar;

CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_phone);
CREATE INDEX IF NOT EXISTS idx_exam_progress_student ON exam_progress(student_phone);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);

-- Step 9: Enable RLS on OTP table
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Step 10: Create OTP policies
CREATE POLICY "Anyone can create OTP" ON otp_verifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can verify OTP" ON otp_verifications
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update OTP" ON otp_verifications
  FOR UPDATE USING (true);

-- Note: After running this migration, update your application code to use phone instead of aadhaar.

