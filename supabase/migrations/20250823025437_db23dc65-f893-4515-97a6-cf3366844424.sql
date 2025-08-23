-- Update the handle_new_user function to no longer insert email addresses
-- Since we removed email from profiles table for security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  
  -- Insert default platform stats (keep existing functionality)
  INSERT INTO public.platform_stats (user_id, platform, follower_count, monthly_views, engagement_rate) VALUES
  (NEW.id, 'instagram', 38700, 730000, 8.2),
  (NEW.id, 'youtube', 8800, 86800, 6.5),
  (NEW.id, 'tiktok', 1410, 37000, 9.1);
  
  RETURN NEW;
END;
$function$