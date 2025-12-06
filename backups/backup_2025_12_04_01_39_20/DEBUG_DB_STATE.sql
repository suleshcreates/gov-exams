-- DEBUG DB STATE

-- 1. Check students table columns and types
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'students' AND column_name = 'auth_user_id';

-- 2. Check constraints on students table
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'students'::regclass;

-- 3. Check if user exists in auth.users
SELECT id, email, created_at
FROM auth.users
WHERE email = 'suleshwaghmare7875@gmail.com';
