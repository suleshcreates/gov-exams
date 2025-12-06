-- FIX SIGNUP WITH RPC (CORRECTED)
-- This creates a secure function that runs as Admin (Security Definer)
-- This bypasses the "anon" permission issues completely.

CREATE OR REPLACE FUNCTION create_student_profile(
    p_auth_user_id UUID,
    p_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_username TEXT,
    p_password_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (postgres/admin)
SET search_path = public, auth -- Ensure it can see both schemas
AS $$
DECLARE
    v_student_phone TEXT;
BEGIN
    -- 1. Insert the student record
    INSERT INTO public.students (
        auth_user_id,
        name,
        email,
        phone,
        username,
        password_hash,
        is_verified,
        email_verified
    ) VALUES (
        p_auth_user_id,
        p_name,
        p_email,
        p_phone,
        p_username,
        p_password_hash,
        true, -- Auto-verify for now since we did OTP
        true
    )
    RETURNING phone INTO v_student_phone;

    -- 2. Return success
    RETURN jsonb_build_object(
        'success', true,
        'student_phone', v_student_phone
    );

EXCEPTION WHEN OTHERS THEN
    -- Return error details
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'detail', SQLSTATE
    );
END;
$$;

-- Grant execute permission to everyone (since it's used during signup)
GRANT EXECUTE ON FUNCTION create_student_profile TO anon, authenticated, service_role;
