-- Run this script in the Supabase SQL Editor to allow users to delete their own accounts safely

CREATE OR REPLACE FUNCTION delete_current_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the user from auth.users
  -- This relies on ON DELETE CASCADE in the profiles table to automatically clean up their profile data
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
