-- Fix RLS Policies for Plan Templates
-- This script ensures admins can create, read, update, and delete plan templates

-- First, check if plan_templates table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'plan_templates') THEN
    RAISE EXCEPTION 'Table plan_templates does not exist. Please run supabase-plan-pricing-schema.sql first.';
  END IF;
END $$;

-- Drop existing policies on plan_templates
DROP POLICY IF EXISTS "Enable read access for all users" ON plan_templates;
DROP POLICY IF EXISTS "Enable insert for admins" ON plan_templates;
DROP POLICY IF EXISTS "Enable update for admins" ON plan_templates;
DROP POLICY IF EXISTS "Enable delete for admins" ON plan_templates;
DROP POLICY IF EXISTS "Admins can manage plan templates" ON plan_templates;

-- Create new, correct policies

-- 1. Allow everyone to read active plan templates (for students to see plans)
CREATE POLICY "Enable read access for all users"
  ON plan_templates
  FOR SELECT
  USING (true);

-- 2. Allow admins to insert plan templates
CREATE POLICY "Enable insert for admins"
  ON plan_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- 3. Allow admins to update plan templates
CREATE POLICY "Enable update for admins"
  ON plan_templates
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- 4. Allow admins to delete plan templates
CREATE POLICY "Enable delete for admins"
  ON plan_templates
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE plan_templates ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT ON plan_templates TO anon;
GRANT SELECT ON plan_templates TO authenticated;
GRANT INSERT, UPDATE, DELETE ON plan_templates TO authenticated;

-- Also fix subject_pricing table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON subject_pricing;
DROP POLICY IF EXISTS "Enable insert for admins" ON subject_pricing;
DROP POLICY IF EXISTS "Enable update for admins" ON subject_pricing;
DROP POLICY IF EXISTS "Enable delete for admins" ON subject_pricing;

CREATE POLICY "Enable read access for all users"
  ON subject_pricing
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for admins"
  ON subject_pricing
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Enable update for admins"
  ON subject_pricing
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Enable delete for admins"
  ON subject_pricing
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

ALTER TABLE subject_pricing ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON subject_pricing TO anon;
GRANT SELECT ON subject_pricing TO authenticated;
GRANT INSERT, UPDATE, DELETE ON subject_pricing TO authenticated;

-- Also fix plan_discounts table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON plan_discounts;
DROP POLICY IF EXISTS "Enable insert for admins" ON plan_discounts;
DROP POLICY IF EXISTS "Enable update for admins" ON plan_discounts;
DROP POLICY IF EXISTS "Enable delete for admins" ON plan_discounts;

CREATE POLICY "Enable read access for all users"
  ON plan_discounts
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for admins"
  ON plan_discounts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Enable update for admins"
  ON plan_discounts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Enable delete for admins"
  ON plan_discounts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

ALTER TABLE plan_discounts ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON plan_discounts TO anon;
GRANT SELECT ON plan_discounts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON plan_discounts TO authenticated;

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('plan_templates', 'subject_pricing', 'plan_discounts')
ORDER BY tablename, policyname;

-- Check if current user is admin
SELECT 
  'Current user is admin:' as status,
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.auth_user_id = auth.uid()
  ) as is_admin;
