-- Create table for platform audience demographics
CREATE TABLE IF NOT EXISTS public.platform_audience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  gender JSONB DEFAULT '{"men":88, "women":12}'::jsonb,
  age_groups JSONB DEFAULT '[{"range":"25-34","percentage":31},{"range":"18-24","percentage":22},{"range":"35-44","percentage":21},{"range":"45-54","percentage":16}]'::jsonb,
  countries JSONB DEFAULT '[{"country":"Australia","percentage":51},{"country":"USA","percentage":10},{"country":"Japan","percentage":6},{"country":"Brazil","percentage":5}]'::jsonb,
  cities JSONB DEFAULT '["Sydney","Gold Coast","Melbourne","Sunshine Coast"]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable Row Level Security
ALTER TABLE public.platform_audience ENABLE ROW LEVEL SECURITY;

-- Policies: users can CRUD their own audience data
CREATE POLICY "Users can view their own audience data"
ON public.platform_audience
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audience data"
ON public.platform_audience
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audience data"
ON public.platform_audience
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audience data"
ON public.platform_audience
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to update updated_at automatically
DROP TRIGGER IF EXISTS update_platform_audience_updated_at ON public.platform_audience;
CREATE TRIGGER update_platform_audience_updated_at
BEFORE UPDATE ON public.platform_audience
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();