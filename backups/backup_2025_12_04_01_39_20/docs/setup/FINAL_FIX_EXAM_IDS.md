# Final Fix - Exam IDs Not Matching

## Problem Identified ✅

From the console logs, I can see:
```
Purchased plans loaded: [{…}]
Checking access for phone 8055115752, exam exam-4: [{…}]
Access result: false
```

**The plan is being retrieved, but `exam_ids` doesn't include `exam-4`.**

This means when you purchased the plan, the wrong exam IDs were saved to the database.

## Root Cause

When a plan is purchased, the system should copy the `subjects` array from `plan_templates` table to `exam_ids` in `user_plans` table. However, the subjects might be:
1. Stored as JSONB in plan_templates
2. Not properly converted to text[] array
3. Empty or in wrong format

## Immediate Fix (Run This SQL)

Run the complete script in `fix-existing-plan-exam-ids.sql` in Supabase SQL Editor.

This will:
- **Fix ALL users' plans** (not just one user)
- Show diagnostic information before and after
- Verify the fix worked
- Provide a summary report

The key update query:
```sql
-- Update ALL user_plans to use the subjects from plan_templates
UPDATE user_plans up
SET exam_ids = (
  SELECT ARRAY(
    SELECT jsonb_array_elements_text(pt.subjects)
  )
  FROM plan_templates pt
  WHERE pt.id = up.plan_template_id
)
WHERE up.plan_template_id IS NOT NULL
  AND up.is_active = true
  AND (up.exam_ids IS NULL OR array_length(up.exam_ids, 1) IS NULL OR array_length(up.exam_ids, 1) = 0);
```

This fixes **all active plans** that have empty exam_ids.

## What This Does

1. Finds your purchased plan
2. Looks up the plan_template it's based on
3. Extracts the subjects from the template (as JSONB)
4. Converts them to a text array
5. Updates your user_plan with the correct exam_ids

## After Running the SQL

1. Refresh your browser
2. Go to any exam (like Biology/exam-4)
3. You should now see "Access Granted"
4. You can start the exam

## Long-term Fix (Already Applied)

I've updated the code to:
1. Better parse subjects when purchasing plans
2. Add detailed logging to show what exam_ids are being saved
3. Add logging to show what exam_ids are being checked

## Verify It Worked

After running the SQL, check in browser console:
```
Checking access for phone 8055115752, exam exam-4: [{…}]
Plan 1: {
  plan_name: "gold",
  exam_ids: ["exam-1", "exam-2", "exam-3", "exam-4", "exam-5"],
  includes_exam: true
}
Access result: true
```

## If It Still Doesn't Work

If some plans don't have a plan_template_id, run this emergency fix to give all users access to all exams:

```sql
-- Emergency: Give all active plans access to all exams
UPDATE user_plans
SET exam_ids = ARRAY['exam-1', 'exam-2', 'exam-3', 'exam-4', 'exam-5']::text[]
WHERE is_active = true
  AND (exam_ids IS NULL OR array_length(exam_ids, 1) IS NULL OR array_length(exam_ids, 1) = 0);
```

This gives **all users with active plans** access to **all 5 exams**.

## Prevention for Future Purchases

The code now:
1. Properly parses subjects whether they're JSON string or array
2. Logs exactly what's being saved
3. Validates the data before saving

Next time you purchase a plan, check the console for:
```
Purchasing plan: {
  subjects: ["exam-1", "exam-2", ...],
  subjects_type: "object" or "string"
}
```

This will show if subjects are being parsed correctly.
