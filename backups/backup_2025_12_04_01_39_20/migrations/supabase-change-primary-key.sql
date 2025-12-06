-- Change Primary Key from phone to email
-- Run this in Supabase SQL Editor

-- Step 1: Drop all foreign key constraints that reference students(phone)
ALTER TABLE exam_results DROP CONSTRAINT IF EXISTS exam_results_student_phone_fkey;
ALTER TABLE exam_progress DROP CONSTRAINT IF EXISTS exam_progress_student_phone_fkey;
ALTER TABLE user_plans DROP CONSTRAINT IF EXISTS user_plans_student_phone_fkey;

-- Step 2: Drop the primary key constraint on phone
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_pkey;

-- Step 3: Make phone nullable
ALTER TABLE students ALTER COLUMN phone DROP NOT NULL;

-- Step 4: Add new primary key on email
ALTER TABLE students ADD PRIMARY KEY (email);

-- Step 5: Add unique constraint on username
ALTER TABLE students ADD CONSTRAINT students_username_unique UNIQUE (username);

-- Step 6: Recreate foreign keys using email instead of phone
-- (We'll add these later after updating the application code)

-- Step 7: Make sure email and username are NOT NULL
ALTER TABLE students ALTER COLUMN email SET NOT NULL;
ALTER TABLE students ALTER COLUMN username SET NOT NULL;

-- Step 8: Add a unique index on auth_user_id if not exists
CREATE UNIQUE INDEX IF NOT EXISTS students_auth_user_id_unique ON students(auth_user_id);

-- Verification: Check the new structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'students'
ORDER BY ordinal_position;
