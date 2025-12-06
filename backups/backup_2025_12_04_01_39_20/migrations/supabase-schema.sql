-- Supabase Database Schema for Exam Portal
-- Run this in your Supabase SQL Editor
-- WARNING: This will drop existing tables. Backup your data first if needed!

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (to recreate with new schema)
-- Remove these DROP statements if you want to keep existing data and use migration instead
DROP TABLE IF EXISTS user_plans CASCADE;
DROP TABLE IF EXISTS exam_progress CASCADE;
DROP TABLE IF EXISTS exam_results CASCADE;
DROP TABLE IF EXISTS otp_verifications CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- Students Table (Phone as primary identifier)
CREATE TABLE students (
  phone VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OTP Table for Phone Verification
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam Results Table
CREATE TABLE exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_phone VARCHAR(20) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
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

-- Exam Progress Table
CREATE TABLE exam_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_phone VARCHAR(20) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  exam_id VARCHAR(255) NOT NULL,
  completed_set_number INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (student_phone) REFERENCES students(phone) ON DELETE CASCADE,
  UNIQUE(student_phone, exam_id)
);

-- User Plans Table (for subscription plans and individual purchases)
CREATE TABLE user_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_phone VARCHAR(20) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  plan_id VARCHAR(255), -- NULL for individual subject purchases
  plan_name VARCHAR(255), -- NULL for individual subject purchases
  price_paid INTEGER NOT NULL,
  exam_ids TEXT[] NOT NULL, -- Array of selected subject IDs
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL for lifetime access
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (student_phone) REFERENCES students(phone) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_phone);
CREATE INDEX IF NOT EXISTS idx_exam_results_student_name ON exam_results(student_name);
CREATE INDEX IF NOT EXISTS idx_exam_results_created ON exam_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exam_progress_student ON exam_progress(student_phone);
CREATE INDEX IF NOT EXISTS idx_exam_progress_student_name ON exam_progress(student_name);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_plans_student ON user_plans(student_phone);
CREATE INDEX IF NOT EXISTS idx_user_plans_active ON user_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_user_plans_purchased ON user_plans(purchased_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

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

-- User Plans policies
CREATE POLICY "Users can view own plans" ON user_plans
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own plans" ON user_plans
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own plans" ON user_plans
  FOR UPDATE USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

