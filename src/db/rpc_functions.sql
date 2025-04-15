
-- Function to update user location
CREATE OR REPLACE FUNCTION public.update_user_location(
  user_id UUID,
  user_latitude DOUBLE PRECISION,
  user_longitude DOUBLE PRECISION
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    latitude = user_latitude,
    longitude = user_longitude,
    updated_at = now()
  WHERE id = user_id;
END;
$$;

-- Function to create a profile with a specific ID
CREATE OR REPLACE FUNCTION public.create_profile_with_id(
  profile_id uuid,
  first_name_val text,
  last_name_val text,
  role_val user_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    profile_id,
    first_name_val,
    last_name_val,
    role_val,
    now(),
    now()
  );
END;
$$;
