-- FIX PLAN DELETION - Allow service role to delete plan templates
-- This explicitly grants DELETE permission to the service role for plan_templates

-- ============================================
-- FIX: Allow service role to delete plan templates
-- ============================================

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Service role modify templates" ON plan_templates;

-- Re-create the comprehensive service role policy
CREATE POLICY "Service role full access templates"
  ON plan_templates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Explicitly grant DELETE permission
GRANT DELETE ON plan_templates TO service_role;

-- Verification
SELECT 
  tablename,
  policyname,
  cmd,
  roles::text
FROM pg_policies
WHERE tablename = 'plan_templates'
ORDER BY policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ PLAN DELETION FIX APPLIED!';
  RAISE NOTICE '';
  RAISE NOTICE 'Plan Templates table now allows:';
  RAISE NOTICE '- Service role (Admin) to DELETE templates';
  RAISE NOTICE '- Service role (Admin) to INSERT/UPDATE templates';
  RAISE NOTICE '- Public read access maintained';
  RAISE NOTICE '';
  RAISE NOTICE 'Try deleting a plan from the admin panel now!';
  RAISE NOTICE '';
END $$;
