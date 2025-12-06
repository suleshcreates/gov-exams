-- Fix RLS Policies for Admin Plan Templates
-- This script ensures admins can create, read, update, and delete plan templates

-- First, check if admins table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admins') THEN
    -- Create admins table if it doesn't exist
    CREATE TABLE public.admins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Create index
    CREATE INDEX idx_admins_auth_user_id ON admins(auth_user_id);
    CREATE INDEX idx_admins_email ON admins(email);
  END IF;
END $$;

-- Drop existing policies on plan_templates
DROP POLICY IF EXISTS "Enable read access for all users" ON plan_templates;
DROP POLICY IF EXISTS "Enable all access for admins" ON plan_templates;
DROP POLICY IF EXISTS "Admins can manage plan templates" ON plan_templates;
DROP POLICY IF EXISTS "Public can view active plans" ON plan_templates;

-- Create new, correct policies for plan_templates

-- 1. Allow everyone to view active plan templates (for public plans page)
CREATE POLICY "Enable read access for active plans"
  ON plan_templates
  FOR SELECT
  USING (is_active = true);

-- 2. Allow admins to view all plan templates (including inactive)
CREATE POLICY "Enable read access for admins"
  ON plan_templates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- 3. Allow admins to insert plan templates
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

-- 4. Allow admins to update plan templates
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

-- 5. Allow admins to delete plan templates
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
GRANT SELECT, INSERT, UPDATE, DELETE ON plan_templates TO authenticated;

-- Also fix subject_pricing table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON subject_pricing;
DROP POLICY IF EXISTS "Enable all access for admins" ON subject_pricing;

CREATE POLICY "Enable read access for active pricing"
  ON subject_pricing
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Enable all access for admins on subject_pricing"
  ON subject_pricing
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

ALTER TABLE subject_pricing ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON subject_pricing TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON subject_pricing TO authenticated;

-- Fix plan_discounts table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON plan_discounts;
DROP POLICY IF EXISTS "Enable all access for admins" ON plan_discounts;

CREATE POLICY "Enable read access for active discounts"
  ON plan_discounts
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Enable all access for admins on plan_discounts"
  ON plan_discounts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

ALTER TABLE plan_discounts ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON plan_discounts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON plan_discounts TO authenticated;

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

-- Check if current user is an admin
SELECT 
  u.email,
  a.role,
  CASE 
    WHEN a.auth_user_id IS NOT NULL THEN 'Yes'
    ELSE 'No'
  END as is_admin
FROM auth.users u
LEFT JOIN admins a ON u.id = a.auth_user_id
WHERE u.id = auth.uid();
