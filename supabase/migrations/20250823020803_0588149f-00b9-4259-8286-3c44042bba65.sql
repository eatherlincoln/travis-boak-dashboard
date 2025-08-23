-- Add RLS policies for youtube_stats table
CREATE POLICY "Users can view YouTube stats" 
ON public.youtube_stats 
FOR SELECT 
USING (true); -- Public read access

CREATE POLICY "Only admins can insert YouTube stats" 
ON public.youtube_stats 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update YouTube stats" 
ON public.youtube_stats 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete YouTube stats" 
ON public.youtube_stats 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);