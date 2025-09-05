-- Create table to track social media asset paths and versions
CREATE TABLE IF NOT EXISTS public.social_media_assets (
  source TEXT PRIMARY KEY,            -- 'instagram' | 'youtube' | 'tiktok'
  thumb_path TEXT NOT NULL,           -- storage path like thumbnails/insta.jpg
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.social_media_assets ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read assets
CREATE POLICY "read_assets" ON public.social_media_assets 
FOR SELECT TO authenticated 
USING (true);

-- Create policy for admins to manage assets
CREATE POLICY "admins_manage_assets" ON public.social_media_assets 
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Insert default asset paths for existing platforms
INSERT INTO public.social_media_assets (source, thumb_path) VALUES
  ('instagram', 'thumbnails/instagram-icon.png'),
  ('youtube', 'thumbnails/youtube-icon.png'),
  ('tiktok', 'thumbnails/tiktok-icon.png')
ON CONFLICT (source) DO NOTHING;

-- Create function to update asset timestamp when path changes
CREATE OR REPLACE FUNCTION public.update_asset_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;