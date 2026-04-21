# 🚨 IMPORTANT: Admin Panel Database Setup Required

## Current Issue

You're getting a **500 error** when trying to create question sets because the database tables don't exist yet.

## Quick Fix (3 Steps)

### 1️⃣ Run the SQL Migration

Open `supabase-admin-panel-schema.sql` and run it in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase-admin-panel-schema.sql`
5. Paste it into the editor
6. Click "Run" (or press Ctrl+Enter)

This creates these tables:
- ✅ `subjects`
- ✅ `question_sets`
- ✅ `questions`
- ✅ `admins`

### 2️⃣ Set Up Admin User

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find your user (or create one)
3. Click on the user to edit
4. In **User Metadata**, add:
   ```json
   {
     "role": "admin"
   }
   ```
5. Save

### 3️⃣ Test It

1. Refresh your admin panel
2. Try creating a subject
3. Try adding a question set
4. Should work now! ✨

## What's Working Now

✅ Dashboard with analytics
✅ Student management (list + detail view)
✅ Subject management (CRUD operations)
✅ Question set editor
✅ Question manager with bilingual support
✅ All navigation and routing

## What's Next

After the database is set up, I can continue building:
- 📊 Exam Results monitoring page
- 💳 User Plans management page
- 🔧 Reusable components (DataTable, Modal, etc.)

## Troubleshooting

**Still getting 500 errors?**
- Check the browser console for the exact error
- Verify the tables were created: Go to Supabase → Table Editor
- Make sure your user has the admin role in metadata

**Permission denied errors?**
- Your user needs `"role": "admin"` in the user metadata
- RLS policies are set up to check for this role

**Need help?**
- Check `ADMIN_PANEL_SETUP.md` for detailed instructions
- Look at the browser console for specific error messages
