-- Secure youtube_stats by removing permissive public access
-- Ensure RLS is enabled
ALTER TABLE public.youtube_stats ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view YouTube stats" ON public.youtube_stats;
DROP POLICY IF EXISTS "System can manage YouTube stats" ON public.youtube_stats;

-- Intentionally do NOT add a new SELECT policy so table data is not readable by clients
-- Service role (used by Edge Functions) bypasses RLS, so inserts/updates remain functional.