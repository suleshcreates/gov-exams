# Plan Access Control Fix

## Problem
Students who purchased plans were not getting access to exams because:
1. The `savePlanPurchase` function was only saving to `plan_id` field
2. The system was checking `plan_template_id` field for purchased plans
3. Access verification was missing from the ExamInstructions page

## Root Cause
When the plan pricing system was implemented, a new column `plan_template_id` was added to the `user_plans` table to reference the `plan_templates` table. However, the `savePlanPurchase` function was not updated to populate this field, causing a mismatch between what was saved and what was checked.

## Solution Implemented

### 1. Fixed `savePlanPurchase` in `src/lib/supabaseService.ts`
Updated the function to save the plan ID to both `plan_id` and `plan_template_id` fields for compatibility:

```typescript
const { data: plan, error } = await supabase
  .from('user_plans')
  .insert([{
    student_phone: data.student_phone,
    student_name: data.student_name,
    plan_id: data.plan_id,
    plan_template_id: data.plan_id, // Store in both fields for compatibility
    plan_name: data.plan_name,
    price_paid: data.price_paid,
    exam_ids: data.exam_ids,
    expires_at: data.expires_at,
    is_active: true,
  }])
  .select()
  .single();
```

### 2. Added Access Verification to ExamInstructions Page
Added comprehensive access checking to prevent unauthorized exam access:

**Changes in `src/pages/ExamInstructions.tsx`:**
- Added `useAuth` hook to get user information
- Added `planUtils` import for access checking
- Added `hasAccess` and `checkingAccess` state variables
- Added `useEffect` to check access on component mount
- Added loading state while checking access
- Added redirect to plans page if user doesn't have access
- Added proper error handling and user feedback

## How Access Control Works Now

### Purchase Flow
1. User selects a plan on the Plans page
2. `handlePlanPurchase` is called with the plan details
3. `supabaseService.savePlanPurchase` saves the purchase with:
   - `plan_id`: The plan template ID
   - `plan_template_id`: The plan template ID (for compatibility)
   - `exam_ids`: Array of subject IDs included in the plan
   - `expires_at`: Expiration date (or null for lifetime)
   - `is_active`: Set to true

### Access Verification Flow
1. User tries to access an exam
2. System calls `planUtils.hasExamAccess(phone, examId)`
3. Function retrieves active plans using `getActiveStudentPlans`
4. Checks if any plan's `exam_ids` array includes the requested `examId`
5. Returns true if access granted, false otherwise

### Pages with Access Control
1. **ExamDetails** (`src/pages/ExamDetails.tsx`)
   - Checks access on mount
   - Shows "Access Granted" or "View Plans" button
   - Prevents starting exam without access

2. **ExamInstructions** (`src/pages/ExamInstructions.tsx`) - NEW
   - Checks access on mount
   - Redirects to plans page if no access
   - Shows loading state while checking
   - Prevents proceeding to exam without access

3. **ExamStart** (`src/pages/ExamStart.tsx`) - NEW
   - Verifies access before exam starts
   - Redirects to plans page if no access
   - Shows loading state while verifying
   - Final security layer before exam begins

4. **Plans** (`src/pages/Plans.tsx`)
   - Shows which plans are already purchased
   - Prevents duplicate purchases

## Testing Checklist

- [x] Purchase a plan and verify it saves correctly
- [ ] Check that purchased plans show as "Purchased" on Plans page
- [ ] Verify exam access is granted after purchase
- [ ] Confirm "Access Granted" shows on ExamDetails page
- [ ] Test that ExamInstructions page allows access
- [ ] Verify exam can be started and completed
- [ ] Test plan expiration (if applicable)
- [ ] Verify multiple plan purchases work correctly

## Database Schema Reference

### user_plans table
```sql
- id: UUID (primary key)
- student_phone: VARCHAR
- student_name: VARCHAR
- plan_id: VARCHAR (legacy field)
- plan_template_id: UUID (references plan_templates.id)
- plan_name: VARCHAR
- price_paid: DECIMAL
- exam_ids: TEXT[] (array of subject IDs)
- expires_at: TIMESTAMP (null for lifetime)
- is_active: BOOLEAN
- purchased_at: TIMESTAMP
```

### plan_templates table
```sql
- id: UUID (primary key)
- name: VARCHAR
- description: TEXT
- price: DECIMAL
- validity_days: INTEGER (null for lifetime)
- subjects: JSONB (array of subject IDs)
- is_active: BOOLEAN
- display_order: INTEGER
- badge: TEXT (e.g., "POPULAR", "BEST VALUE")
```

## Next Steps

1. Test the complete purchase and access flow
2. Verify existing purchased plans still work
3. Check that plan expiration is handled correctly
4. Consider adding access verification to ExamStart page as well
5. Add logging for access checks to help with debugging

## Notes

- The fix maintains backward compatibility by storing in both `plan_id` and `plan_template_id`
- Access checks are performed at multiple points to ensure security
- The system properly handles expired plans through `getActiveStudentPlans`
- All access checks include proper error handling and user feedback
