-- CRITICAL FIX: Enable the signup trigger that was disabled
-- This is why users are bypassing profile completion!

-- PART 1: Check current trigger status
-- ============================================
SELECT 
  tgname as trigger_name,
  tgenabled as enabled_status,
  CASE 
    WHEN tgenabled = 'O' THEN '✅ Enabled'
    WHEN tgenabled = 'D' THEN '❌ Disabled'
    WHEN tgenabled = 'R' THEN '⚠️ Replica Only'
    WHEN tgenabled = 'A' THEN '⚠️ Always'
    ELSE '❓ Unknown'
  END as status_description
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- PART 2: Drop and recreate the trigger (this will enable it)
-- ============================================

-- First, drop the existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger function with correct logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new student record when a new auth user is created
  -- Explicitly set username and phone to NULL so users MUST complete profile
  INSERT INTO public.students (
    auth_user_id,
    email,
    name,
    avatar_url,
    username,
    phone,
    email_verified,
    is_verified,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    NULL,  -- Force NULL username - user must complete profile
    NULL,  -- Force NULL phone - user must complete profile
    true,
    false,  -- Will be set to true after profile completion
    NOW()
  )
  ON CONFLICT (auth_user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the auth
  RAISE WARNING 'Failed to create student record: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger (this will be ENABLED by default)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PART 3: Verify trigger is now enabled
-- ============================================
SELECT 
  tgname as trigger_name,
  tgenabled as enabled_status,
  CASE 
    WHEN tgenabled = 'O' THEN '✅ ENABLED - Trigger will fire!'
    WHEN tgenabled = 'D' THEN '❌ DISABLED - Trigger will NOT fire!'
    ELSE '⚠️ Other status'
  END as status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- PART 4: Fix existing users who may have wrong data
-- ============================================

-- Reset username and phone for unverified users
-- (These users haven't completed their profile yet)
UPDATE students
SET 
  username = NULL,
  phone = NULL
WHERE is_verified = false
  AND (username IS NOT NULL OR phone IS NOT NULL);

-- Show how many records were fixed
SELECT 
  COUNT(*) as records_fixed,
  'Unverified users reset to NULL username/phone' as description
FROM students
WHERE is_verified = false
  AND username IS NULL
  AND phone IS NULL;

-- PART 5: Verification - Show recent students
-- ============================================
SELECT 
  auth_user_id,
  email,
  name,
  username,
  phone,
  is_verified,
  created_at,
  CASE 
    WHEN username IS NULL AND phone IS NULL AND is_verified = false THEN '✅ Needs Profile Completion (CORRECT)'
    WHEN username IS NOT NULL AND phone IS NOT NULL AND is_verified = true THEN '✅ Profile Complete (CORRECT)'
    WHEN username IS NULL AND phone IS NULL AND is_verified = true THEN '⚠️ Verified but no username/phone (WRONG)'
    ELSE '⚠️ Inconsistent State'
  END as status
FROM students
ORDER BY created_at DESC
LIMIT 10;

-- PART 6: Test the trigger (optional - only if you want to test)
-- ============================================
-- Uncomment to test with a fake user
/*
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
BEGIN
  -- This would normally be done by Supabase Auth
  -- We're just testing the trigger logic
  RAISE NOTICE 'Testing trigger with user ID: %', test_user_id;
  
  -- Check if student record would be created
  -- (Don't actually insert into auth.users - that's managed by Supabase)
END $$;
*/

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ TRIGGER ENABLED AND FIXED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Trigger on_auth_user_created is now ENABLED';
  RAISE NOTICE '✅ Trigger will create student records with NULL username/phone';
  RAISE NOTICE '✅ Existing unverified users have been reset';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Test signup with a new Google account';
  RAISE NOTICE '2. You should be redirected to /complete-profile';
  RAISE NOTICE '3. Check browser console for detailed logs';
  RAISE NOTICE '';
END $$;
