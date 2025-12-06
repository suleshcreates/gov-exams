-- FIX PERMISSIONS & VERIFY

-- 1. Grant permissions to reference auth.users
-- This is often needed for FK constraints to work for anon/authenticated roles
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT REFERENCES ON TABLE auth.users TO anon, authenticated, service_role;

-- 2. Ensure students.auth_user_id is the correct type (UUID)
ALTER TABLE students 
ALTER COLUMN auth_user_id TYPE uuid USING auth_user_id::uuid;

-- 3. Re-apply the constraint just to be absolutely sure
ALTER TABLE students DROP CONSTRAINT IF EXISTS "fk_auth_user";
ALTER TABLE students DROP CONSTRAINT IF EXISTS "fk_students_auth_user";

ALTER TABLE students
ADD CONSTRAINT "fk_auth_user"
FOREIGN KEY (auth_user_id)
REFERENCES auth.users (id)
ON DELETE CASCADE;

-- 4. Check if public.users exists (it shouldn't, usually)
SELECT count(*) as public_users_count 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users';
