-- Cleanup test users and start fresh
-- Run this in Supabase SQL Editor

-- Delete test student records
DELETE FROM students WHERE email = 'suleshwaghmare7875@gmail.com';
DELETE FROM students WHERE username = 'sulesh';

-- You also need to delete from Supabase Auth
-- Go to: Authentication → Users in Supabase Dashboard
-- Find and delete: suleshwaghmare7875@gmail.com

-- After running this, you can sign up fresh!
