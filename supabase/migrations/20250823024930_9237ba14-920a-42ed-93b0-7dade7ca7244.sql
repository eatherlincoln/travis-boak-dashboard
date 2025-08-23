-- Create unique constraint on user_id + channel_id combination
-- This ensures each user can only have one record per YouTube channel
ALTER TABLE public.youtube_stats 
ADD CONSTRAINT youtube_stats_user_channel_unique 
UNIQUE (user_id, channel_id);