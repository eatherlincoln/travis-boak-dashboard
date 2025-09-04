-- Security hardening: Lock reads to authenticated clients; writes remain server-only via service role

-- Ensure RLS is enabled on public snapshot table
ALTER TABLE public.analytics_public ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and create secure read policy
DROP POLICY IF EXISTS "Public analytics are viewable by everyone" ON public.analytics_public;
DROP POLICY IF EXISTS "Only admins can manage public analytics" ON public.analytics_public;
DROP POLICY IF EXISTS "read_analytics_public" ON public.analytics_public;

-- Only authenticated users can read the public snapshot
CREATE POLICY "read_analytics_public"
ON public.analytics_public
FOR SELECT
TO authenticated
USING (true);

-- Server-only writes (service role bypasses RLS, so no policy needed for writes)

-- Ensure RLS is enabled on raw analytics table  
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Remove any existing client-side policies on raw table
DROP POLICY IF EXISTS "Only admins can manage analytics" ON public.analytics;
DROP POLICY IF EXISTS "Users can view analytics" ON public.analytics;
DROP POLICY IF EXISTS "insert_analytics_client" ON public.analytics;
DROP POLICY IF EXISTS "update_analytics_client" ON public.analytics;

-- NO client-side policies on raw analytics table
-- Only service role (edge function) can write to this table
-- Service role bypasses RLS, so no policies needed for server writes

-- Optional: Add a read policy for authenticated admins to view raw data if needed
CREATE POLICY "read_analytics_admin"
ON public.analytics
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);