
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.cms_is_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.cms_can_manage() FROM PUBLIC, anon;
