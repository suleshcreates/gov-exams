# JSONB Fix Summary

## Issue Discovered
The `exam_ids` column in `user_plans` table is stored as **JSONB**, not as a text array (`text[]`).

This is why the SQL was failing with:
```
ERROR: function array_length(jsonb, integer) does not exist
```

## Solution
Updated the SQL script to use JSONB functions instead of array functions:

### Before (Wrong - for text[]):
```sql
array_length(exam_ids, 1)
exam_ids @> ARRAY['exam-1']::text[]
```

### After (Correct - for JSONB):
```sql
jsonb_array_length(exam_ids)
exam_ids ? 'exam-1'
```

## Fixed SQL Script
The `fix-existing-plan-exam-ids.sql` now:

1. **Checks data type** first to confirm JSONB
2. **Uses JSONB functions** throughout
3. **Copies JSONB directly** from plan_templates to user_plans
4. **Tests access** using JSONB operators

## Key Update Query
```sql
UPDATE user_plans up
SET exam_ids = pt.subjects
FROM plan_templates pt
WHERE pt.id = up.plan_template_id
  AND up.is_active = true
  AND (
    up.exam_ids IS NULL 
    OR jsonb_typeof(up.exam_ids) != 'array'
    OR jsonb_array_length(up.exam_ids) = 0
  );
```

This directly copies the JSONB `subjects` from `plan_templates` to `exam_ids` in `user_plans`.

## Run the Script
Now you can run `fix-existing-plan-exam-ids.sql` in Supabase SQL Editor without errors!

It will:
- Show data types
- Diagnose the problem
- Fix ALL users' plans
- Verify the fix
- Show access for each exam
- Provide summary report
