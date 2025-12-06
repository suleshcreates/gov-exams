-- ============================================
-- FIX SESSION FOREIGN KEY CONSTRAINT
-- Change from auth.users to students table
-- ============================================

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE sessions 
  DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;

-- Step 2: Ensure students.auth_user_id has UNIQUE constraint (required for FK)
ALTER TABLE students 
  ADD CONSTRAINT students_auth_user_id_unique 
  UNIQUE (auth_user_id);

-- Step 3: Add new foreign key constraint to students.auth_user_id
ALTER TABLE sessions
  ADD CONSTRAINT sessions_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES students(auth_user_id) 
  ON DELETE CASCADE;

-- Step 3: Verify the new constraint
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'sessions';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE ' ✅ Foreign key constraint updated successfully!';
  RAISE NOTICE 'sessions.user_id now references students.auth_user_id';
  RAISE NOTICE '';
END $$;
