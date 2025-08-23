-- Security Enhancement: Remove email column from profiles table
-- Since the application doesn't use profiles and emails are already in auth.users,
-- we can eliminate this potential exposure vector

-- First, let's see what data we have
-- (This is just for verification - emails will still be available in auth.users)

-- Remove the email column entirely from profiles table
-- This eliminates the email exposure risk while maintaining user profiles functionality
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Add a comment explaining why we removed it
COMMENT ON TABLE public.profiles IS 'User profile data. Email addresses are stored in auth.users for security.';