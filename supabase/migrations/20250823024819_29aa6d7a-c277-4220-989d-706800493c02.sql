-- Add user_id column to youtube_stats table for proper access control
ALTER TABLE public.youtube_stats 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing records to associate with a user (if any exist)
-- This assumes there's at least one user in profiles table
UPDATE public.youtube_stats 
SET user_id = (SELECT id FROM public.profiles LIMIT 1)
WHERE user_id IS NULL;

-- Make user_id NOT NULL to ensure all future records have proper ownership
ALTER TABLE public.youtube_stats 
ALTER COLUMN user_id SET NOT NULL;

-- Update the RLS policy to restrict access to user's own data
DROP POLICY IF EXISTS "Users can view YouTube stats" ON public.youtube_stats;

CREATE POLICY "Users can view their own YouTube stats" 
ON public.youtube_stats 
FOR SELECT 
USING (auth.uid() = user_id);

-- Keep admin policies for management
-- (These are already properly restricted to admin role)