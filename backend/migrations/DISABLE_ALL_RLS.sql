-- =====================================================
-- NUCLEAR OPTION: Disable ALL RLS for Admin Testing
-- Run this to completely bypass RLS and test the dashboard
-- =====================================================

-- Disable RLS on all tables
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_sets DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Check which tables have RLS enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- All should show rls_enabled = false

-- =====================================================
-- After this, refresh your admin dashboard
-- If it works, the issue is RLS policies
-- If it still doesn't work, the issue is elsewhere
-- =====================================================
