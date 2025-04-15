
CREATE OR REPLACE FUNCTION public.create_profile_with_id(
  profile_id uuid,
  first_name_val text,
  last_name_val text,
  role_val user_role
) RETURNS void
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
