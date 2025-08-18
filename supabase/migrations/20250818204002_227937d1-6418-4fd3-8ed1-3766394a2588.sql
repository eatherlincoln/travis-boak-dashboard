-- Secure platform_stats by restricting public access
-- Drop the overly permissive policy that allows anyone to view all platform stats
DROP POLICY IF EXISTS "Anyone can view platform stats" ON public.platform_stats;

-- Create a secure policy that only allows users to view their own platform stats
CREATE POLICY "Users can view their own platform stats" 
ON public.platform_stats 
FOR SELECT 
USING (auth.uid() = user_id);