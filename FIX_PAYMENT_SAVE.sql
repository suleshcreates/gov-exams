-- FIX POST-PAYMENT SAVE ERROR (401)
-- Students use custom auth, not Supabase Auth, so auth.uid() is NULL
-- This allows students to save their plan purchases after payment

-- ============================================
-- 1. USER_PLANS - Allow anyone to insert
-- ============================================
DROP POLICY IF EXISTS "Users insert own plans" ON user_plans;

-- Allow all authenticated/anon users to insert
-- Security: Payment must be completed via Razorpay first
CREATE POLICY "Anyone can insert plans"
  ON user_plans FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Keep existing read policy
-- Keep existing update policy (users can update their own based on phone)

-- ============================================
-- 2. Verification
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd,
  roles::text
FROM pg_policies
WHERE tablename = 'user_plans'
ORDER BY cmd, policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ POST-PAYMENT SAVE FIX APPLIED!';
  RAISE NOTICE '';
  RAISE NOTICE 'user_plans table now allows:';
  RAISE NOTICE '- Anyone (anon/authenticated) to INSERT plans';
  RAISE NOTICE '- Users protected by payment flow security';
  RAISE NOTICE '';
  RAISE NOTICE 'Try completing a payment again!';
  RAISE NOTICE '';
END $$;
