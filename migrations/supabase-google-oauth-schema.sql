-- Google OAuth Authentication Schema Updates
-- This script updates the students table to support Google OAuth authentication

-- Step 1: Add new columns for Google OAuth support
ALTER TABLE students
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Step 2: Make existing columns nullable for Google OAuth users
-- (They will complete profile after OAuth)
ALTER TABLE students
ALTER COLUMN password_hash DROP NOT NULL,
ALTER COLUMN username DROP NOT NULL,
ALTER COLUMN phone DROP NOT NULL;

-- Step 3: Add foreign key constraint to auth.users
ALTER TABLE students
ADD CONSTRAINT fk_students_auth_user
FOREIGN KEY (auth_user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Step 4: Create index for faster lookups by auth_user_id
CREATE INDEX IF NOT EXISTS idx_students_auth_user_id ON students(auth_user_id);

-- Step 5: Create function to auto-create student record on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.students (
    auth_user_id,
    email,
    name,
    avatar_url,
    email_verified,
    is_verified
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    true,
    false  -- Will be set to true after profile completion
  )
  ON CONFLICT (auth_user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create trigger to call function on new auth user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Update RLS policies for students table
-- Allow users to read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON students;
CREATE POLICY "Users can view own profile"
  ON students
  FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON students;
CREATE POLICY "Users can update own profile"
  ON students
  FOR UPDATE
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Allow authenticated users to insert their own profile (for manual creation)
DROP POLICY IF EXISTS "Users can insert own profile" ON students;
CREATE POLICY "Users can insert own profile"
  ON students
  FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- Admin users can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON students;
CREATE POLICY "Admins can view all profiles"
  ON students
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Admin users can update all profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON students;
CREATE POLICY "Admins can update all profiles"
  ON students
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Step 8: Add unique constraint on email (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'students_email_key'
  ) THEN
    ALTER TABLE students ADD CONSTRAINT students_email_key UNIQUE (email);
  END IF;
END $$;

-- Step 9: Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- Verification query to check the changes
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;
