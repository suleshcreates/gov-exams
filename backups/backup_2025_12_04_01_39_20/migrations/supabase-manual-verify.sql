-- Manually verify a user (for testing)
-- Replace the email with your actual email

-- Update student record
UPDATE students 
SET email_verified = true 
WHERE email = 'suleshwaghmare7875@gmail.com';

-- Update auth user to mark as confirmed
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'suleshwaghmare7875@gmail.com';

-- Verify it worked
SELECT email, username, email_verified FROM students WHERE email = 'suleshwaghmare7875@gmail.com';
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'suleshwaghmare7875@gmail.com';
