-- Make phone column nullable
-- Run this in Supabase SQL Editor

-- Make phone column nullable (it's no longer required)
ALTER TABLE students ALTER COLUMN phone DROP NOT NULL;

-- Set a default value for existing records without phone
UPDATE students 
SET phone = NULL 
WHERE phone = '';

-- Also make sure email and username are properly set
ALTER TABLE students ALTER COLUMN email DROP NOT NULL;
ALTER TABLE students ALTER COLUMN username DROP NOT NULL;

-- Add default empty string for password_hash if needed
UPDATE students 
SET password_hash = '' 
WHERE password_hash IS NULL;
