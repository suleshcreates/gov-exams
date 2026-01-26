-- ============================================
-- Special Exams & PYQ Premium Features
-- Migration Script
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: special_exams
-- Stores metadata for premium 100-question exams
-- ============================================
CREATE TABLE IF NOT EXISTS special_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- e.g., "MPSC", "UPSC", "Railway"
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_questions INTEGER DEFAULT 100,
  sets_count INTEGER DEFAULT 5,
  questions_per_set INTEGER DEFAULT 20,
  time_limit_minutes INTEGER DEFAULT 30, -- per set
  is_active BOOLEAN DEFAULT TRUE,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: special_exam_sets
-- Links question sets to special exams
-- ============================================
CREATE TABLE IF NOT EXISTS special_exam_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  special_exam_id UUID NOT NULL REFERENCES special_exams(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL CHECK (set_number BETWEEN 1 AND 5),
  question_set_id UUID REFERENCES question_sets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(special_exam_id, set_number)
);

-- ============================================
-- TABLE: pyq_pdfs
-- Stores metadata for premium PYQ PDF files
-- ============================================
CREATE TABLE IF NOT EXISTS pyq_pdfs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- e.g., "MPSC", "UPSC"
  year INTEGER,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  pdf_url TEXT NOT NULL,
  thumbnail_url TEXT,
  page_count INTEGER,
  file_size_mb NUMERIC(5,2),
  is_active BOOLEAN DEFAULT TRUE,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: user_premium_access
-- Tracks user purchases for exams and PYQs
-- ============================================
CREATE TABLE IF NOT EXISTS user_premium_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_auth_id UUID NOT NULL,
  user_email VARCHAR(255),
  resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('special_exam', 'pyq')),
  resource_id UUID NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL = never expires
  payment_id TEXT,
  order_id TEXT,
  amount_paid NUMERIC(10,2),
  UNIQUE(user_auth_id, resource_type, resource_id)
);

-- ============================================
-- TABLE: special_exam_results
-- Stores results for special exam attempts
-- ============================================
CREATE TABLE IF NOT EXISTS special_exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_auth_id UUID NOT NULL,
  user_email VARCHAR(255),
  special_exam_id UUID NOT NULL REFERENCES special_exams(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  accuracy NUMERIC(5,2) NOT NULL,
  time_taken_seconds INTEGER,
  user_answers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_premium_access_user ON user_premium_access(user_auth_id);
CREATE INDEX IF NOT EXISTS idx_user_premium_access_resource ON user_premium_access(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_special_exam_results_user ON special_exam_results(user_auth_id);
CREATE INDEX IF NOT EXISTS idx_special_exams_category ON special_exams(category);
CREATE INDEX IF NOT EXISTS idx_pyq_pdfs_category ON pyq_pdfs(category);
CREATE INDEX IF NOT EXISTS idx_pyq_pdfs_year ON pyq_pdfs(year);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE special_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_exam_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pyq_pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_premium_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_exam_results ENABLE ROW LEVEL SECURITY;

-- Public read for active exams/PYQs
CREATE POLICY "Public can view active special exams" ON special_exams
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active PYQs" ON pyq_pdfs
  FOR SELECT USING (is_active = true);

-- Users can see their own access
CREATE POLICY "Users can view own premium access" ON user_premium_access
  FOR SELECT USING (user_auth_id = auth.uid());

CREATE POLICY "Users can view own exam results" ON special_exam_results
  FOR SELECT USING (user_auth_id = auth.uid());

-- Service role has full access (for backend)
CREATE POLICY "Service role full access special_exams" ON special_exams
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access special_exam_sets" ON special_exam_sets
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access pyq_pdfs" ON pyq_pdfs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access user_premium_access" ON user_premium_access
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access special_exam_results" ON special_exam_results
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- Storage bucket for PYQ PDFs
-- Run this separately in Storage settings or via API
-- ============================================
-- Note: Create bucket 'pyq-pdfs' via Supabase Dashboard
-- with private access (authenticated only)

-- ============================================
-- Storage Bucket Creation (Run in SQL Editor)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'pyq-pdfs',
    'pyq-pdfs',
    false,  -- Private bucket (not public)
    52428800,  -- 50MB max file size
    ARRAY['application/pdf']::text[]
) ON CONFLICT (id) DO NOTHING;

-- Storage Policies for pyq-pdfs bucket
-- Allow authenticated users to read (download) if they have access
CREATE POLICY "Authenticated users can view PYQ files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'pyq-pdfs' 
    AND auth.role() = 'authenticated'
);

-- Allow service role to insert (admin uploads)
CREATE POLICY "Service role can upload PYQ files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'pyq-pdfs' 
    AND auth.role() = 'service_role'
);

-- Allow service role to delete
CREATE POLICY "Service role can delete PYQ files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'pyq-pdfs' 
    AND auth.role() = 'service_role'
);
