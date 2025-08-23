-- Harden function search_path to avoid mutable path issues
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

-- Ensure handle_new_user also has a fixed search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'athlete'
  );

  -- Insert default platform stats
  INSERT INTO public.platform_stats (user_id, platform, follower_count, monthly_views, engagement_rate) VALUES
  (NEW.id, 'instagram', 38700, 730000, 8.2),
  (NEW.id, 'youtube', 8800, 86800, 6.5),
  (NEW.id, 'tiktok', 1410, 37000, 9.1);

  RETURN NEW;
END;
$$;