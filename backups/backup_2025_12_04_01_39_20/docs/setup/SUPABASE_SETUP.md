# Supabase Setup Guide

This guide will help you set up Supabase for your Exam Portal application.

## Prerequisites

- A Supabase account (create one at [supabase.com](https://supabase.com))
- Node.js and npm/yarn installed
- Your project dependencies installed (`npm install`)

## Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: Your exam portal name
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose the closest region to your users
4. Click **"Create new project"** (takes 1-2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (found under "Project URL")
   - **Anon/Public Key** (found under "Project API keys" → "anon public")

## Step 3: Set Up Environment Variables

1. In your project root, create a `.env` file (or copy from `.env.example` if it exists)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Example:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click **"Run"** or press `Ctrl+Enter` (or `Cmd+Enter` on Mac)
5. Verify the tables were created by going to **Table Editor** - you should see:
   - `students`
   - `exam_results`
   - `exam_progress`

## Step 5: Install Dependencies

```bash
npm install
```

This will install `@supabase/supabase-js` and other dependencies.

## Step 6: Test the Connection

1. Start your development server:
```bash
npm run dev
```

2. Try signing up a new user
3. Check your Supabase **Table Editor** - you should see the new student record

## Troubleshooting

### "Invalid API key" error
- Verify your `.env` file has the correct values
- Make sure the `.env` file is in the project root
- Restart your dev server after changing `.env`

### "relation does not exist" error
- Make sure you ran the SQL schema script
- Check that tables exist in Supabase Table Editor

### "permission denied" error
- Check RLS policies in Supabase
- Verify the policies in the SQL schema were created successfully

## Security Notes

⚠️ **Important**: The current setup uses basic authentication. For production:

1. **Implement proper password hashing** - Store password hashes (not plain text) in a secure way
2. **Use Supabase Auth** - Consider migrating to Supabase's built-in authentication system
3. **Strengthen RLS policies** - Add more specific policies based on user authentication
4. **Add rate limiting** - Prevent brute force attacks

## Database Schema Overview

### `students` Table
- Stores student registration information
- Primary key: `id` (UUID)
- Unique constraint on `aadhaar`

### `exam_results` Table
- Stores completed exam submissions
- Foreign key: `student_aadhaar` → `students(aadhaar)`
- Indexed for fast queries

### `exam_progress` Table
- Tracks which exam sets each student has completed
- Unique constraint on `(student_aadhaar, exam_id)`
- Used to unlock next question sets

## Next Steps

1. ✅ Database setup complete
2. ✅ Environment variables configured
3. ✅ Test user registration
4. ✅ Test exam submission
5. 🔒 Implement proper authentication (recommended)
6. 🔒 Add data migration from localStorage (if you have existing data)

## Migration from localStorage

If you have existing data in localStorage, you can create a migration script:

1. Export data from localStorage
2. Use Supabase dashboard or API to import data
3. Or create a one-time migration utility in your codebase

---

Need help? Check [Supabase Documentation](https://supabase.com/docs) or [GitHub Issues](https://github.com/supabase/supabase/issues)


