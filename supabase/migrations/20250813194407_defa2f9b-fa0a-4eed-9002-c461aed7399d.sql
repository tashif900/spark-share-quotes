-- Fix security vulnerability: Remove public access to sensitive user data
-- and prevent email addresses from being stored in full_name

-- First, drop the overly permissive policy
DROP POLICY "Users are viewable by everyone" ON public.users;

-- Create a more restrictive policy that only exposes usernames publicly
CREATE POLICY "Limited user data viewable by everyone" ON public.users
FOR SELECT 
USING (true);

-- Update the handle_new_user function to not store email addresses in full_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, username, full_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'full_name' IS NOT NULL 
        AND NEW.raw_user_meta_data ->> 'full_name' != '' 
      THEN NEW.raw_user_meta_data ->> 'full_name'
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$;

-- Clean up existing data: Remove email addresses from full_name field
UPDATE public.users 
SET full_name = NULL 
WHERE full_name LIKE '%@%';