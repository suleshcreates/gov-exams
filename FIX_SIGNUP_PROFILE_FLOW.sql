-- Fix Signup Profile Completion Flow
-- Ensures new users MUST complete their profile before accessing the app

-- PART 1: Verify trigger creates records with NULL username/phone
-- ============================================

-- Drop and recreate the trigger function to ensure it's correct
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
    NULL,  -- Force NULL username
    NULL,  -- Force NULL phone
    true,
    false,
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

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PART 2: Fix any existing records that might have been created incorrectly
-- ============================================

-- Reset username and phone for unverified users (they haven't completed profile)
UPDATE students
SET 
  username = NULL,
  phone = NULL
WHERE is_verified = false
  AND (username IS NOT NULL OR phone IS NOT NULL);

-- PART 3: Verification
-- ============================================

-- Show recent students to verify
SELECT 
  auth_user_id,
  email,
  name,
  username,
  phone,
  is_verified,
  created_at,
  CASE 
    WHEN username IS NULL AND phone IS NULL THEN '✅ Needs Profile Completion'
    WHEN username IS NOT NULL AND phone IS NOT NULL THEN '✅ Profile Complete'
    ELSE '⚠️ Partial Profile'
  END as status
FROM students
ORDER BY created_at DESC
LIMIT 10;

-- Check trigger
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Signup profile flow fixed!';
  RAISE NOTICE '✅ Trigger ensures username/phone are NULL for new users';
  RAISE NOTICE '✅ Existing unverified users reset to NULL username/phone';
  RAISE NOTICE '';
  RAISE NOTICE 'New users will now be forced to complete their profile!';
END $$;
