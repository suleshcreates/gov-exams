-- Migration: Add user_answers column to exam_results table
-- Run this if you already created the exam_results table without the user_answers column

-- Add user_answers column if it doesn't exist
ALTER TABLE exam_results 
ADD COLUMN IF NOT EXISTS user_answers JSONB DEFAULT '[]'::jsonb;

-- This migration is safe to run multiple times (idempotent)
-- It will only add the column if it doesn't already exist


