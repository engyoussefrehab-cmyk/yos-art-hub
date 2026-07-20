
-- Tighten public SELECT policies to exclude soft-deleted / hidden rows
DROP POLICY IF EXISTS "Public can view published articles" ON public.insight_articles;
CREATE POLICY "Public can view published articles" ON public.insight_articles
  FOR SELECT USING (
    status <> 'draft'::article_status
    AND published_at IS NOT NULL
    AND published_at <= now()
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS pages_public_read_published ON public.pages;
CREATE POLICY pages_public_read_published ON public.pages
  FOR SELECT USING (
    status = 'published'::text
    AND (published_at IS NULL OR published_at <= now())
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS services_public_read_published ON public.services;
CREATE POLICY services_public_read_published ON public.services
  FOR SELECT USING (
    status = 'published'::text
    AND (published_at IS NULL OR published_at <= now())
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS projects_public_read_published ON public.portfolio_projects;
CREATE POLICY projects_public_read_published ON public.portfolio_projects
  FOR SELECT USING (
    status = 'published'::text
    AND (published_at IS NULL OR published_at <= now())
    AND deleted_at IS NULL
    AND is_confidential = false
    AND is_hidden = false
    AND is_archived = false
  );

-- Revoke EXECUTE on trigger-only SECURITY DEFINER functions.
-- These are invoked by triggers (running as owner) and by other SECURITY
-- DEFINER functions — no direct anon/authenticated call is required.
REVOKE EXECUTE ON FUNCTION public.cms_emit_event(text, text, uuid, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cms_emit_form_submitted() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cms_emit_lead_created() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cms_emit_media_deleted() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cms_emit_workflow_event() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cms_write_revision() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cms_suggest_nav_item() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cms_form_submission_to_lead() FROM PUBLIC, anon, authenticated;
