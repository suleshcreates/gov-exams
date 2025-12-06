-- Update BOTH verification columns to be safe
-- Replace with your actual email

UPDATE students 
SET email_verified = true,
    is_verified = true
WHERE phone IS NULL 
AND email = 'suleshwaghmare7875@gmail.com';

-- Verify
SELECT email, username, email_verified, is_verified, auth_user_id 
FROM students 
WHERE email = 'suleshwaghmare7875@gmail.com';
