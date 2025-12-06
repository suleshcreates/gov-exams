-- Check verification code expiration times
SELECT 
    email,
    verification_code,
    verification_code_expires,
    NOW() as current_time,
    (verification_code_expires > NOW()) as is_valid,
    EXTRACT(EPOCH FROM (verification_code_expires - NOW()))/60 as minutes_remaining
FROM students
WHERE verification_code IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
