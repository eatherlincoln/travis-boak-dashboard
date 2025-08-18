-- Create table for YouTube channel stats
CREATE TABLE public.youtube_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id TEXT NOT NULL,
  subscriber_count BIGINT,
  view_count BIGINT,
  video_count INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.youtube_stats ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading stats publicly
CREATE POLICY "YouTube stats are publicly readable" 
ON public.youtube_stats 
FOR SELECT 
USING (true);

-- Create policy to allow system to insert/update stats
CREATE POLICY "System can manage YouTube stats" 
ON public.youtube_stats 
FOR ALL 
USING (true);

-- Create index for efficient queries
CREATE INDEX idx_youtube_stats_channel_id ON public.youtube_stats(channel_id);
CREATE INDEX idx_youtube_stats_updated_at ON public.youtube_stats(updated_at);

-- Enable pg_cron and pg_net extensions for scheduled functions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;