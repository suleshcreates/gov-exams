-- ============================================
-- MOCK DATA FOR GOVEXAMS ADMIN PANEL TESTING
-- ============================================
-- Run this in Supabase SQL Editor to add test data

-- 1. Insert Mock Students (email is primary key, no id column)
INSERT INTO students (name, email, phone, username, is_verified, email_verified, created_at)
VALUES
  ('Rahul Sharma', 'rahul.sharma@gmail.com', '9876543210', 'rahul_sharma', true, true, NOW() - INTERVAL '30 days'),
  ('Priya Patel', 'priya.patel@gmail.com', '9876543211', 'priya_patel', true, true, NOW() - INTERVAL '25 days'),
  ('Amit Kumar', 'amit.kumar@gmail.com', '9876543212', 'amit_kumar', true, true, NOW() - INTERVAL '20 days'),
  ('Sneha Gupta', 'sneha.gupta@gmail.com', '9876543213', 'sneha_gupta', false, true, NOW() - INTERVAL '15 days'),
  ('Vikram Singh', 'vikram.singh@gmail.com', '9876543214', 'vikram_singh', true, true, NOW() - INTERVAL '10 days'),
  ('Anita Desai', 'anita.desai@gmail.com', '9876543215', 'anita_desai', true, false, NOW() - INTERVAL '7 days'),
  ('Deepak Joshi', 'deepak.joshi@gmail.com', '9876543216', 'deepak_joshi', true, true, NOW() - INTERVAL '5 days'),
  ('Kavita Rao', 'kavita.rao@gmail.com', '9876543217', 'kavita_rao', true, true, NOW() - INTERVAL '3 days'),
  ('Suresh Nair', 'suresh.nair@gmail.com', '9876543218', 'suresh_nair', false, false, NOW() - INTERVAL '2 days'),
  ('Meera Iyer', 'meera.iyer@gmail.com', '9876543219', 'meera_iyer', true, true, NOW() - INTERVAL '1 day')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Mock Subjects
INSERT INTO subjects (id, name, description, created_at)
VALUES
  (gen_random_uuid(), 'MPSC Prelims', 'Maharashtra Public Service Commission Preliminary Exam', NOW() - INTERVAL '60 days'),
  (gen_random_uuid(), 'MPSC Mains', 'Maharashtra Public Service Commission Main Exam', NOW() - INTERVAL '59 days'),
  (gen_random_uuid(), 'SSC CGL', 'Staff Selection Commission Combined Graduate Level', NOW() - INTERVAL '58 days'),
  (gen_random_uuid(), 'UPSC CSE', 'Union Public Service Commission Civil Services Exam', NOW() - INTERVAL '57 days'),
  (gen_random_uuid(), 'Banking PO', 'Probationary Officer Exam for Banks', NOW() - INTERVAL '56 days'),
  (gen_random_uuid(), 'Railway RRB', 'Railway Recruitment Board Exams', NOW() - INTERVAL '55 days')
ON CONFLICT (name) DO NOTHING;

