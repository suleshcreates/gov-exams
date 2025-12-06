-- Create Two New Admin Users
-- Run this in Supabase SQL Editor

-- Admin User 1
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin2@dmltacademy.com',  -- CHANGE THIS EMAIL
  crypt('Admin@123456', gen_salt('bf')),  -- CHANGE THIS PASSWORD
  NOW(),
  '{"role": "admin", "name": "Admin User 2"}'::jsonb,  -- CHANGE THE NAME
  NOW(),
  NOW(),
  '',
  ''
);

-- Admin User 2
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin3@dmltacademy.com',  -- CHANGE THIS EMAIL
  crypt('Admin@789012', gen_salt('bf')),  -- CHANGE THIS PASSWORD
  NOW(),
  '{"role": "admin", "name": "Admin User 3"}'::jsonb,  -- CHANGE THE NAME
  NOW(),
  NOW(),
  '',
  ''
);

-- Verify the admins were created
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'name' as name,
  created_at
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin'
ORDER BY created_at DESC;
