-- TEST MANUAL INSERT
-- We are using the EXACT ID found in your previous screenshot.

-- 1. Attempt to insert the row manually
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
    '12488997-d611-4f08-8270-e233c0db675f', -- ID from your screenshot
    'Debug User',
    'suleshwaghmare7875@gmail.com',
    '9999999999',
    'debug_user',
    'debug_hash',
    true,
    true
);

-- If this works, you will see "INSERT 0 1"
-- If this fails, you will see the exact error message.
