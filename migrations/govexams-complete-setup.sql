-- ============================================
-- GovExams - Complete Database Setup Script
-- ============================================
-- Generated from exact production schema
-- Run this in your NEW Supabase project SQL Editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: students (Primary user table)
-- ============================================
CREATE TABLE students (
  phone VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(255) UNIQUE,
  auth_user_id UUID UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_code VARCHAR(255),
  verification_code_expires TIMESTAMP WITHOUT TIME ZONE,
  reset_code VARCHAR(255),
  reset_code_expires TIMESTAMP WITHOUT TIME ZONE,
  avatar_url TEXT,
  PRIMARY KEY (email)
);

-- ============================================
-- TABLE 2: admins
-- ============================================
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITHOUT TIME ZONE,
  role TEXT DEFAULT 'admin',
  password_hash TEXT
);

-- ============================================
-- TABLE 3: sessions (JWT refresh tokens)
-- ============================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  refresh_token_hash TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE 4: otp_verifications
-- ============================================
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE 5: subjects
-- ============================================
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE 6: question_sets
-- ============================================
CREATE TABLE question_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  exam_id VARCHAR(50) NOT NULL,
  set_number INTEGER NOT NULL,
  time_limit_minutes INTEGER NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_id, set_number)
);

-- ============================================
-- TABLE 7: questions
-- ============================================
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_set_id UUID REFERENCES question_sets(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_text_marathi TEXT NOT NULL,
  option_1 TEXT NOT NULL,
  option_1_marathi TEXT NOT NULL,
  option_2 TEXT NOT NULL,
  option_2_marathi TEXT NOT NULL,
  option_3 TEXT NOT NULL,
  option_3_marathi TEXT NOT NULL,
  option_4 TEXT NOT NULL,
  option_4_marathi TEXT NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer BETWEEN 0 AND 3),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  explanation TEXT
);

-- ============================================
-- TABLE 8: exam_results
-- ============================================
CREATE TABLE exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_phone VARCHAR(255) NOT NULL,
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
  student_name VARCHAR(255),
  student_email VARCHAR(255)
);

-- ============================================
-- TABLE 9: exam_progress
-- ============================================
CREATE TABLE exam_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_phone VARCHAR(255) NOT NULL,
  exam_id VARCHAR(255) NOT NULL,
  completed_set_number INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  student_name VARCHAR(255),
  student_email VARCHAR(255),
  UNIQUE(student_phone, exam_id)
);

-- ============================================
-- TABLE 10: plan_templates
-- ============================================
CREATE TABLE plan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  validity_days INTEGER,
  subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  badge TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE 11: user_plans
-- ============================================
CREATE TABLE user_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_phone VARCHAR(255) NOT NULL,
  plan_id VARCHAR(255) NOT NULL,
  plan_name VARCHAR(255) NOT NULL,
  price_paid NUMERIC(10,2) NOT NULL,
  exam_ids JSONB NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  student_name VARCHAR(255),
  student_email VARCHAR(255),
  plan_template_id UUID REFERENCES plan_templates(id),
  discount_code VARCHAR(50),
  original_price NUMERIC(10,2),
  discount_amount NUMERIC(10,2) DEFAULT 0,
  auth_user_id UUID,
  payment_id TEXT,
  order_id TEXT,
  payment_signature TEXT,
  payment_status TEXT DEFAULT 'completed'
);

-- ============================================
-- TABLE 12: subject_pricing
-- ============================================
CREATE TABLE subject_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  validity_days INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subject_id)
);

-- ============================================
-- TABLE 13: plan_discounts
-- ============================================
CREATE TABLE plan_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value >= 0),
  applicable_to JSONB,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (end_date > start_date)
);

-- ============================================
-- TABLE 14: plan_template_versions
-- ============================================
CREATE TABLE plan_template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_template_id UUID REFERENCES plan_templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  validity_days INTEGER,
  subjects JSONB NOT NULL,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_notes TEXT
);

-- ============================================
-- VIEW 15: students_public (Read-only view)
-- ============================================
CREATE OR REPLACE VIEW students_public AS
SELECT 
  phone,
  name,
  email,
  username,
  is_verified,
  email_verified,
  created_at,
  updated_at
