-- Update RLS policy to allow public read access to platform stats
DROP POLICY IF EXISTS "Users can manage their own platform stats" ON public.platform_stats;

-- Create separate policies for different operations
CREATE POLICY "Anyone can view platform stats" 
ON public.platform_stats 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own platform stats" 
ON public.platform_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own platform stats" 
ON public.platform_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own platform stats" 
ON public.platform_stats 
FOR DELETE 
USING (auth.uid() = user_id);