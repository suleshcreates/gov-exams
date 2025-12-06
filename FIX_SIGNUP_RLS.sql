-- FIX SIGNUP RLS ERROR
-- This script specifically fixes the "new row violates row-level security policy" error during signup

-- 1. Drop the restrictive insert policy
DROP POLICY IF EXISTS "Users insert own" ON students;
DROP POLICY IF EXISTS "Users insert own profile" ON students;

-- 2. Create a new policy that allows EVERYONE (including anonymous users) to insert
-- This is required because during signup, the user is not yet authenticated
CREATE POLICY "Public insert students"
  ON students FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 3. Grant necessary permissions
GRANT INSERT ON students TO anon, authenticated;

-- Verification
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ SIGNUP FIX APPLIED!';
  RAISE NOTICE 'Students table now allows anonymous inserts for signup.';
  RAISE NOTICE '';
END $$;
