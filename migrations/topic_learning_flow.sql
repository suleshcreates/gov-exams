-- Migration for Topic-Based Learning Flow

-- 1. Create Topics Table
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500), -- YouTube URL or similar
    video_duration INTEGER DEFAULT 0, -- Duration in seconds
    order_index INTEGER DEFAULT 0, -- For sorting topics within a subject
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create User Topic Progress Table
CREATE TABLE IF NOT EXISTS user_topic_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Assuming auth.users is the standard Supabase user table
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    is_video_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_watched_position INTEGER DEFAULT 0, -- Store where they left off (seconds)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, topic_id) -- One progress record per user per topic
);

-- 3. Update Question Sets to belong to Topics
-- We make it nullable initially to avoid breaking existing data, but eventually all sets should belong to a topic
ALTER TABLE question_sets ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES topics(id) ON DELETE SET NULL;

-- 4. Enable RLS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_progress ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Topics: Public read access, Admin write access
DROP POLICY IF EXISTS "Public read access for topics" ON topics;
CREATE POLICY "Public read access for topics" ON topics
    FOR SELECT USING (true); -- Or restricted to active subscriptions if needed

DROP POLICY IF EXISTS "Admin full access for topics" ON topics;
CREATE POLICY "Admin full access for topics" ON topics
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) 
        OR 
        (auth.jwt() ->> 'role' = 'admin') -- Fallback check
    );

-- User Progress: Users can read/write their own progress
DROP POLICY IF EXISTS "Users can view own progress" ON user_topic_progress;
CREATE POLICY "Users can view own progress" ON user_topic_progress
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON user_topic_progress;
CREATE POLICY "Users can update own progress" ON user_topic_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
DROP POLICY IF EXISTS "Users can update own progress update" ON user_topic_progress;
CREATE POLICY "Users can update own progress update" ON user_topic_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin can view all progress
DROP POLICY IF EXISTS "Admins can view all progress" ON user_topic_progress;
CREATE POLICY "Admins can view all progress" ON user_topic_progress
    FOR ALL USING (
         EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) 
         OR 
         (auth.jwt() ->> 'role' = 'admin')
    );
