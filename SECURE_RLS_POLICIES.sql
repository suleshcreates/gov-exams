-- SECURE RLS POLICIES (STRICT MODE)
-- Run this AFTER deploying the updated sync-user-auth function

-- 1. DROP ALL EXISTING POLICIES
DROP POLICY IF EXISTS "read_own" ON students;
DROP POLICY IF EXISTS "update_own" ON students;
DROP POLICY IF EXISTS "Admins only full access" ON students;
DROP POLICY IF EXISTS "service_role_all" ON students;
DROP POLICY IF EXISTS "allow_insert" ON students;
DROP POLICY IF EXISTS "allow_update" ON students;
DROP POLICY IF EXISTS "allow_select" ON students;
DROP POLICY IF EXISTS "students_insert_policy" ON students;
DROP POLICY IF EXISTS "students_update_policy" ON students;
DROP POLICY IF EXISTS "allow all for students" ON students;

-- 2. ENABLE RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- 3. CREATE STRICT POLICIES

-- SELECT: Allow users to read ONLY their own data
-- (Plus allow anon to read for login check via RPC, but direct select is restricted)
-- Actually, for login RPC to work, we don't need SELECT policy if RPC is SECURITY DEFINER.
-- But for `loadUserProfile` in frontend, we need SELECT.
CREATE POLICY "view_own_profile"
ON students FOR SELECT
TO authenticated
USING (auth.uid() = auth_user_id);

-- INSERT: Allow anon to signup (this is public)
CREATE POLICY "allow_signup"
ON students FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- UPDATE: Allow users to update ONLY their own data
CREATE POLICY "update_own_profile"
ON students FOR UPDATE
TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- SERVICE ROLE: Full access
CREATE POLICY "service_role_full_access"
ON students FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. VERIFY
SELECT policyname, cmd, roles, qual 
FROM pg_policies 
WHERE tablename = 'students';
