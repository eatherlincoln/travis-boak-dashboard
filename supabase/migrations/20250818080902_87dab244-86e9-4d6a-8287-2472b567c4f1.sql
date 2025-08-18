-- Fix YouTube stats security vulnerability by restricting access to authenticated users only

-- Drop the existing public read policy
DROP POLICY IF EXISTS "YouTube stats are publicly readable" ON public.youtube_stats;

-- Create a new policy that only allows authenticated users to read their own channel's stats
-- Since this appears to be a single-user application with one YouTube channel, 
-- we'll allow any authenticated user to read the stats
CREATE POLICY "Authenticated users can view YouTube stats" 
ON public.youtube_stats 
FOR SELECT 
TO authenticated
USING (true);

-- Keep the system management policy for edge functions
-- This allows the edge functions to insert/update stats data