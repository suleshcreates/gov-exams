-- Plan Pricing System Database Schema
-- Run this in Supabase SQL Editor

-- 1. Create plan_templates table
CREATE TABLE IF NOT EXISTS plan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  validity_days INTEGER CHECK (validity_days > 0 OR validity_days IS NULL), -- NULL for lifetime
  subjects JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of subject IDs
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  badge TEXT, -- e.g., "POPULAR", "BEST VALUE", "RECOMMENDED"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create subject_pricing table
CREATE TABLE IF NOT EXISTS subject_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  validity_days INTEGER CHECK (validity_days > 0 OR validity_days IS NULL), -- NULL for lifetime
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subject_id)
);

-- 3. Create plan_discounts table
CREATE TABLE IF NOT EXISTS plan_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value >= 0),
  applicable_to JSONB DEFAULT NULL, -- Array of plan_template IDs, NULL for all plans
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER CHECK (usage_limit > 0 OR usage_limit IS NULL), -- NULL for unlimited
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (end_date > start_date)
);

-- 4. Create plan_template_versions table (for tracking changes)
CREATE TABLE IF NOT EXISTS plan_template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_template_id UUID REFERENCES plan_templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  validity_days INTEGER,
  subjects JSONB NOT NULL,
  changed_by UUID, -- Admin user ID
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_notes TEXT
);

-- 5. Add new columns to user_plans table
ALTER TABLE user_plans 
  ADD COLUMN IF NOT EXISTS plan_template_id UUID REFERENCES plan_templates(id),
  ADD COLUMN IF NOT EXISTS discount_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_plan_templates_active ON plan_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_plan_templates_display_order ON plan_templates(display_order);
CREATE INDEX IF NOT EXISTS idx_subject_pricing_active ON subject_pricing(is_active);
CREATE INDEX IF NOT EXISTS idx_subject_pricing_subject_id ON subject_pricing(subject_id);
CREATE INDEX IF NOT EXISTS idx_plan_discounts_code ON plan_discounts(code);
CREATE INDEX IF NOT EXISTS idx_plan_discounts_active ON plan_discounts(is_active);
CREATE INDEX IF NOT EXISTS idx_plan_discounts_dates ON plan_discounts(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_user_plans_template_id ON user_plans(plan_template_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_expires_at ON user_plans(expires_at);

-- 7. Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plan_templates_updated_at
  BEFORE UPDATE ON plan_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subject_pricing_updated_at
  BEFORE UPDATE ON subject_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Disable RLS for new tables (for development)
ALTER TABLE plan_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE subject_pricing DISABLE ROW LEVEL SECURITY;
ALTER TABLE plan_discounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE plan_template_versions DISABLE ROW LEVEL SECURITY;

-- 9. Insert sample data (optional - for testing)
-- Uncomment to add sample plans

/*
-- Sample Basic Plan
INSERT INTO plan_templates (name, description, price, validity_days, subjects, display_order, badge, is_active)
VALUES (
  'Basic Plan',
  'Perfect for beginners - Access to 2 subjects',
  499.00,
  30,
  '[]'::jsonb, -- Add subject IDs after creating subjects
  1,
  'POPULAR',
  true
);

-- Sample Premium Plan
INSERT INTO plan_templates (name, description, price, validity_days, subjects, display_order, badge, is_active)
VALUES (
  'Premium Plan',
  'Complete access to all subjects',
  999.00,
  90,
  '[]'::jsonb, -- Add subject IDs after creating subjects
  2,
  'BEST VALUE',
  true
);

-- Sample Lifetime Plan
INSERT INTO plan_templates (name, description, price, validity_days, subjects, display_order, is_active)
VALUES (
  'Lifetime Access',
  'One-time payment for lifetime access',
  2999.00,
  NULL, -- NULL = lifetime
  '[]'::jsonb,
  3,
  true
);

-- Sample Discount Code
INSERT INTO plan_discounts (code, discount_type, discount_value, start_date, end_date, is_active, usage_limit)
VALUES (
  'WELCOME50',
  'percentage',
  50.00,
  NOW(),
  NOW() + INTERVAL '30 days',
  true,
  100
);
*/

-- 10. Verification queries
-- Run these to verify tables were created successfully

SELECT 'plan_templates' as table_name, COUNT(*) as row_count FROM plan_templates
UNION ALL
SELECT 'subject_pricing', COUNT(*) FROM subject_pricing
UNION ALL
SELECT 'plan_discounts', COUNT(*) FROM plan_discounts
UNION ALL
SELECT 'plan_template_versions', COUNT(*) FROM plan_template_versions;

-- Check if new columns were added to user_plans
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_plans' 
  AND column_name IN ('plan_template_id', 'discount_code', 'original_price', 'discount_amount');
