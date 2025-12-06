# Simple Manual Fix - Step by Step

## The Problem
- Admin panel stores subject UUIDs in plan_templates
- Frontend expects exam IDs (exam-1, exam-2, etc.)
- Need to map: UUID → exam ID based on subject name

## Solution: Update Admin Panel Code

Instead of fixing the database repeatedly, let's fix the code so it works automatically.

### Fix 1: Update Plans.tsx to map UUIDs when purchasing

In `src/pages/Plans.tsx`, when a user purchases a plan, map the UUIDs to exam IDs:

```typescript
// In handlePlanPurchase function, after parsing subjects:
const subjects = Array.isArray(plan.subjects) ? plan.subjects : JSON.parse(plan.subjects || '[]');

// Map subject UUIDs to exam IDs
const examIds = await mapSubjectUUIDsToExamIds(subjects);

// Then use examIds instead of subjects when saving
await supabaseService.savePlanPurchase({
  student_phone: auth.user.phone,
  student_name: auth.user.name,
  plan_id: plan.id,
  plan_name: plan.name,
  price_paid: plan.price,
  exam_ids: examIds,  // Use mapped exam IDs
  expires_at: expiresAt,
});
```

### Fix 2: Create mapping function

Add this function to map UUIDs to exam IDs:

```typescript
// Add to src/lib/subjectMapping.ts
import { supabase } from './supabase';

const SUBJECT_TO_EXAM_MAP: Record<string, string> = {
  'Mathematics': 'exam-1',
  'Physics': 'exam-2',
  'Chemistry': 'exam-3',
  'Biology': 'exam-4',
  'General Knowledge': 'exam-5'
};

export async function mapSubjectUUIDsToExamIds(subjectUUIDs: string[]): Promise<string[]> {
  // Fetch subject names from database
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .in('id', subjectUUIDs);
  
  if (!subjects) return [];
  
  // Map to exam IDs
  return subjects.map(subject => 
    SUBJECT_TO_EXAM_MAP[subject.name] || subject.name
  );
}
```

### Fix 3: Quick Database Fix for Existing Users

Run this simple SQL to fix existing users based on what we know:

```sql
-- Get the subject UUIDs and their names
SELECT id, name FROM subjects;

-- Manually update based on the UUIDs you see
-- Replace the UUIDs below with actual ones from your database

UPDATE user_plans
SET exam_ids = '["exam-1", "exam-2", "exam-3", "exam-4"]'::jsonb
WHERE student_phone = '8365367263';

-- Repeat for other users as needed
```

## Immediate Action

Since SQL is complex, let me give you the code fix that will work going forward.

The key insight: **Fix it in the application code, not the database**.

When a plan is purchased, the code should:
1. Get the subject UUIDs from plan_template
2. Look up the subject names
3. Map names to exam IDs
4. Store exam IDs in user_plans

This way it works automatically for all future purchases!
