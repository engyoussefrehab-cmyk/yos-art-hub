REVOKE SELECT (notification_emails) ON public.cms_forms FROM anon;
REVOKE SELECT (notification_emails) ON public.cms_forms FROM authenticated;
GRANT SELECT (notification_emails) ON public.cms_forms TO service_role;