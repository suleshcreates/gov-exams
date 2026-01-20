-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure topics table exists
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500),
    video_duration INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure user_topic_progress table exists
CREATE TABLE IF NOT EXISTS user_topic_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    is_video_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_watched_position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, topic_id)
);

-- Add topic_id to question_sets if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_sets' AND column_name = 'topic_id') THEN
        ALTER TABLE question_sets ADD COLUMN topic_id UUID REFERENCES topics(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_progress ENABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT ALL ON topics TO authenticated;
GRANT ALL ON user_topic_progress TO authenticated;
GRANT ALL ON question_sets TO authenticated;
GRANT ALL ON questions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Policies
DROP POLICY IF EXISTS "Public read access for topics" ON topics;
CREATE POLICY "Public read access for topics" ON topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access for topics" ON topics;
CREATE POLICY "Admin full access for topics" ON topics FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view own progress" ON user_topic_progress;
CREATE POLICY "Users can view own progress" ON user_topic_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON user_topic_progress;
CREATE POLICY "Users can update own progress" ON user_topic_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress update" ON user_topic_progress;
CREATE POLICY "Users can update own progress update" ON user_topic_progress FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all progress" ON user_topic_progress;
CREATE POLICY "Admins can view all progress" ON user_topic_progress FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
);
