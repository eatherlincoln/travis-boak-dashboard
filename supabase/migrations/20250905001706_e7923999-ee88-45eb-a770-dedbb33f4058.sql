-- Create thumbnails bucket for platform icons
INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', false);

-- Create policies for thumbnail access
CREATE POLICY "Allow public access to thumbnails" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'thumbnails');

CREATE POLICY "Allow authenticated uploads to thumbnails" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');