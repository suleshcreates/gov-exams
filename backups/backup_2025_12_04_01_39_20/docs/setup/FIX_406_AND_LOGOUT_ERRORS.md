# Fix 406 Errors and Logout Function Issue

## Issues Fixed

### 1. Logout Function Error
**Error:** `Uncaught TypeError: logout is not a function`

**Root Cause:** 
The Navbar component was trying to call `logout()` but the AuthContext exports `signOut()` instead.

**Fix Applied:**
Updated `src/components/Navbar.tsx` to use the correct function name:
```typescript
// Before
const { auth, logout } = useAuth();
const onLogout = () => { logout(); window.location.href = "/login"; };

// After
const { auth, signOut } = useAuth();
const onLogout = async () => { 
  await signOut(); 
  window.location.href = "/login"; 
};
```

### 2. 406 (Not Acceptable) Errors from Supabase
**Errors:**
- `GET /rest/v1/students?select=*&phone=eq.8055115752 406`
- `GET /rest/v1/exam_progress?select=*&student_phone=eq.8055115752&exam_id=eq.exam-1 406`

**Root Cause:**
Row Level Security (RLS) policies were too restrictive or missing for authenticated users trying to access their own data.

**Fix Applied:**
Created comprehensive RLS policies in `supabase-fix-406-errors.sql` that:

1. **Students Table**
   - Allow users to read their own profile by `auth_user_id`
   - Allow users to read their own profile by `phone` (for legacy support)
   - Allow users to insert/update their own profile
   - Allow admins full access

2. **Exam Progress Table**
   - Allow users to read/insert/update their own exam progress
   - Match by `student_phone` to user's phone from students table
   - Allow admins full access

3. **Exam Results Table**
   - Allow users to read/insert their own exam results
   - Match by `student_phone` to user's phone from students table
   - Allow admins full access

4. **User Plans Table**
   - Allow users to read/insert/update their own plans
   - Match by `student_phone` to user's phone from students table
   - Allow admins full access

5. **Plan Templates Table**
   - Allow public read access (including anonymous users)
   - Allow admins to insert/update/delete

## How to Apply the Fix

### Step 1: Fix Logout (Already Applied)
The Navbar component has been updated automatically.

### Step 2: Apply RLS Policies
Run the SQL script in Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase-fix-406-errors.sql`
4. Paste and run the script
5. Verify the output shows all policies created successfully

### Step 3: Test the Application
1. Refresh the application
2. Login with your account
3. Verify no 406 errors in the console
4. Test logout functionality
5. Navigate to different pages (Home, Plans, History, Profile)
6. Verify all data loads correctly

## Expected Results

After applying these fixes:
- ✅ Logout button works correctly
- ✅ No 406 errors when loading student data
- ✅ No 406 errors when loading exam progress
- ✅ No 406 errors when loading exam results
- ✅ No 406 errors when loading user plans
- ✅ Plan templates load for all users
- ✅ Users can only access their own data
- ✅ Admins can access all data

## Technical Details

### RLS Policy Pattern
All user-specific tables follow this pattern:
```sql
-- Read own data
CREATE POLICY "Users can read own [table]"
  ON [table]
  FOR SELECT
  TO authenticated
  USING (
    student_phone IN (
      SELECT phone FROM students WHERE auth_user_id = auth.uid()
    )
  );
```

This pattern:
1. Checks if the user is authenticated
2. Looks up the user's phone number from the students table using their auth_user_id
3. Only allows access to rows where student_phone matches

### Why This Works
- Uses Supabase's built-in `auth.uid()` function to get the current user's ID
- Links authentication to the students table via `auth_user_id`
- Links data tables to students via `student_phone`
- Provides a secure chain: auth → students → data tables

## Troubleshooting

If you still see 406 errors after applying the fix:

1. **Check if RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('students', 'exam_progress', 'exam_results', 'user_plans');
   ```

2. **Verify policies exist:**
   ```sql
   SELECT tablename, policyname 
   FROM pg_policies 
   WHERE tablename IN ('students', 'exam_progress', 'exam_results', 'user_plans');
   ```

3. **Check user's phone number:**
   ```sql
   SELECT phone, auth_user_id 
   FROM students 
   WHERE auth_user_id = auth.uid();
   ```

4. **Test policy manually:**
   ```sql
   -- This should return your data
   SELECT * FROM exam_progress 
   WHERE student_phone IN (
     SELECT phone FROM students WHERE auth_user_id = auth.uid()
   );
   ```

## Notes

- The fix maintains backward compatibility with phone-based authentication
- Admin access is preserved through the admins table check
- Public access to plan templates allows anonymous users to view available plans
- All policies follow the principle of least privilege
