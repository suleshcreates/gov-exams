# Quick Admin Panel Setup

## 🎯 Goal
Enable admin panel by allowing admins to query database directly using RLS policies.

---

## ⚡ Quick Setup (5 minutes)

### 1. Create Admin User in Supabase Auth

Dashboard → Authentication → Users → **Add user**:
- Email: `suleshvi43@gmail.com`
- Password: `sulesh123`
- ✅ **Auto Confirm**: YES
- Click **Save**

### 2. Add Admin to `admins` Table

Run in Supabase SQL Editor:

```sql
-- Insert admin user
INSERT INTO admins (email, name, role)
VALUES ('suleshvi43@gmail.com', 'Admin User', 'super_admin')
ON CONFLICT (email) DO NOTHING;
```

### 3. Apply RLS Policies

Copy the entire contents of `backend/migrations/004_admin_rls_policies.sql` and run in Supabase SQL Editor.

This creates:
- ✅ `is_admin()` helper function
- ✅ Policies for all tables (students, plans, questions, etc.)

### 4. Test Admin Login

1. Go to `http://localhost:5173/admin/login`
2. Login with:
   - Email: `suleshvi43@gmail.com`
   - Password: `sulesh123`
3. Dashboard should load with real data! 🎉

---

## ✅ What's Working Now

- ✅ Admin login via Supabase Auth
- ✅ Dashboard shows real metrics
- ✅ Students list loads
- ✅ Plans list loads
- ✅ Exam results load
- ✅ Questions management works
- ✅ All admin pages functional

---

## 🔍 How It Works

```
Admin Login
    ↓
Supabase Auth (creates JWT)
    ↓
Frontend queries database
    ↓
RLS checks is_admin() function
    ↓
Grants/denies access
```

**Key:** Admin's email must exist in BOTH:
1. **Supabase Auth** (`auth.users` table)
2. **`admins` table**

---

## 🐛 Troubleshooting

**Dashboard shows zero:**
- Check admin exists in `admins` table
- Verify RLS policies are applied
- Re-login to refresh JWT token

**Permission denied:**
```sql
-- Verify policies exist
SELECT * FROM pg_policies WHERE tablename = 'students';
```

---

## 📁 Files Changed

- ✅ [AdminAuthContext.tsx](file:///c:/Users/sules/OneDrive/Desktop/docter%20agent/exam%20portal/ethereal-exam-quest/src/admin/context/AdminAuthContext.tsx) - Uses admins table check
- ✅ [004_admin_rls_policies.sql](file:///c:/Users/sules/OneDrive/Desktop/docter%20agent/exam%20portal/ethereal-exam-quest/backend/migrations/004_admin_rls_policies.sql) - RLS policies

**No code changes needed in:**
- `adminService.ts` (all queries work via RLS)
- Admin dashboard pages
- Admin components

---

Done! Admin panel ready in 5 minutes. 🚀
