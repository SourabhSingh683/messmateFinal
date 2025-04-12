
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
