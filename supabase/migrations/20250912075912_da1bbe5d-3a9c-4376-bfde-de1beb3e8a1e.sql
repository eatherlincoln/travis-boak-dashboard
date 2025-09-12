-- Fix remaining security warnings

-- 1. Fix function search path security issues
-- Update existing functions to have secure search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.sync_analytics_public()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  insert into public.analytics_public as ap (source, metric, value, updated_at)
  values (new.source, new.metric, new.value, coalesce(new.updated_at, now()))
  on conflict (source, metric)
  do update set
    value = excluded.value,
    updated_at = excluded.updated_at;
  return new;
end; 
$function$;

CREATE OR REPLACE FUNCTION public.update_asset_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_instagram_posts_public()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  insert into public.instagram_posts_public as p (
    media_id, caption, permalink, media_url, like_count, comment_count, reach, saves, timestamp, updated_at
  )
  values (
    new.media_id, new.caption, new.permalink, new.media_url, new.like_count, new.comment_count, new.reach, new.saves, new.timestamp, coalesce(new.updated_at, now())
  )
  on conflict (media_id) do update set
    caption       = excluded.caption,
    permalink     = excluded.permalink,
    media_url     = excluded.media_url,
    like_count    = excluded.like_count,
    comment_count = excluded.comment_count,
    reach         = excluded.reach,
    saves         = excluded.saves,
    timestamp     = excluded.timestamp,
    updated_at    = excluded.updated_at;
  return new;
end; 
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.role_change_log (user_id, old_role, new_role, changed_by)
    VALUES (NEW.id, OLD.role, NEW.role, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Move extensions out of public schema (if any exist)
-- This will identify and move extensions as needed
DO $$
DECLARE
    ext_record RECORD;
BEGIN
    -- Get all extensions in public schema
    FOR ext_record IN 
        SELECT extname 
        FROM pg_extension e 
        JOIN pg_namespace n ON e.extnamespace = n.oid 
        WHERE n.nspname = 'public'
        AND extname NOT IN ('plpgsql') -- Skip essential extensions
    LOOP
        -- Move extension to extensions schema
        EXECUTE format('CREATE SCHEMA IF NOT EXISTS extensions');
        EXECUTE format('ALTER EXTENSION %I SET SCHEMA extensions', ext_record.extname);
    END LOOP;
END $$;