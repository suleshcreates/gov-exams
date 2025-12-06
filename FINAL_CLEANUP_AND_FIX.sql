-- FINAL CLEANUP & FIX
-- This script removes ALL existing policies and applies the correct ones.

-- 1. DROP ALL POSSIBLE EXISTING POLICIES (to be safe)
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

-- 2. ENABLE RLS (Ensure it's on)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- 3. CREATE THE CORRECT POLICIES

-- Allow anyone (anon/authenticated) to READ students (needed for login check)
CREATE POLICY "allow_select"
ON students FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anyone to INSERT (needed for signup)
CREATE POLICY "allow_insert"
ON students FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to UPDATE (needed for password reset)
CREATE POLICY "allow_update"
ON students FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow Service Role (Admin/Backend) full access
CREATE POLICY "service_role_all"
ON students FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. VERIFY
SELECT policyname, cmd, roles, qual 
FROM pg_policies 
WHERE tablename = 'students';
