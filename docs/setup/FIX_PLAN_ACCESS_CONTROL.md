# Fix Plan Access Control Issue

## Problem
When a user purchases a plan that should only give access to 4 subjects, they're getting access to all 5 subjects instead. The plan access control is not working correctly.

## Root Cause
The issue is that `exam_ids` stored in the `student_plans` table contain subject UUIDs from the database instead of the frontend exam IDs (`exam-1`, `exam-2`, etc.). When the access check runs, it's comparing UUIDs against exam IDs, which never match, so either:
1. All exams are being granted access by default, OR
2. The mapping from subject UUIDs to exam IDs is failing

## Solution

### 1. Database Fix
Run `fix-plan-access-control.sql` in your Supabase SQL Editor. This script:
- Creates a mapping function to convert subject UUIDs to exam IDs
- Updates all existing `student_plans` records to use correct exam IDs
- Verifies the fix by showing the updated records

### 2. Code Fix
Updated `src/lib/subjectMapping.ts` to:
- Include DMLT-specific subject mappings (Anatomy, Physiology, Biochemistry, Microbiology, Pathology)
- Add case-insensitive partial matching for subject names
- Better logging to debug mapping issues

## Subject to Exam ID Mapping

| Subject Name | Exam ID | Frontend Title |
|--------------|---------|----------------|
| Mathematics / Anatomy | exam-1 | Mathematics |
| Physics / Physiology | exam-2 | Physics |
| Chemistry / Biochemistry | exam-3 | Chemistry |
| Biology / Microbiology | exam-4 | Biology |
| General Knowledge / Pathology | exam-5 | General Knowledge |

## Testing Steps

### 1. Run the Database Fix
```sql
-- Execute fix-plan-access-control.sql in Supabase SQL Editor
```

### 2. Run Diagnostic Query
```sql
-- Check what exam_ids are stored for your user
SELECT 
  student_phone,
  plan_name,
  exam_ids,
  jsonb_array_length(exam_ids) as num_exams
FROM student_plans
WHERE student_phone = 'YOUR_PHONE_NUMBER'
  AND is_active = true;
```

Expected result: `exam_ids` should contain values like `["exam-1", "exam-2", "exam-3", "exam-4"]`

### 3. Test in Browser
1. Clear browser cache and reload
2. Sign in with your account
3. Go to Home page
4. Try to access each subject
5. Verify that:
   - Subjects in your plan are accessible
   - Subjects NOT in your plan show "Plan Required" message

### 4. Check Console Logs
Open browser console and look for these logs:
```
[ExamDetails] Checking access for: { phone: "...", examId: "exam-1", examTitle: "..." }
[ExamDetails] Access result: true/false
```

## Troubleshooting

### If access still grants all subjects:

1. **Check exam_ids format:**
```sql
SELECT exam_ids FROM student_plans WHERE student_phone = 'YOUR_PHONE';
```
Should show: `["exam-1", "exam-2", ...]` NOT UUIDs

2. **Check if mapping function exists:**
```sql
SELECT proname FROM pg_proc WHERE proname = 'map_subjects_to_exam_ids';
```

3. **Manually fix a specific plan:**
```sql
UPDATE student_plans
SET exam_ids = '["exam-1", "exam-2", "exam-3", "exam-4"]'::jsonb
WHERE student_phone = 'YOUR_PHONE'
  AND id = 'PLAN_ID';
```

### If access denies all subjects:

1. **Check if plans are active:**
```sql
SELECT 
  is_active,
  expires_at,
  expires_at > NOW() as not_expired
FROM student_plans
WHERE student_phone = 'YOUR_PHONE';
```

2. **Check browser console for errors:**
Look for errors in `planUtils.hasExamAccess()`

3. **Verify phone number matches:**
```sql
SELECT student_phone FROM student_plans WHERE student_phone LIKE '%YOUR_PHONE%';
```

## Files Modified
- ✅ `src/lib/subjectMapping.ts` - Added DMLT subject mappings and case-insensitive matching
- ✅ `fix-plan-access-control.sql` - Database fix script (NEW)
- ✅ `diagnose-plan-access.sql` - Diagnostic queries (NEW)
- ✅ `FIX_PLAN_ACCESS_CONTROL.md` - This documentation (NEW)

## Expected Behavior After Fix

### User with 4-Subject Plan
- ✅ Can access 4 subjects included in their plan
- ❌ Cannot access the 5th subject (shows "Plan Required")
- ✅ Sees correct plan details in Profile page

### User with 5-Subject Plan (Master Plan)
- ✅ Can access all 5 subjects
- ✅ Sees "Master Plan" or equivalent in Profile

### User with No Plan
- ❌ Cannot access any subjects
- ✅ Redirected to Plans page when trying to access exams

## Next Steps

1. Run `fix-plan-access-control.sql` in Supabase
2. Test with your account
3. If issues persist, run `diagnose-plan-access.sql` and share the results
4. Check browser console logs for detailed debugging information
