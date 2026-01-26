-- Fix RLS policies for Special Exams and Sets to allow Admin access

-- 1. Policies for special_exams
CREATE POLICY "Admins can view all special_exams" ON special_exams
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      (auth.jwt() ->> 'email') IN (SELECT email FROM admins) OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Admins can insert special_exams" ON special_exams
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND (
      (auth.jwt() ->> 'email') IN (SELECT email FROM admins) OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Admins can update special_exams" ON special_exams
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND (
      (auth.jwt() ->> 'email') IN (SELECT email FROM admins) OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Admins can delete special_exams" ON special_exams
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND (
      (auth.jwt() ->> 'email') IN (SELECT email FROM admins) OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

-- 2. Policies for special_exam_sets
CREATE POLICY "Admins can view all special_exam_sets" ON special_exam_sets
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      (auth.jwt() ->> 'email') IN (SELECT email FROM admins) OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Admins can insert special_exam_sets" ON special_exam_sets
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND (
      (auth.jwt() ->> 'email') IN (SELECT email FROM admins) OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Admins can update special_exam_sets" ON special_exam_sets
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND (
      (auth.jwt() ->> 'email') IN (SELECT email FROM admins) OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Admins can delete special_exam_sets" ON special_exam_sets
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND (
      (auth.jwt() ->> 'email') IN (SELECT email FROM admins) OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

-- 3. Grant basic read access to authenticated users (for User Dashboard via direct queries if any)
-- Assuming backend handles most user queries, but frontend might need basic read if we switch to client-side.
-- For now, backend handles user-side, so we focus on Admin access.
