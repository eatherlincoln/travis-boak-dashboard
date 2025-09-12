-- Fix critical privilege escalation vulnerability
-- Remove ability for users to modify their own roles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new secure policy that prevents role modification by users
CREATE POLICY "Users can update their own profile (no role changes)" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- Create admin-only policy for role management
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Fix analytics table security - add missing policies
CREATE POLICY "Only admins can insert analytics" 
ON public.analytics 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update analytics" 
ON public.analytics 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete analytics" 
ON public.analytics 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Add explicit anonymous denial policies for sensitive tables
CREATE POLICY "Deny anonymous access to profiles" 
ON public.profiles 
FOR ALL 
TO anon 
USING (false);

CREATE POLICY "Deny anonymous access to analytics" 
ON public.analytics 
FOR ALL 
TO anon 
USING (false);

CREATE POLICY "Deny anonymous access to platform_stats" 
ON public.platform_stats 
FOR ALL 
TO anon 
USING (false);

CREATE POLICY "Deny anonymous access to platform_audience" 
ON public.platform_audience 
FOR ALL 
TO anon 
USING (false);

CREATE POLICY "Deny anonymous access to instagram_posts" 
ON public.instagram_posts 
FOR ALL 
TO anon 
USING (false);

CREATE POLICY "Deny anonymous access to youtube_stats" 
ON public.youtube_stats 
FOR ALL 
TO anon 
USING (false);

-- Add role validation constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_roles 
CHECK (role IN ('admin', 'athlete'));

-- Create audit log for role changes
CREATE TABLE IF NOT EXISTS public.role_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  old_role text,
  new_role text NOT NULL,
  changed_by uuid NOT NULL,
  changed_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.role_change_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit log
CREATE POLICY "Only admins can view role changes" 
ON public.role_change_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.role_change_log (user_id, old_role, new_role, changed_by)
    VALUES (NEW.id, OLD.role, NEW.role, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role change logging
CREATE TRIGGER role_change_audit
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_change();