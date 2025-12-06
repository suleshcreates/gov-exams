-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'students'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'students'
  AND schemaname = 'public';

-- Check if there are any students with email
SELECT COUNT(*) as total_students,
       COUNT(email) as students_with_email,
       COUNT(username) as students_with_username
FROM students;

-- Try to find the specific student
SELECT email, username, name, email_verified, is_verified, auth_user_id
FROM students
WHERE email = 'suleshwaghmare2004@gmail.com';

-- Check for any NULL or problematic data
SELECT email, username, name, email_verified, is_verified
FROM students
WHERE email IS NOT NULL
LIMIT 5;
