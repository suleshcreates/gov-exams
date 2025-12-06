-- Fix the foreign key constraint to reference auth.users correctly
-- Run this in Supabase SQL Editor

-- Drop the incorrect foreign key constraint
ALTER TABLE students DROP CONSTRAINT IF EXISTS fk_auth_user;

-- Add the correct foreign key constraint referencing auth.users
ALTER TABLE students 
ADD CONSTRAINT fk_auth_user 
FOREIGN KEY (auth_user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Verify the constraint
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'students'
    AND kcu.column_name = 'auth_user_id';
