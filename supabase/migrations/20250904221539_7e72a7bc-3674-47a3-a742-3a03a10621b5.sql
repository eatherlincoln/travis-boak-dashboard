-- Create main analytics table for admin writes
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  metric TEXT NOT NULL,
  value NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on main analytics table
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Only admins can insert/update/delete analytics data
CREATE POLICY "Only admins can manage analytics" 
ON public.analytics 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Users can view analytics data
CREATE POLICY "Users can view analytics" 
ON public.analytics 
FOR SELECT 
USING (true);

-- Public snapshot table the front end will read
CREATE TABLE IF NOT EXISTS public.analytics_public (
  source TEXT NOT NULL,
  metric TEXT NOT NULL,
  value NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (source, metric)
);

-- Enable RLS on public snapshot table
ALTER TABLE public.analytics_public ENABLE ROW LEVEL SECURITY;

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

-- Create trigger to auto-sync data
CREATE TRIGGER trg_sync_analytics_public
AFTER INSERT OR UPDATE ON public.analytics
FOR EACH ROW EXECUTE FUNCTION public.sync_analytics_public();

-- Add trigger for updating updated_at timestamp
CREATE TRIGGER update_analytics_updated_at
BEFORE UPDATE ON public.analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();