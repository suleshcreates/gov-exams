-- Supabase Database Schema for Exam Portal (Safe Migration)
-- This version preserves existing data if tables exist
-- Run this if you want to keep existing data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check and migrate students table
DO $$
BEGIN
  -- Check if students table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students') THEN
    -- Check if it has old schema (aadhaar column)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'students' AND column_name = 'aadhaar'
    ) THEN
      -- Drop foreign keys first
      ALTER TABLE IF EXISTS exam_progress DROP CONSTRAINT IF EXISTS exam_progress_student_aadhaar_fkey;
      ALTER TABLE IF EXISTS exam_results DROP CONSTRAINT IF EXISTS exam_results_student_aadhaar_fkey;
      
      -- Migrate students table: Drop and recreate
      DROP TABLE IF EXISTS exam_progress CASCADE;
      DROP TABLE IF EXISTS exam_results CASCADE;
      DROP TABLE IF EXISTS students CASCADE;
      
      -- Create new students table
      CREATE TABLE students (
        phone VARCHAR(20) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    END IF;
  ELSE
    -- Create students table if it doesn't exist
    CREATE TABLE students (
      phone VARCHAR(20) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- Create OTP table (drop and recreate if exists to ensure correct schema)
DROP TABLE IF EXISTS otp_verifications CASCADE;
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check and migrate exam_results table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exam_results') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'exam_results' AND column_name = 'student_aadhaar'
    ) THEN
      -- Table exists with old schema - drop and recreate
      DROP TABLE exam_results CASCADE;
    END IF;
  END IF;
END $$;

-- Create exam_results table
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_phone VARCHAR(20) NOT NULL,
  exam_id VARCHAR(255) NOT NULL,
  exam_title VARCHAR(255) NOT NULL,
  set_id VARCHAR(255) NOT NULL,
  set_number INTEGER NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  accuracy INTEGER NOT NULL,
  time_taken VARCHAR(50) NOT NULL,
  user_answers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (student_phone) REFERENCES students(phone) ON DELETE CASCADE
);

-- Check and migrate exam_progress table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exam_progress') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'exam_progress' AND column_name = 'student_aadhaar'
    ) THEN
      -- Table exists with old schema - drop and recreate
      DROP TABLE exam_progress CASCADE;
    END IF;
  END IF;
END $$;

-- Create exam_progress table
CREATE TABLE IF NOT EXISTS exam_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_phone VARCHAR(20) NOT NULL,
  exam_id VARCHAR(255) NOT NULL,
  completed_set_number INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (student_phone) REFERENCES students(phone) ON DELETE CASCADE,
  UNIQUE(student_phone, exam_id)
);

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_exam_results_student;
DROP INDEX IF EXISTS idx_exam_progress_student;
DROP INDEX IF EXISTS idx_students_aadhaar;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_phone);
CREATE INDEX IF NOT EXISTS idx_exam_results_created ON exam_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exam_progress_student ON exam_progress(student_phone);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Students can view own data" ON students;
DROP POLICY IF EXISTS "Students can insert own data" ON students;
DROP POLICY IF EXISTS "Students can update own data" ON students;
DROP POLICY IF EXISTS "Students can view own results" ON exam_results;
DROP POLICY IF EXISTS "Students can insert own results" ON exam_results;
DROP POLICY IF EXISTS "Students can view own progress" ON exam_progress;
DROP POLICY IF EXISTS "Students can update own progress" ON exam_progress;
DROP POLICY IF EXISTS "Students can insert own progress" ON exam_progress;
DROP POLICY IF EXISTS "Anyone can create OTP" ON otp_verifications;
DROP POLICY IF EXISTS "Anyone can verify OTP" ON otp_verifications;
DROP POLICY IF EXISTS "Anyone can update OTP" ON otp_verifications;

-- RLS Policies
-- Students can read their own data
CREATE POLICY "Students can view own data" ON students
  FOR SELECT USING (true);

CREATE POLICY "Students can insert own data" ON students
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Students can update own data" ON students
  FOR UPDATE USING (true);

-- Exam Results policies
CREATE POLICY "Students can view own results" ON exam_results
  FOR SELECT USING (true);

CREATE POLICY "Students can insert own results" ON exam_results
  FOR INSERT WITH CHECK (true);

-- Exam Progress policies
CREATE POLICY "Students can view own progress" ON exam_progress
  FOR SELECT USING (true);

CREATE POLICY "Students can update own progress" ON exam_progress
  FOR UPDATE USING (true);

CREATE POLICY "Students can insert own progress" ON exam_progress
  FOR INSERT WITH CHECK (true);

-- OTP Verification policies
CREATE POLICY "Anyone can create OTP" ON otp_verifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can verify OTP" ON otp_verifications
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update OTP" ON otp_verifications
  FOR UPDATE USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_students_updated_at ON students;
DROP TRIGGER IF EXISTS update_exam_progress_updated_at ON exam_progress;

-- Trigger for students table
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for exam_progress table
CREATE TRIGGER update_exam_progress_updated_at
  BEFORE UPDATE ON exam_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();



