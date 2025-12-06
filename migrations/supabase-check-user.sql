-- Check if user exists and is properly set up
-- Replace with your actual email

-- Check in students table
SELECT email, username, name, email_verified, auth_user_id 
FROM students 
WHERE email = 'suleshwaghmare2004@gmail.com';

-- Check in auth.users table
SELECT id, email, email_confirmed_at, confirmed_at 
FROM auth.users 
WHERE email = 'suleshwaghmare2004@gmail.com';

-- Check if they're linked
SELECT 
    s.email,
    s.username,
    s.email_verified as student_verified,
    u.email_confirmed_at as auth_confirmed,
    s.auth_user_id,
    u.id as auth_id
FROM students s
LEFT JOIN auth.users u ON s.auth_user_id = u.id
WHERE s.email = 'suleshwaghmare2004@gmail.com';
