# Admin Panel Setup Instructions

## Database Setup Required

The admin panel pages have been created, but you need to set up the database tables first.

### Step 1: Run the SQL Migration

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Open the file `supabase-admin-panel-schema.sql` from this project
4. Copy and paste the entire SQL script into the Supabase SQL Editor
5. Click "Run" to execute the script

This will create the following tables:
- `subjects` - For organizing exams by subject
- `question_sets` - For grouping questions into sets
- `questions` - For storing individual questions with bilingual support
- `admins` - For tracking admin users

### Step 2: Create an Admin User

After running the SQL script, you need to set up an admin user:

1. Go to Supabase Dashboard → Authentication → Users
2. Find your user account (or create a new one)
3. Click on the user to edit
4. Scroll to "User Metadata" section
5. Add the following metadata:
   ```json
   {
     "role": "admin"
   }
   ```
6. Save the changes

### Step 3: Test the Admin Panel

1. Log in to the admin panel at `/admin/login`
2. Use your admin credentials
3. You should now be able to:
   - View the dashboard
   - Manage students
   - Create subjects
   - Add question sets
   - Create questions

## Troubleshooting

### 500 Error when creating question sets
- **Cause**: The database tables don't exist yet
- **Solution**: Run the SQL migration script (Step 1 above)

### "Permission denied" errors
- **Cause**: Your user doesn't have admin role
- **Solution**: Add the admin role to your user metadata (Step 2 above)

### Tables already exist error
- **Cause**: You've already run the migration
- **Solution**: This is fine, the script uses `CREATE TABLE IF NOT EXISTS`

## What's Been Built

### Completed Admin Pages:
✅ Dashboard - Analytics and metrics
✅ Students List - View all students with search
✅ Student Detail - Individual student info, plans, and exam history
✅ Subjects List - Manage exam subjects
✅ Subject Detail - View question sets for a subject
✅ Question Set Editor - Create/edit question sets
✅ Question Manager - Manage questions with bilingual editor

### Still To Build:
⏳ Exam Results - Monitor all exam results
⏳ User Plans - Manage user subscriptions
⏳ Reusable components (DataTable, Modal, etc.)