FROM students;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_username ON students(username);
CREATE INDEX idx_students_auth_user_id ON students(auth_user_id);
CREATE INDEX idx_students_phone ON students(phone);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token_hash);
CREATE INDEX idx_exam_results_student_phone ON exam_results(student_phone);
CREATE INDEX idx_exam_results_student_email ON exam_results(student_email);
CREATE INDEX idx_exam_results_created ON exam_results(created_at DESC);
CREATE INDEX idx_exam_results_exam_id ON exam_results(exam_id);
CREATE INDEX idx_exam_progress_student_phone ON exam_progress(student_phone);
CREATE INDEX idx_exam_progress_student_email ON exam_progress(student_email);
CREATE INDEX idx_otp_phone ON otp_verifications(phone);
CREATE INDEX idx_otp_expires ON otp_verifications(expires_at);
CREATE INDEX idx_question_sets_subject_id ON question_sets(subject_id);
CREATE INDEX idx_question_sets_exam_id ON question_sets(exam_id);
CREATE INDEX idx_questions_question_set_id ON questions(question_set_id);
CREATE INDEX idx_questions_order ON questions(question_set_id, order_index);
CREATE INDEX idx_admins_auth_user_id ON admins(auth_user_id);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_user_plans_student_phone ON user_plans(student_phone);
CREATE INDEX idx_user_plans_student_email ON user_plans(student_email);
CREATE INDEX idx_user_plans_is_active ON user_plans(is_active);
CREATE INDEX idx_user_plans_auth_user_id ON user_plans(auth_user_id);
CREATE INDEX idx_user_plans_expires_at ON user_plans(expires_at);
CREATE INDEX idx_plan_templates_active ON plan_templates(is_active);
CREATE INDEX idx_plan_templates_display_order ON plan_templates(display_order);
CREATE INDEX idx_subject_pricing_subject_id ON subject_pricing(subject_id);
CREATE INDEX idx_subject_pricing_active ON subject_pricing(is_active);
CREATE INDEX idx_plan_discounts_code ON plan_discounts(code);
CREATE INDEX idx_plan_discounts_active ON plan_discounts(is_active);

-- ============================================
-- TRIGGERS: updated_at auto-update
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_question_sets_updated_at BEFORE UPDATE ON question_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plan_templates_updated_at BEFORE UPDATE ON plan_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subject_pricing_updated_at BEFORE UPDATE ON subject_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_progress_updated_at BEFORE UPDATE ON exam_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================

-- is_admin() function - checks if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.auth_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- check_if_admin() function - alternative admin check
CREATE OR REPLACE FUNCTION check_if_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.auth_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

-- UNRESTRICTED tables
ALTER TABLE plan_discounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE plan_template_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE subject_pricing DISABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications DISABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: admins
-- ============================================
CREATE POLICY "Admins read admins" ON admins
  FOR SELECT TO authenticated USING (check_if_admin());

CREATE POLICY "Service role admin access" ON admins
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- RLS POLICIES: exam_progress
-- ============================================
CREATE POLICY "Admin full access" ON exam_progress
  FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admin full access exam_progress" ON exam_progress
  FOR ALL TO authenticated 
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Service role bypass progress" ON exam_progress
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- RLS POLICIES: exam_results
-- ============================================
CREATE POLICY "Admin full access" ON exam_results
  FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admin full access exam_results" ON exam_results
  FOR ALL TO authenticated 
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can view all exam results" ON exam_results
  FOR SELECT TO public USING (is_admin());

CREATE POLICY "Service role bypass results" ON exam_results
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access results" ON exam_results
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- RLS POLICIES: plan_templates
-- ============================================
CREATE POLICY "Admin full access" ON plan_templates
  FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admin full access plan_templates" ON plan_templates
  FOR ALL TO authenticated 
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can create plan templates" ON plan_templates
  FOR INSERT TO public WITH CHECK (is_admin());

CREATE POLICY "Admins can delete plan templates" ON plan_templates
  FOR DELETE TO public USING (is_admin());

CREATE POLICY "Admins can update plan templates" ON plan_templates
  FOR UPDATE TO public USING (is_admin());

CREATE POLICY "Admins can view all plan templates" ON plan_templates
  FOR SELECT TO public USING (is_admin());

CREATE POLICY "Admins modify templates" ON plan_templates
  FOR ALL TO authenticated 
  USING (check_if_admin()) WITH CHECK (check_if_admin());

CREATE POLICY "Public read templates" ON plan_templates
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================
-- RLS POLICIES: question_sets
-- ============================================
CREATE POLICY "Admin full access" ON question_sets
  FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admin full access question_sets" ON question_sets
  FOR ALL TO authenticated 
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can create question sets" ON question_sets
  FOR INSERT TO public WITH CHECK (is_admin());

CREATE POLICY "Admins can delete question sets" ON question_sets
  FOR DELETE TO public USING (is_admin());

CREATE POLICY "Admins can update question sets" ON question_sets
  FOR UPDATE TO public USING (is_admin());

CREATE POLICY "Admins can view all question sets" ON question_sets
  FOR SELECT TO public USING (is_admin());

CREATE POLICY "Admins modify question_sets" ON question_sets
  FOR ALL TO authenticated 
  USING (check_if_admin()) WITH CHECK (check_if_admin());

