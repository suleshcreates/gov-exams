-- Fix Current User Profile Issue
-- Run this to manually create the student record for the current OAuth user

-- Replace this with the actual auth_user_id from the logs
DO $$
DECLARE
  v_auth_user_id uuid := '7c7c494f-6742-4b06-b4f7-0a5496b931af';
  v_email text := 'suleshwaghmare2004@gmail.com';
  v_name text := 'Sulesh Waghmare';
BEGIN
  -- Check if student record exists
  IF NOT EXISTS (SELECT 1 FROM students WHERE auth_user_id = v_auth_user_id) THEN
    -- Create student record
    INSERT INTO students (
      auth_user_id,
      email,
      name,
      username,
      phone,
      is_verified,
      created_at
    ) VALUES (
      v_auth_user_id,
      v_email,
      v_name,
      NULL,
      NULL,
      false,
      NOW()
    );
    
    RAISE NOTICE 'Created student record for: %', v_email;
  ELSE
    RAISE NOTICE 'Student record already exists for: %', v_email;
  END IF;
END $$;

-- Verify
SELECT * FROM students WHERE auth_user_id = '7c7c494f-6742-4b06-b4f7-0a5496b931af';
