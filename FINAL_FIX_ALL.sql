-- FINAL FIX ALL (Run this one script to fix everything)

-- 1. DROP EVERYTHING (Dependencies first)
DROP POLICY IF EXISTS "view_own_profile" ON students;
DROP POLICY IF EXISTS "update_own_profile" ON students;
DROP POLICY IF EXISTS "allow_signup" ON students;
DROP POLICY IF EXISTS "service_role_full_access" ON students;
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

ALTER TABLE students DROP CONSTRAINT IF EXISTS "fk_auth_user";
ALTER TABLE students DROP CONSTRAINT IF EXISTS "fk_students_auth_user";

-- 2. GRANT PERMISSIONS (Crucial for Signup)
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT REFERENCES ON TABLE auth.users TO anon, authenticated, service_role;

-- 3. FIX COLUMN TYPE (Safe now that policies are gone)
ALTER TABLE students 
ALTER COLUMN auth_user_id TYPE uuid USING auth_user_id::uuid;

-- 4. ADD CONSTRAINT (Pointing to correct table)
ALTER TABLE students
ADD CONSTRAINT "fk_auth_user"
FOREIGN KEY (auth_user_id)
REFERENCES auth.users (id)
ON DELETE CASCADE;

-- 5. RE-APPLY SECURE POLICIES
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- SELECT: Allow users to read ONLY their own data
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

-- 6. VERIFY
SELECT policyname, cmd, roles, qual 
FROM pg_policies 
WHERE tablename = 'students';
