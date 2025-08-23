-- Create security definer function to get current user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
SET search_path = public
STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Update the user lincolneather@me.com to be admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'lincolneather@me.com'
);

-- Create RLS policy to prevent role changes except by admins
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- New policies: Users can update their profile EXCEPT role column
CREATE POLICY "Users can update their own profile (except role)" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  (role IS NULL OR role = OLD.role OR public.get_current_user_role() = 'admin')
);

-- Only admins can change roles
CREATE POLICY "Only admins can change user roles" 
ON public.profiles 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

-- Update the handle_new_user function to ensure new users get 'athlete' role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public 
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'athlete'  -- Always set new users as athletes
  );
  
  -- Insert default platform stats
  INSERT INTO public.platform_stats (user_id, platform, follower_count, monthly_views, engagement_rate) VALUES
  (NEW.id, 'instagram', 38700, 730000, 8.2),
  (NEW.id, 'youtube', 8800, 86800, 6.5),
  (NEW.id, 'tiktok', 1410, 37000, 9.1);
  
  RETURN NEW;
END;
$$;