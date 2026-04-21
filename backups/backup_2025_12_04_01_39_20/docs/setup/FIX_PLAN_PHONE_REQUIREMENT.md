# Fix Plan Access - Phone Number Requirement

## Problem
Users who purchased plans weren't getting access to exams because:
1. Google OAuth users might not have a phone number in their profile
2. The system requires a phone number to link plan purchases to users
3. No validation was checking if phone exists before purchase
4. Access checks were failing silently when phone was null

## Root Cause
The entire plan and exam access system is built around `student_phone` as the primary identifier:
- `user_plans` table uses `student_phone` to link purchases to users
- `exam_progress` uses `student_phone` to track progress
- `exam_results` uses `student_phone` to store results
- All RLS policies check access based on `student_phone`

However, users who sign up with Google OAuth don't have a phone number until they complete their profile.

## Solution Implemented

### 1. Added Phone Number Validation in Plans.tsx
Before allowing plan purchase, check if user has a phone number:

```typescript
// Check if user has completed profile (phone number required)
if (!auth.user.phone) {
  toast({
    title: "Profile Incomplete",
    description: "Please complete your profile by adding a phone number before purchasing a plan.",
    variant: "destructive",
  });
  navigate("/profile");
  return;
}
```

### 2. Added Logging for Debugging
Added console.log statements to track:
- Plan purchase data
- Purchased plans loading
- Access checks

### 3. Updated planUtils.ts to Handle Null Phone
All functions now accept `string | null` for phone and return early if null:

```typescript
async hasExamAccess(studentPhone: string | null, examId: string): Promise<boolean> {
  if (!studentPhone) {
    console.log('No phone number provided, access denied');
    return false;
  }
  // ... rest of logic
}
```

### 4. Added Safety Check in Plans Loading
Only attempt to load purchased plans if phone exists:

```typescript
if (!auth.isAuthenticated || !auth.user || !auth.user.phone) return;
```

## How It Works Now

### For New Users (Google OAuth)
1. User signs up with Google
2. User is redirected to complete profile (add phone number)
3. Once phone is added, user can purchase plans
4. Plans are linked to their phone number
5. Access checks work correctly

### For Existing Users (Phone Auth)
1. User already has phone number
2. Can purchase plans immediately
3. Everything works as before

## Testing Steps

1. **Test with Google OAuth user without phone:**
   - Sign up with Google
   - Try to purchase a plan
   - Should see "Profile Incomplete" message
   - Should be redirected to profile page

2. **Test with Google OAuth user with phone:**
   - Sign up with Google
   - Complete profile (add phone)
   - Purchase a plan
   - Verify plan shows as "Purchased"
   - Navigate to exam details
   - Should see "Access Granted"
   - Should be able to start exam

3. **Test with phone auth user:**
   - Login with phone
   - Purchase a plan
   - Verify access works immediately

## Database Verification

To check if a plan purchase was saved correctly:

```sql
-- Check user_plans table
SELECT 
  student_phone,
  student_name,
  plan_id,
  plan_template_id,
  plan_name,
  exam_ids,
  is_active,
  expires_at,
  purchased_at
FROM user_plans
WHERE student_phone = '8055115752'
ORDER BY purchased_at DESC;

-- Check if exam_ids are stored correctly
SELECT 
  plan_name,
  exam_ids,
  array_length(exam_ids, 1) as subject_count
FROM user_plans
WHERE student_phone = '8055115752';
```

## Common Issues and Solutions

### Issue: Plan purchased but no access
**Check:**
1. Is phone number set in user profile?
2. Is plan saved in user_plans table?
3. Are exam_ids stored correctly as an array?
4. Is plan still active (not expired)?

**Debug:**
```typescript
// In browser console
const phone = '8055115752'; // your phone
const examId = 'exam-1'; // exam you're trying to access

// Check plans
const plans = await supabaseService.getActiveStudentPlans(phone);
console.log('Active plans:', plans);

// Check access
const hasAccess = await planUtils.hasExamAccess(phone, examId);
console.log('Has access:', hasAccess);
```

### Issue: "Profile Incomplete" message
**Solution:** User needs to add phone number in profile page

### Issue: RLS 406 errors
**Solution:** Run the `supabase-fix-406-errors.sql` script

## Next Steps

Consider these improvements:
1. Add a profile completion banner for users without phone
2. Show phone requirement on plans page
3. Add email-based access as alternative to phone
4. Migrate existing system to use auth_user_id instead of phone
