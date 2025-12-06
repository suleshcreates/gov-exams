-- Diagnose Signup Flow Issue
-- Check why users are bypassing complete-profile page

-- 1. Check recent student records
SELECT 
  auth_user_id,
  email,
  name,
  username,
  phone,
  is_verified,
  created_at,
  CASE 
    WHEN username IS NULL OR username = '' THEN 'Missing'
    ELSE 'Has Value: ' || username
  END as username_status,
  CASE 
    WHEN phone IS NULL OR phone = '' THEN 'Missing'
    ELSE 'Has Value: ' || phone
  END as phone_status
FROM students
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check if trigger exists and is enabled
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  tgtype as trigger_type
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 3. Check auth.users metadata to see what Google provides
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as google_full_name,
  raw_user_meta_data->>'name' as google_name,
  raw_user_meta_data->>'phone' as google_phone,
  raw_user_meta_data->>'phone_number' as google_phone_number,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 4. Find users who have username/phone but shouldn't
SELECT 
  s.auth_user_id,
  s.email,
  s.username,
  s.phone,
  s.is_verified,
  s.created_at,
  'Should be NULL' as issue
FROM students s
WHERE s.created_at > NOW() - INTERVAL '7 days'
  AND (s.username IS NOT NULL OR s.phone IS NOT NULL)
  AND s.is_verified = false;

-- 5. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'students'
ORDER BY policyname;
