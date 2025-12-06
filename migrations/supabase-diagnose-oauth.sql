-- Diagnostic Script for Google OAuth Issues
-- Run this to check the current state of your database

-- 1. Check if students table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;

-- 2. Check current RLS policies on students table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'students';

-- 3. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'students';

-- 4. Check recent students (last 5)
SELECT 
    auth_user_id,
    email,
    username,
    phone,
    name,
    email_verified,
    is_verified,
    created_at
FROM students
ORDER BY created_at DESC
LIMIT 5;

-- 5. Check if trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 6. Check trigger function
SELECT 
    proname as function_name,
    prosrc as function_code
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 7. Check for duplicate usernames or phones
SELECT 
    username,
    COUNT(*) as count
FROM students
WHERE username IS NOT NULL
GROUP BY username
HAVING COUNT(*) > 1;

SELECT 
    phone,
    COUNT(*) as count
FROM students
WHERE phone IS NOT NULL
GROUP BY phone
HAVING COUNT(*) > 1;

-- 8. Check auth.users table (recent users)
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 9. Check for orphaned auth users (users without student records)
SELECT 
    u.id,
    u.email,
    u.created_at
FROM auth.users u
LEFT JOIN students s ON u.id = s.auth_user_id
WHERE s.auth_user_id IS NULL
ORDER BY u.created_at DESC
LIMIT 5;
