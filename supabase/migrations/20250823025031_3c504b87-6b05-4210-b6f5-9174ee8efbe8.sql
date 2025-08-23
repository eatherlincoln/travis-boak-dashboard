-- Clean up duplicate records by keeping only the most recent one per user+channel
WITH duplicates AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, channel_id 
      ORDER BY updated_at DESC, created_at DESC
    ) as rn
  FROM public.youtube_stats
)
DELETE FROM public.youtube_stats 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Now add the unique constraint
ALTER TABLE public.youtube_stats 
ADD CONSTRAINT youtube_stats_user_channel_unique 
UNIQUE (user_id, channel_id);