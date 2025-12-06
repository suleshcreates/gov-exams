-- CLEAN UP CONFLICTING POLICIES
-- Remove all old policies and keep only "allow all for students"

-- ============================================
-- 1. DROP ALL OLD POLICIES
-- ============================================
DROP POLICY IF EXISTS "admins only full access" ON students;
DROP POLICY IF EXISTS "ad_own" ON students;
DROP POLICY IF EXISTS "students_insert_policy" ON students;
DROP POLICY IF EXISTS "students_service_insert" ON students;
DROP POLICY IF EXISTS "students_update_policy" ON students;
DROP POLICY IF EXISTS "update_own" ON students;

-- Keep only this one:
-- "allow all for students" - already exists, no need to recreate

-- ============================================
-- 2. VERIFICATION
-- ============================================
SELECT 
  policyname,
  cmd,
  roles::text
FROM pg_policies
WHERE tablename = 'students'
ORDER BY policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ CLEANED UP CONFLICTING POLICIES!';
  RAISE NOTICE '';
  RAISE NOTICE 'Removed old policies that were blocking access.';
  RAISE NOTICE 'Only "allow all for students" policy remains.';
  RAISE NOTICE '';
  RAISE NOTICE 'Try login/signup now!';
  RAISE NOTICE '';
END $$;
