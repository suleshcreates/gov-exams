-- Add pdf_url to topics table
ALTER TABLE topics ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(500);

-- Create storage bucket for topic PDFs if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('topic-pdfs', 'topic-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for public read access to topic-pdfs
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'topic-pdfs' );

-- Policy for authenticated users to upload to topic-pdfs (Admin only in practice via backend)
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'topic-pdfs' AND auth.role() = 'authenticated' );
