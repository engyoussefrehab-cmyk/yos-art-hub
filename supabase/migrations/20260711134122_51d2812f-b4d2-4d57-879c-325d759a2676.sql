-- Revoke default PUBLIC execute on internal SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.bootstrap_admin() FROM PUBLIC, anon;

-- Grant execute only where required
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_admin() TO authenticated;

-- update_updated_at_column runs via trigger under the definer's rights,
-- so no user role needs EXECUTE on it.