-- FIX FUNCTION DATA TYPES
-- Matches the actual column types in students table

DROP FUNCTION IF EXISTS public.verify_student_login(text, text);

CREATE OR REPLACE FUNCTION public.verify_student_login(
  identifier_input text,
  password_hash_input text
)
RETURNS TABLE(
  phone varchar(20),
  name varchar(100),
  email varchar(100),
  username varchar(50),
  is_verified boolean,
  email_verified boolean
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  student_record RECORD;
  is_email boolean;
BEGIN
  -- Determine if identifier is email or username
  is_email := identifier_input LIKE '%@%';
  
  -- Find student
  IF is_email THEN
    SELECT s.* INTO student_record 
    FROM students s
    WHERE lower(s.email) = lower(identifier_input);
  ELSE
    SELECT s.* INTO student_record 
    FROM students s
    WHERE lower(s.username) = lower(identifier_input);
  END IF;
  
  -- Check if student exists and password matches
  IF student_record.password_hash = password_hash_input THEN
    -- Return student data (without password hash)
    RETURN QUERY SELECT 
      student_record.phone::varchar(20),
      student_record.name::varchar(100),
      student_record.email::varchar(100),
      student_record.username::varchar(50),
      student_record.is_verified,
      student_record.email_verified;
  ELSE
    -- Return empty result
    RETURN;
  END IF;
END;
$$;

-- Grant execute
GRANT EXECUTE ON FUNCTION public.verify_student_login TO anon, authenticated;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ FIXED DATA TYPE MISMATCH!';
  RAISE NOTICE 'Login function now matches actual column types.';
  RAISE NOTICE '';
END $$;
