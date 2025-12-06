-- Fix for the trigger function
-- Run this in Supabase SQL Editor

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if the user doesn't already exist
  INSERT INTO public.students (
    email,
    username,
    name,
    auth_user_id,
    email_verified,
    password_hash
  )
  VALUES (
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.id,
    NEW.email_confirmed_at IS NOT NULL,
    ''
  )
  ON CONFLICT (auth_user_id) DO UPDATE
  SET 
    email_verified = NEW.email_confirmed_at IS NOT NULL,
    email = EXCLUDED.email;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth signup
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Make sure email and username columns allow NULL temporarily
ALTER TABLE students ALTER COLUMN email DROP NOT NULL;
ALTER TABLE students ALTER COLUMN username DROP NOT NULL;

-- Update any existing NULL values
UPDATE students 
SET email = phone || '@temp.local' 
WHERE email IS NULL AND phone IS NOT NULL;

UPDATE students 
SET username = 'user_' || phone 
WHERE username IS NULL AND phone IS NOT NULL;

-- Now make them NOT NULL again
ALTER TABLE students ALTER COLUMN email SET NOT NULL;
ALTER TABLE students ALTER COLUMN username SET NOT NULL;
