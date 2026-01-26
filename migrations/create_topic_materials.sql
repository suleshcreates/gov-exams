-- Create topic_materials table
CREATE TABLE IF NOT EXISTS topic_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('video', 'pdf')),
    title VARCHAR(255) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_topic_materials_topic_id ON topic_materials(topic_id);

-- RLS Policies (Enable RLS)
ALTER TABLE topic_materials ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public Read Access"
ON topic_materials FOR SELECT
USING (true);

-- Admin write access (Assuming service_role or admin user via backend, but adding basic auth policy)
CREATE POLICY "Authenticated Insert"
ON topic_materials FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated Update"
ON topic_materials FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated Delete"
ON topic_materials FOR DELETE
USING (auth.role() = 'authenticated');
