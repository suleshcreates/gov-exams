-- Fix verification status for your user
-- Replace with your actual email

-- Update the student record to mark as verified
UPDATE students 
SET email_verified = true,
    is_verified = true
WHERE email = 'suleshwaghmare7875@gmail.com';

-- Also make sure auth user is confirmed
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'suleshwaghmare7875@gmail.com';

-- Verify it worked
SELECT email, username, email_verified, is_verified 
FROM students 
WHERE email = 'suleshwaghmare7875@gmail.com';
