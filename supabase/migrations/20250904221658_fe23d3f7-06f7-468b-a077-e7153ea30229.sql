-- Create public snapshot table the front end will read (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.analytics_public (
  source TEXT NOT NULL,
  metric TEXT NOT NULL,
  value NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (source, metric)
);

-- Enable RLS on public snapshot table
ALTER TABLE public.analytics_public ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist for analytics_public
DROP POLICY IF EXISTS "Public analytics are viewable by everyone" ON public.analytics_public;
DROP POLICY IF EXISTS "Only admins can manage public analytics" ON public.analytics_public;

-- Everyone can read the public analytics snapshot
CREATE POLICY "Public analytics are viewable by everyone" 
ON public.analytics_public 
FOR SELECT 
USING (true);

-- Only admins can modify the public snapshot (though this will mostly be done via triggers)
CREATE POLICY "Only admins can manage public analytics" 
ON public.analytics_public 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Trigger function to keep snapshot in sync on every insert/update
CREATE OR REPLACE FUNCTION public.sync_analytics_public()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.analytics_public AS ap (source, metric, value, updated_at)
  VALUES (NEW.source, NEW.metric, NEW.value, COALESCE(NEW.updated_at, now()))
  ON CONFLICT (source, metric)
  DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = EXCLUDED.updated_at;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trg_sync_analytics_public ON public.analytics;

-- Create trigger to auto-sync data from analytics to analytics_public
CREATE TRIGGER trg_sync_analytics_public
AFTER INSERT OR UPDATE ON public.analytics
FOR EACH ROW EXECUTE FUNCTION public.sync_analytics_public();