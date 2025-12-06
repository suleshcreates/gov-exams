-- Check current status
SELECT email, username, email_verified, is_verified, auth_user_id 
FROM students 
WHERE email = 'suleshwaghmare2004@gmail.com';

-- Update verification status for suleshwaghmare2004@gmail.com
UPDATE students 
SET email_verified = true,
    is_verified = true
WHERE email = 'suleshwaghmare2004@gmail.com';

-- Verify the update
SELECT email, username, email_verified, is_verified, auth_user_id 
FROM students 
WHERE email = 'suleshwaghmare2004@gmail.com';
