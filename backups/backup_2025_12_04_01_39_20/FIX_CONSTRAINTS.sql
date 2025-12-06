-- FIX FOREIGN KEY CONSTRAINTS

-- 1. Drop existing constraints (both of them to be clean)
ALTER TABLE students DROP CONSTRAINT IF EXISTS "fk_auth_user";
ALTER TABLE students DROP CONSTRAINT IF EXISTS "fk_students_auth_user";

-- 2. Add the correct constraint explicitly referencing auth.users
ALTER TABLE students
ADD CONSTRAINT "fk_auth_user"
FOREIGN KEY (auth_user_id)
REFERENCES auth.users (id)
ON DELETE CASCADE;

-- 3. Verify
SELECT
    conname AS constraint_name,
    confrelid::regclass AS foreign_table_name
FROM
    pg_constraint
WHERE
    conrelid = 'students'::regclass;
