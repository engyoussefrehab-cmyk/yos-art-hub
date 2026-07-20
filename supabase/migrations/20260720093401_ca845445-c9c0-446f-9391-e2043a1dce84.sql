
-- 1) cms_feature_flags: restrict SELECT to CMS managers only.
DROP POLICY IF EXISTS feature_flags_read ON public.cms_feature_flags;
CREATE POLICY feature_flags_read
  ON public.cms_feature_flags
  FOR SELECT
  TO authenticated
  USING (public.cms_can_manage());

-- 2) cms_forms: keep public rows readable, but hide webhook_url and webhook_secret
--    from anon/public by revoking column-level SELECT. Managers (authenticated)
--    keep full access via the existing cms_forms_manage policy + table grants.
REVOKE SELECT (webhook_url, webhook_secret) ON public.cms_forms FROM anon;
REVOKE SELECT (webhook_url, webhook_secret) ON public.cms_forms FROM PUBLIC;
