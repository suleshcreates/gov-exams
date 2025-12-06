-- Admin Authentication Setup Script
-- Run this in your Supabase SQL Editor

-- 1. Ensure admins table exists with correct structure
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- 3. Create default admin user
-- Password: admin123
-- You can generate new hashes using bcrypt online or in your backend
INSERT INTO admins (email, name, password_hash, role)
VALUES (
  'admin@example.com',
  'Admin User',
  '$2b$10$YourBcryptHashHere', -- REPLACE THIS with actual bcrypt hash of 'admin123'
  'super_admin'
)
ON CONFLICT (email) DO UPDATE
SET 
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  updated_at = NOW();

-- 4. Verify admin was created
SELECT id, email, name, role, created_at FROM admins WHERE email = 'admin@example.com';

-- Optional: Create a trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admins_updated_at 
BEFORE UPDATE ON admins
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
