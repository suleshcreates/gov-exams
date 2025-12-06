-- RESET TO PERMISSIVE (Emergency Fix)
-- This script drops all strict security rules and allows the app to work freely.

-- 1. Disable RLS temporarily to clear everything
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies to avoid conflicts
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
DROP POLICY IF EXISTS "Students can view own data" ON students;
DROP POLICY IF EXISTS "Students can insert own data" ON students;
DROP POLICY IF EXISTS "Students can update own data" ON students;

-- 3. Re-enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- 4. Create PERMISSIVE Policies (Allow Everything)

-- Allow SELECT for everyone (needed for login/signup checks)
CREATE POLICY "Enable read access for all users"
ON students FOR SELECT
TO public
USING (true);

-- Allow INSERT for everyone (needed for signup)
CREATE POLICY "Enable insert for all users"
ON students FOR INSERT
TO public
WITH CHECK (true);

-- Allow UPDATE for everyone (needed for profile updates)
CREATE POLICY "Enable update for all users"
ON students FOR UPDATE
TO public
USING (true);

-- Allow DELETE for everyone (if needed)
CREATE POLICY "Enable delete for all users"
ON students FOR DELETE
TO public
USING (true);

-- 5. Grant Permissions (Just in case)
GRANT ALL ON TABLE students TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
