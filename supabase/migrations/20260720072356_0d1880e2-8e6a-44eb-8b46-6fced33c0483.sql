
REVOKE ALL ON FUNCTION public.cms_write_revision() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cms_suggest_nav_item() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cms_form_submission_to_lead() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cms_is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cms_can_manage() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cms_emit_workflow_event() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cms_emit_lead_created() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cms_emit_form_submitted() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cms_emit_media_deleted() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cms_emit_event(text, text, uuid, jsonb) FROM PUBLIC, anon;

-- has_role helpers must stay callable for authenticated users (used by RLS policies via SECURITY DEFINER chain)
GRANT EXECUTE ON FUNCTION public.cms_is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.cms_can_manage() TO authenticated, service_role;
