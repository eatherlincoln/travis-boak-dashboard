-- Create table for individual Instagram post metrics
CREATE TABLE IF NOT EXISTS public.instagram_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_url TEXT NOT NULL,
  image_url TEXT,
  title TEXT NOT NULL,
  content_type TEXT DEFAULT 'image' CHECK (content_type IN ('image', 'video', 'carousel', 'story')),
  
  -- Engagement metrics
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  
  -- Reach and impressions
  reach_count INTEGER DEFAULT 0,
  impressions_count INTEGER DEFAULT 0,
  
  -- Post metadata
  posted_at TIMESTAMP WITH TIME ZONE,
  hashtags TEXT[],
  
  -- Calculated fields
  engagement_rate NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN reach_count > 0 THEN 
        ((likes_count + comments_count + COALESCE(shares_count, 0) + COALESCE(saves_count, 0))::NUMERIC / reach_count::NUMERIC) * 100
      ELSE 0
    END
  ) STORED,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own posts" 
ON public.instagram_posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own posts" 
ON public.instagram_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.instagram_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.instagram_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_instagram_posts_updated_at
BEFORE UPDATE ON public.instagram_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_instagram_posts_user_engagement 
ON public.instagram_posts (user_id, engagement_rate DESC);

-- Add comment for documentation
COMMENT ON TABLE public.instagram_posts IS 'Individual Instagram post performance metrics and metadata';