-- Create a new storage bucket for topic videos (Idempotent)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('topic-videos', 'topic-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Policies (Drop first to allow re-running script)

-- Policy to allow public access to view videos
DROP POLICY IF EXISTS "Public Videos" ON storage.objects;
CREATE POLICY "Public Videos" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'topic-videos' );

-- Policy to allow authenticated users (admins) to upload videos
DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;
CREATE POLICY "Authenticated Uploads" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'topic-videos' AND auth.role() = 'authenticated' );

-- Policy to allow authenticated users (admins) to update videos
DROP POLICY IF EXISTS "Authenticated Updates" ON storage.objects;
CREATE POLICY "Authenticated Updates" 
ON storage.objects FOR UPDATE 
WITH CHECK ( bucket_id = 'topic-videos' AND auth.role() = 'authenticated' );

-- Policy to allow authenticated users (admins) to delete videos
DROP POLICY IF EXISTS "Authenticated Deletes" ON storage.objects;
CREATE POLICY "Authenticated Deletes" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'topic-videos' AND auth.role() = 'authenticated' );
