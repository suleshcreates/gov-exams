-- Run this SQL command in your Supabase SQL Editor to add the explanation column
ALTER TABLE questions 
ADD COLUMN explanation TEXT;

-- Optional: Add a comment to the column
COMMENT ON COLUMN questions.explanation IS 'Explanation for the correct answer';