-- 3. Insert Plan Templates (Pricing Plans)
INSERT INTO plan_templates (id, name, description, price, validity_days, subjects, badge, display_order, is_active, created_at)
VALUES
  (gen_random_uuid(), 'Basic Plan', 'Access to one subject for 30 days', 299, 30, '[]', NULL, 1, true, NOW() - INTERVAL '30 days'),
  (gen_random_uuid(), 'Standard Plan', 'Access to 3 subjects for 60 days', 599, 60, '[]', 'POPULAR', 2, true, NOW() - INTERVAL '30 days'),
  (gen_random_uuid(), 'Premium Plan', 'All subjects for 90 days', 999, 90, '[]', 'BEST VALUE', 3, true, NOW() - INTERVAL '30 days'),
  (gen_random_uuid(), 'Annual Plan', 'All subjects for 365 days', 2499, 365, '[]', 'SAVE 50%', 4, true, NOW() - INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- 4. Insert User Plans (purchases) - with all required columns
INSERT INTO user_plans (id, student_phone, plan_id, plan_name, price_paid, exam_ids, student_name, is_active, purchased_at, expires_at)
VALUES
  (gen_random_uuid(), '9876543210', 'PLAN-PREM-001', 'Premium Plan', 999, '[]'::jsonb, 'Rahul Sharma', true, NOW() - INTERVAL '20 days', NOW() + INTERVAL '70 days'),
  (gen_random_uuid(), '9876543211', 'PLAN-STD-001', 'Standard Plan', 599, '[]'::jsonb, 'Priya Patel', true, NOW() - INTERVAL '15 days', NOW() + INTERVAL '45 days'),
  (gen_random_uuid(), '9876543212', 'PLAN-BAS-001', 'Basic Plan', 299, '[]'::jsonb, 'Amit Kumar', true, NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days'),
  (gen_random_uuid(), '9876543213', 'PLAN-ANN-001', 'Annual Plan', 2499, '[]'::jsonb, 'Sneha Gupta', true, NOW() - INTERVAL '5 days', NOW() + INTERVAL '360 days'),
  (gen_random_uuid(), '9876543214', 'PLAN-PREM-002', 'Premium Plan', 999, '[]'::jsonb, 'Vikram Singh', false, NOW() - INTERVAL '100 days', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- 5. Insert Exam Results - with ALL required columns
INSERT INTO exam_results (id, student_phone, exam_id, exam_title, set_id, set_number, score, total_questions, accuracy, time_taken, student_name, created_at)
VALUES
  (gen_random_uuid(), '9876543210', 'MPSC-PRE-2024', 'MPSC Prelims Mock Test 1', 'SET-001', 1, 72, 100, 72, '45:30', 'Rahul Sharma', NOW() - INTERVAL '18 days'),
  (gen_random_uuid(), '9876543210', 'MPSC-PRE-2024', 'MPSC Prelims Mock Test 2', 'SET-002', 2, 81, 100, 81, '52:15', 'Rahul Sharma', NOW() - INTERVAL '10 days'),
  (gen_random_uuid(), '9876543211', 'SSC-CGL-T1', 'SSC CGL Practice Set', 'SET-001', 1, 65, 100, 65, '55:00', 'Priya Patel', NOW() - INTERVAL '12 days'),
  (gen_random_uuid(), '9876543211', 'MPSC-MAINS', 'MPSC Mains Essay Writing', 'SET-001', 1, 78, 100, 78, '120:00', 'Priya Patel', NOW() - INTERVAL '8 days'),
  (gen_random_uuid(), '9876543212', 'BANK-PO', 'Banking PO Quantitative', 'SET-001', 1, 55, 100, 55, '40:00', 'Amit Kumar', NOW() - INTERVAL '7 days'),
  (gen_random_uuid(), '9876543213', 'RRB-TECH', 'Railway RRB Technical', 'SET-001', 1, 88, 100, 88, '58:30', 'Sneha Gupta', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), '9876543213', 'UPSC-PRE', 'UPSC CSE Prelims', 'SET-001', 1, 92, 100, 92, '110:00', 'Sneha Gupta', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), '9876543214', 'MPSC-PRE-2024', 'MPSC Prelims Mock', 'SET-003', 3, 45, 100, 45, '60:00', 'Vikram Singh', NOW() - INTERVAL '95 days')
ON CONFLICT DO NOTHING;

-- 6. Insert Question Sets (sample)
DO $$
DECLARE
  mpsc_subject_id UUID;
  ssc_subject_id UUID;
BEGIN
  SELECT id INTO mpsc_subject_id FROM subjects WHERE name = 'MPSC Prelims' LIMIT 1;
  SELECT id INTO ssc_subject_id FROM subjects WHERE name = 'SSC CGL' LIMIT 1;

  IF mpsc_subject_id IS NOT NULL THEN
    INSERT INTO question_sets (id, subject_id, exam_id, set_number, time_limit_minutes, created_at)
    VALUES
      (gen_random_uuid(), mpsc_subject_id, 'MPSC-PRE-2024', 1, 120, NOW() - INTERVAL '20 days'),
      (gen_random_uuid(), mpsc_subject_id, 'MPSC-HIST', 1, 60, NOW() - INTERVAL '15 days')
    ON CONFLICT DO NOTHING;
  END IF;

  IF ssc_subject_id IS NOT NULL THEN
    INSERT INTO question_sets (id, subject_id, exam_id, set_number, time_limit_minutes, created_at)
    VALUES
      (gen_random_uuid(), ssc_subject_id, 'SSC-CGL-T1', 1, 60, NOW() - INTERVAL '18 days'),
      (gen_random_uuid(), ssc_subject_id, 'SSC-QUANT', 1, 45, NOW() - INTERVAL '12 days')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Done! You should now see data in your admin panel
SELECT 'Mock data inserted successfully!' AS status;
