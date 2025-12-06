-- SMART SIGNUP RPC
-- This function handles both new and existing auth users.
-- If p_auth_user_id is NULL, it looks it up by email.

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
SECURITY DEFINER -- Runs as Admin
SET search_path = public, auth
AS $$
DECLARE
    v_student_phone TEXT;
    v_auth_id UUID;
BEGIN
    -- 1. Determine Auth User ID
    IF p_auth_user_id IS NOT NULL THEN
        v_auth_id := p_auth_user_id;
    ELSE
        -- Look up by email if ID is not provided
        SELECT id INTO v_auth_id
        FROM auth.users
        WHERE email = p_email;
        
        IF v_auth_id IS NULL THEN
             RETURN jsonb_build_object('success', false, 'error', 'Auth user not found for email: ' || p_email);
        END IF;
    END IF;

    -- 2. Check if student already exists
    IF EXISTS (SELECT 1 FROM public.students WHERE email = p_email) THEN
         RETURN jsonb_build_object('success', false, 'error', 'Student profile already exists');
    END IF;

    -- 3. Insert the student record
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
        v_auth_id,
        p_name,
        p_email,
        p_phone,
        p_username,
        p_password_hash,
        true,
        true
    )
    RETURNING phone INTO v_student_phone;

    RETURN jsonb_build_object('success', true, 'student_phone', v_student_phone);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
END;
$$;

GRANT EXECUTE ON FUNCTION create_student_profile TO anon, authenticated, service_role;
