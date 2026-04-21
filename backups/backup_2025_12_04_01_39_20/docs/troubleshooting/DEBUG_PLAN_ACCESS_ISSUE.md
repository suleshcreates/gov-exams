# Debug Plan Access Issue - Step by Step Guide

## Current Situation
User has purchased a plan but still sees "Purchase Plan to Access" message when trying to access exams.

## Debugging Steps

### Step 1: Check Browser Console
I've added detailed logging. Open browser console (F12) and look for these logs:

1. **When loading Plans page:**
   ```
   Loading purchased plans for phone: [phone_number]
   Purchased plans loaded: [array of plans]
   ```

2. **When purchasing a plan:**
   ```
   Purchasing plan: {plan_id, plan_name, subjects, student_phone, student_name}
   Plan purchase saved: [result]
   ```

3. **When accessing ExamDetails:**
   ```
   [ExamDetails] Checking access for: {phone, examId, examTitle}
   [getActiveStudentPlans] Fetching plans for phone: [phone]
   [getActiveStudentPlans] Plans retrieved: [plans array]
   Checking access for phone [phone], exam [examId]: [plans]
   Access result: true/false
   [ExamDetails] Access result: true/false
   ```

### Step 2: Run SQL Diagnostic
Run the SQL in `diagnose-plan-data.sql` in Supabase SQL Editor.

**Replace `'8055115752'` with your actual phone number!**

This will show you:
1. What plan templates exist
2. What plans you've purchased
3. What exam_ids are stored
4. The data types of the fields

### Step 3: Run JavaScript Diagnostic
1. Open browser console (F12)
2. Make sure you're logged in
3. Copy and paste the entire content of `debug-plan-access.js`
4. Press Enter
5. Review the output

### Step 4: Common Issues and Fixes

#### Issue 1: exam_ids is empty or wrong format
**Symptoms:** Plans exist but exam_ids is `[]` or `null`

**Check in SQL:**
```sql
SELECT plan_name, exam_ids, array_length(exam_ids, 1) as count
FROM user_plans
WHERE student_phone = 'YOUR_PHONE';
```

**Fix:** The plan template's subjects field might be wrong. Check:
```sql
SELECT name, subjects FROM plan_templates WHERE is_active = true;
```

The subjects should be an array like: `["exam-1", "exam-2", "exam-3"]`

#### Issue 2: Phone number mismatch
**Symptoms:** No plans found for user

**Check:**
```sql
-- Check what phone is in students table
SELECT phone, email, name FROM students WHERE email = 'YOUR_EMAIL';

-- Check what phone is in user_plans
SELECT DISTINCT student_phone FROM user_plans;
```

**Fix:** If phones don't match, update user_plans:
```sql
UPDATE user_plans 
SET student_phone = 'CORRECT_PHONE'
WHERE student_phone = 'WRONG_PHONE';
```

#### Issue 3: RLS blocking access
**Symptoms:** 406 errors in console

**Fix:** Run `supabase-fix-406-errors.sql`

#### Issue 4: Plan expired or inactive
**Check:**
```sql
SELECT 
  plan_name,
  is_active,
  expires_at,
  CASE 
    WHEN expires_at IS NULL THEN 'Never expires'
    WHEN expires_at > NOW() THEN 'Active'
    ELSE 'Expired'
  END as status
FROM user_plans
WHERE student_phone = 'YOUR_PHONE';
```

**Fix:** If expired, extend or reactivate:
```sql
UPDATE user_plans
SET expires_at = NOW() + INTERVAL '30 days'
WHERE id = 'PLAN_ID';
```

#### Issue 5: exam_ids stored as string instead of array
**Symptoms:** exam_ids looks like `"{exam-1,exam-2}"` instead of `["exam-1", "exam-2"]`

**Check:**
```sql
SELECT 
  plan_name,
  exam_ids,
  pg_typeof(exam_ids) as type
FROM user_plans
WHERE student_phone = 'YOUR_PHONE';
```

Should show type as `text[]` not `text`

**Fix:** Convert string to array:
```sql
UPDATE user_plans
SET exam_ids = string_to_array(trim(both '{}' from exam_ids::text), ',')
WHERE pg_typeof(exam_ids) != 'text[]'::regtype;
```

### Step 5: Manual Access Grant (Temporary Fix)
If you need immediate access while debugging:

```sql
-- Find your phone
SELECT phone FROM students WHERE email = 'YOUR_EMAIL';

-- Insert a plan manually
INSERT INTO user_plans (
  student_phone,
  student_name,
  plan_id,
  plan_template_id,
  plan_name,
  price_paid,
  exam_ids,
  is_active,
  expires_at
) VALUES (
  'YOUR_PHONE',
  'YOUR_NAME',
  'manual-grant',
  (SELECT id FROM plan_templates WHERE is_active = true LIMIT 1),
  'Manual Access Grant',
  0,
  ARRAY['exam-1', 'exam-2', 'exam-3', 'exam-4', 'exam-5']::text[],
  true,
  NULL  -- NULL = never expires
);
```

## What to Share for Help

If you need help, share these console logs:
1. The output from `debug-plan-access.js`
2. The results from `diagnose-plan-data.sql`
3. Any error messages from browser console
4. Screenshot of the Plans page showing "Purchased" status

## Expected Correct Data

### In plan_templates:
```json
{
  "id": "uuid",
  "name": "Basic Plan",
  "subjects": ["exam-1", "exam-2"],  // Array of exam IDs
  "is_active": true
}
```

### In user_plans:
```json
{
  "student_phone": "8055115752",
  "plan_id": "uuid",
  "plan_template_id": "uuid",
  "exam_ids": ["exam-1", "exam-2"],  // Array of exam IDs
  "is_active": true,
  "expires_at": null  // or future date
}
```

### Access Check Logic:
```javascript
// For exam-1 to be accessible:
1. user_plans.student_phone must match auth.user.phone
2. user_plans.is_active must be true
3. user_plans.expires_at must be null OR in the future
4. user_plans.exam_ids must include "exam-1"
```

## Next Steps After Debugging

Once you've identified the issue:
1. Fix the root cause (data format, RLS, etc.)
2. Test plan purchase flow again
3. Verify access works for all exams in the plan
4. Document what was wrong for future reference
