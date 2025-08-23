-- Enable real-time updates for platform statistics tables
ALTER TABLE public.platform_stats REPLICA IDENTITY FULL;
ALTER TABLE public.youtube_stats REPLICA IDENTITY FULL;
ALTER TABLE public.platform_audience REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER publication supabase_realtime ADD TABLE public.platform_stats;
ALTER publication supabase_realtime ADD TABLE public.youtube_stats;
ALTER publication supabase_realtime ADD TABLE public.platform_audience;