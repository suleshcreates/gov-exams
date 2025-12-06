-- INSPECT STUDENTS TABLE SCHEMA
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'students';
