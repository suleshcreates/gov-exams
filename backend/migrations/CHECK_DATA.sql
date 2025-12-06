-- Quick check: Do we have any data?
SELECT 'Students' as table_name, COUNT(*) as row_count FROM students
UNION ALL
SELECT 'User Plans', COUNT(*) FROM user_plans
UNION ALL
SELECT 'Exam Results', COUNT(*) FROM exam_results
UNION ALL
SELECT 'Subjects', COUNT(*) FROM subjects
UNION ALL
SELECT 'Questions', COUNT(*) FROM questions;

-- If zeros, then database is empty (that's why dashboard shows zeros)
-- If non-zero, then it's a frontend/query issue
