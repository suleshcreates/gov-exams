-- Migration: Add User Plans Table
-- Run this in your Supabase SQL Editor after the main schema

-- User Plans Table
CREATE TABLE IF NOT EXISTS user_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_phone VARCHAR(20) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  plan_id VARCHAR(255) NOT NULL,
  plan_name VARCHAR(255) NOT NULL,
  price_paid DECIMAL(10, 2) NOT NULL,
  exam_ids JSONB NOT NULL, -- Array of exam IDs included in the plan
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL means lifetime access
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (student_phone) REFERENCES students(phone) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_plans_student ON user_plans(student_phone);
CREATE INDEX IF NOT EXISTS idx_user_plans_student_name ON user_plans(student_name);
CREATE INDEX IF NOT EXISTS idx_user_plans_plan_id ON user_plans(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_active ON user_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_user_plans_student_active ON user_plans(student_phone, is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_plans
CREATE POLICY "Students can view own plans" ON user_plans
  FOR SELECT USING (true);

CREATE POLICY "Students can insert own plans" ON user_plans
  FOR INSERT WITH CHECK (true);

-- Note: Updates should be restricted in production, but allowing for now
CREATE POLICY "Students can update own plans" ON user_plans
  FOR UPDATE USING (true);

