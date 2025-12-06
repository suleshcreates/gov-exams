-- Check the actual schema of tables to understand column names

-- Check exam_results table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'exam_results'
ORDER BY ordinal_position;

-- Check user_plans table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_plans'
ORDER BY ordinal_position;

-- Check students table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;
