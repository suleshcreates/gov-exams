-- Admin Panel Database Schema Migration
-- Run this in Supabase SQL Editor

-- 1. Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create question_sets table
CREATE TABLE IF NOT EXISTS question_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  exam_id VARCHAR(50) NOT NULL,
  set_number INTEGER NOT NULL,
  time_limit_minutes INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(exam_id, set_number)
);

-- 3. Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_set_id UUID REFERENCES question_sets(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_text_marathi TEXT NOT NULL,
  option_1 TEXT NOT NULL,
  option_1_marathi TEXT NOT NULL,
  option_2 TEXT NOT NULL,
  option_2_marathi TEXT NOT NULL,
  option_3 TEXT NOT NULL,
  option_3_marathi TEXT NOT NULL,
  option_4 TEXT NOT NULL,
  option_4_marathi TEXT NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer BETWEEN 0 AND 3),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_question_sets_subject_id ON question_sets(subject_id);
CREATE INDEX IF NOT EXISTS idx_question_sets_exam_id ON question_sets(exam_id);
CREATE INDEX IF NOT EXISTS idx_questions_question_set_id ON questions(question_set_id);
CREATE INDEX IF NOT EXISTS idx_questions_order_index ON questions(question_set_id, order_index);
CREATE INDEX IF NOT EXISTS idx_admins_auth_user_id ON admins(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- 6. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Add triggers for updated_at
DROP TRIGGER IF EXISTS update_subjects_updated_at ON subjects;
CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_question_sets_updated_at ON question_sets;
CREATE TRIGGER update_question_sets_updated_at
  BEFORE UPDATE ON question_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Set up RLS policies for admin access
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admins) to read all data
CREATE POLICY "Allow authenticated users to read subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read question_sets"
  ON question_sets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins to insert, update, delete (check if user is in admins table)
CREATE POLICY "Allow admins to insert subjects"
  ON subjects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Allow admins to update subjects"
  ON subjects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Allow admins to delete subjects"
  ON subjects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Allow admins to insert question_sets"
  ON question_sets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Allow admins to update question_sets"
  ON question_sets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Allow admins to delete question_sets"
  ON question_sets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Allow admins to insert questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Allow admins to update questions"
  ON questions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Allow admins to delete questions"
  ON questions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- Admins table policies
CREATE POLICY "Allow admins to read admins table"
  ON admins FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- 9. Insert sample subjects (optional - for testing)
INSERT INTO subjects (name, description) VALUES
  ('Mathematics', 'Comprehensive mathematics test covering algebra, calculus, and geometry'),
  ('Physics', 'Physics examination covering mechanics, thermodynamics, and electromagnetism'),
  ('Chemistry', 'Chemistry test including organic, inorganic, and physical chemistry'),
  ('Biology', 'Biology examination covering botany, zoology, and human physiology'),
  ('General Knowledge', 'Comprehensive GK test covering history, geography, and current affairs')
ON CONFLICT (name) DO NOTHING;

-- 10. Verification queries
SELECT 'Subjects created:' as info, COUNT(*) as count FROM subjects;
SELECT 'Question sets created:' as info, COUNT(*) as count FROM question_sets;
SELECT 'Questions created:' as info, COUNT(*) as count FROM questions;
SELECT 'Admins created:' as info, COUNT(*) as count FROM admins;

-- 11. Instructions for creating admin user
-- After running this script, create an admin user manually:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Create a new user with email and password
-- 3. Copy the user's UUID
-- 4. Run this query with the actual values:
-- INSERT INTO admins (auth_user_id, email, name) 
-- VALUES ('USER_UUID_HERE', 'admin@example.com', 'Admin Name');