CREATE POLICY "Public read question_sets" ON question_sets
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================
-- RLS POLICIES: questions
-- ============================================
CREATE POLICY "Admin full access" ON questions
  FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admin full access questions" ON questions
  FOR ALL TO authenticated 
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can create questions" ON questions
  FOR INSERT TO public WITH CHECK (is_admin());

CREATE POLICY "Admins can delete questions" ON questions
  FOR DELETE TO public USING (is_admin());

CREATE POLICY "Admins can update questions" ON questions
  FOR UPDATE TO public USING (is_admin());

CREATE POLICY "Admins can view all questions" ON questions
  FOR SELECT TO public USING (is_admin());

CREATE POLICY "Admins modify questions" ON questions
  FOR ALL TO authenticated 
  USING (check_if_admin()) WITH CHECK (check_if_admin());

CREATE POLICY "Public read questions" ON questions
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================
-- RLS POLICIES: sessions
-- ============================================
CREATE POLICY "Admin full access" ON sessions
  FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admin full access sessions" ON sessions
  FOR ALL TO authenticated 
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can delete any session" ON sessions
  FOR DELETE TO public USING (is_admin());

CREATE POLICY "Admins can view all sessions" ON sessions
  FOR SELECT TO public USING (is_admin());

CREATE POLICY "Service role full access sessions" ON sessions
  FOR ALL TO service_role USING (true);

-- ============================================
-- RLS POLICIES: students
-- ============================================
CREATE POLICY "Admin full access" ON students
  FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admin full access students" ON students
  FOR ALL TO authenticated 
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can view all students" ON students
  FOR SELECT TO public USING (is_admin());

CREATE POLICY "Service role only students" ON students
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- RLS POLICIES: subject_pricing (UNRESTRICTED but has policies)
-- ============================================
CREATE POLICY "Admins can create subject pricing" ON subject_pricing
  FOR INSERT TO public WITH CHECK (is_admin());

CREATE POLICY "Admins can delete subject pricing" ON subject_pricing
  FOR DELETE TO public USING (is_admin());

CREATE POLICY "Admins can update subject pricing" ON subject_pricing
  FOR UPDATE TO public USING (is_admin());

CREATE POLICY "Admins can view all subject pricing" ON subject_pricing
  FOR SELECT TO public USING (is_admin());

-- ============================================
-- RLS POLICIES: subjects
-- ============================================
CREATE POLICY "Admin full access" ON subjects
  FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admin full access subjects" ON subjects
  FOR ALL TO authenticated 
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can create subjects" ON subjects
  FOR INSERT TO public WITH CHECK (is_admin());

CREATE POLICY "Admins can delete subjects" ON subjects
  FOR DELETE TO public USING (is_admin());

CREATE POLICY "Admins can update subjects" ON subjects
  FOR UPDATE TO public USING (is_admin());

CREATE POLICY "Admins can view all subjects" ON subjects
  FOR SELECT TO public USING (is_admin());

CREATE POLICY "Admins modify subjects" ON subjects
  FOR ALL TO authenticated 
  USING (check_if_admin()) WITH CHECK (check_if_admin());

CREATE POLICY "Public read subjects" ON subjects
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================
-- RLS POLICIES: user_plans
-- ============================================
CREATE POLICY "Admin full access" ON user_plans
  FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admin full access user_plans" ON user_plans
  FOR ALL TO authenticated 
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can view all user plans" ON user_plans
  FOR SELECT TO public USING (is_admin());

CREATE POLICY "Authenticated admins full access" ON user_plans
  FOR ALL TO public 
  USING (
    auth.role() = 'authenticated' AND 
    EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt() ->> 'email')
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND 
    EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt() ->> 'email')
  );

CREATE POLICY "Service role full access" ON user_plans
  FOR ALL TO public USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access plans" ON user_plans
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Students can read their own plans" ON user_plans
  FOR SELECT TO public 
  USING (
    student_phone IN (
      SELECT phone FROM students WHERE students.auth_user_id = auth.uid()
    )
  );

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Setup Complete!' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as tables_created,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as policies_created;

-- ============================================
-- ADMIN SETUP INSTRUCTIONS
-- ============================================
-- After running this script:
-- 
-- 1. Create admin user in Supabase Dashboard > Authentication > Users
-- 2. Copy the user's UUID
-- 3. Run this query:
--
-- INSERT INTO admins (auth_user_id, email, name, role, password_hash) 
-- VALUES (
--   'YOUR_USER_UUID_HERE', 
--   'admin@govexams.info', 
--   'Admin',
--   'admin',
--   '$2b$10$YOUR_BCRYPT_HASH_HERE'
-- );
