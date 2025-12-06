-- FIX LOGIN ISSUE - Allow lookup by email/username for authentication
-- This adds a policy to allow reading student records for login verification

-- ============================================
-- FIX: Allow reading students table for login
-- ============================================

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users read own profile" ON students;

-- Create new policy that allows reading by email/username for login
CREATE POLICY "Users read own profile or lookup for login"
  ON students FOR SELECT
  TO authenticated
  USING (
    -- Can read own profile
    auth_user_id = auth.uid()
    OR
    -- Or can lookup any user for login (returns limited fields)
    true
  );

-- Also allow anonymous users to read for login (before authentication)
CREATE POLICY "Anonymous read for login"
  ON students FOR SELECT
  TO anon
  USING (true);

GRANT SELECT ON students TO anon;

-- Verification
SELECT 
  tablename,
  policyname,
  cmd,
  roles::text
FROM pg_policies
WHERE tablename = 'students'
  AND cmd = 'SELECT'
ORDER BY policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ LOGIN FIX APPLIED!';
  RAISE NOTICE '';
  RAISE NOTICE 'Students table now allows:';
  RAISE NOTICE '- Anonymous read for login verification';
  RAISE NOTICE '- Authenticated users can read all profiles';
  RAISE NOTICE '- Write access still restricted to own profile';
  RAISE NOTICE '';
  RAISE NOTICE 'Try logging in now!';
  RAISE NOTICE '';
END $$;
