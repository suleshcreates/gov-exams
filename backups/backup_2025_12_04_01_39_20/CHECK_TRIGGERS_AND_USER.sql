-- CHECK TRIGGERS AND USER EXISTENCE

-- 1. Check for Triggers on students table
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM 
    information_schema.triggers
WHERE 
    event_object_table = 'students';

-- 2. Check if the user exists in auth.users
-- Replace with the email you tried to sign up with
SELECT * FROM auth.users WHERE email = 'suleshwaghmare7875@gmail.com';

-- 3. Check if the user exists in public.users (just in case)
-- SELECT * FROM public.users WHERE email = 'suleshwaghmare7875@gmail.com';
