-- PRODUCTION RLS SECURITY - DMLT ACADEMY
-- Run this in Supabase SQL Editor for production deployment
-- This ensures proper Row Level Security for all tables

-- ============================================
-- 1. STUDENTS TABLE - Authentication basprduction_rls.sql scripted access
-- ============================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can read own profile by auth_user_id" ON students;
DROP POLICY IF EXISTS "Users can read own profile by phone" ON students;
DROP POLICY IF EXISTS "Users can insert own profile" ON students;
DROP POLICY IF EXISTS "Users can update own profile" ON students;
DROP POLICY IF EXISTS "Admins have full access to students" ON students;
DROP POLICY IF EXISTS "Service role full access" ON students;

-- Allow users to SELECT their own record
CREATE POLICY "Users read own profile"
  ON students FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Allow users to UPDATE their own record
CREATE POLICY "Users update own profile"
  ON students FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Allow INSERT for new signups (through trigger)
CREATE POLICY "Users insert own profile"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Service role bypass (for triggers)
CREATE POLICY "Service role full access to students"
  ON students FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admins full access
CREATE POLICY "Admins full access to students"
  ON students FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

GRANT SELECT, INSERT, UPDATE ON students TO authenticated;
GRANT ALL ON students TO service_role;

-- ============================================
-- 2. EXAM_RESULTS TABLE - Student owns their results
-- ============================================
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own exam results" ON exam_results;
DROP POLICY IF EXISTS "Users can insert own exam results" ON exam_results;
DROP POLICY IF EXISTS "Admins have full access to exam_results" ON exam_results;

CREATE POLICY "Users read own results"
  ON exam_results FOR SELECT
  TO authenticated
  USING (student_phone IN (SELECT phone FROM students WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users insert own results"
  ON exam_results FOR INSERT
  TO authenticated
  WITH CHECK (student_phone IN (SELECT phone FROM students WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins full access to results"
  ON exam_results FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

GRANT SELECT, INSERT ON exam_results TO authenticated;

-- ============================================
-- 3. USER_PLANS TABLE - Student owns their plans
-- ============================================
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own user plans" ON user_plans;
DROP POLICY IF EXISTS "Users can insert own user plans" ON user_plans;
DROP POLICY IF EXISTS "Users can update own user plans" ON user_plans;
DROP POLICY IF EXISTS "Admins have full access to user_plans" ON user_plans;

CREATE POLICY "Users read own plans"
  ON user_plans FOR SELECT
  TO authenticated
  USING (student_phone IN (SELECT phone FROM students WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users insert own plans"
  ON user_plans FOR INSERT
  TO authenticated
  WITH CHECK (student_phone IN (SELECT phone FROM students WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users update own plans"
  ON user_plans FOR UPDATE
  TO authenticated
  USING (student_phone IN (SELECT phone FROM students WHERE auth_user_id = auth.uid()))
  WITH CHECK (student_phone IN (SELECT phone FROM students WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins full access to plans"
  ON user_plans FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

GRANT SELECT, INSERT, UPDATE ON user_plans TO authenticated;

-- ============================================
-- 4. EXAM_PROGRESS TABLE - Student owns their progress
-- ============================================
ALTER TABLE exam_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own exam progress" ON exam_progress;
DROP POLICY IF EXISTS "Users can insert own exam progress" ON exam_progress;
DROP POLICY IF EXISTS "Users can update own exam progress" ON exam_progress;
DROP POLICY IF EXISTS "Admins have full access to exam_progress" ON exam_progress;

CREATE POLICY "Users read own progress"
  ON exam_progress FOR SELECT
  TO authenticated
  USING (student_phone IN (SELECT phone FROM students WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users insert own progress"
  ON exam_progress FOR INSERT
  TO authenticated
  WITH CHECK (student_phone IN (SELECT phone FROM students WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users update own progress"
  ON exam_progress FOR UPDATE
  TO authenticated
  USING (student_phone IN (SELECT phone FROM students WHERE auth_user_id = auth.uid()))
  WITH CHECK (student_phone IN (SELECT phone FROM students WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins full access to progress"
  ON exam_progress FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

GRANT SELECT, INSERT, UPDATE ON exam_progress TO authenticated;

-- ============================================
-- 5. PLAN_TEMPLATES TABLE - Public read, Admin write
-- ============================================
ALTER TABLE plan_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read plan templates" ON plan_templates;
DROP POLICY IF EXISTS "Admins can insert plan templates" ON plan_templates;
DROP POLICY IF EXISTS "Admins can update plan templates" ON plan_templates;
DROP POLICY IF EXISTS "Admins can delete plan templates" ON plan_templates;

-- Everyone can read (including anonymous)
CREATE POLICY "Public read templates"
  ON plan_templates FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can modify
CREATE POLICY "Admins insert templates"
  ON plan_templates FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins update templates"
  ON plan_templates FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins delete templates"
  ON plan_templates FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

GRANT SELECT ON plan_templates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON plan_templates TO authenticated;

-- ============================================
-- 6. SUBJECTS TABLE - Public read, Admin write
-- ============================================
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read subjects" ON subjects;
DROP POLICY IF EXISTS "Admins modify subjects" ON subjects;

CREATE POLICY "Public read subjects"
  ON subjects FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins modify subjects"
  ON subjects FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

GRANT SELECT ON subjects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON subjects TO authenticated;

-- ============================================
-- 7. QUESTION_SETS TABLE - Public read, Admin write
-- ============================================
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read question_sets" ON question_sets;
DROP POLICY IF EXISTS "Admins modify question_sets" ON question_sets;

CREATE POLICY "Public read question sets"
  ON question_sets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins modify question sets"
  ON question_sets FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

GRANT SELECT ON question_sets TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON question_sets TO authenticated;

-- ============================================
-- 8. QUESTIONS TABLE - Public read, Admin write
-- ============================================
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read questions" ON questions;
DROP POLICY IF EXISTS "Admins modify questions" ON questions;

CREATE POLICY "Public read questions"
  ON questions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins modify questions"
  ON questions FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

GRANT SELECT ON questions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON questions TO authenticated;

-- ============================================
-- 9. ADMINS TABLE - Admin only access
-- ============================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read own record" ON admins;
DROP POLICY IF EXISTS "Admins full access" ON admins;

CREATE POLICY "Admins read all"
  ON admins FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins full access"
  ON admins FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON admins TO authenticated;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check RLS is enabled on all tables
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('students', 'exam_results', 'user_plans', 'exam_progress', 
                    'plan_templates', 'subjects', 'question_sets', 'questions', 'admins')
ORDER BY tablename;

-- Count policies per table
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Show all policies
SELECT 
  tablename,
  policyname,
  cmd as operation,
  CASE WHEN roles::text LIKE '%anon%' THEN '🌍 Public' 
       WHEN roles::text LIKE '%authenticated%' THEN '🔐 Auth' 
       ELSE roles::text END as access_level
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ PRODUCTION RLS POLICIES APPLIED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ All tables have RLS enabled';
  RAISE NOTICE '✅ Secure policies implemented';
  RAISE NOTICE '✅ Public can read subjects/questions';
  RAISE NOTICE '✅ Users can only access their own data';
  RAISE NOTICE '✅ Admins have full access';
  RAISE NOTICE '';
  RAISE NOTICE 'Your production database is now secure!';
  RAISE NOTICE '';
END $$;
