
DROP POLICY IF EXISTS cms_rc_public_read ON public.cms_related_content;

CREATE OR REPLACE FUNCTION public.cms_entity_is_public(_entity_type text, _entity_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_ok boolean := false;
BEGIN
  CASE _entity_type
    WHEN 'portfolio_project', 'portfolio_projects', 'project' THEN
      SELECT EXISTS (SELECT 1 FROM public.portfolio_projects
        WHERE id = _entity_id AND workflow_state = 'published' AND deleted_at IS NULL) INTO v_ok;
    WHEN 'insight_article', 'insight_articles', 'article' THEN
      SELECT EXISTS (SELECT 1 FROM public.insight_articles
        WHERE id = _entity_id AND workflow_state = 'published' AND deleted_at IS NULL) INTO v_ok;
    WHEN 'service', 'services' THEN
      SELECT EXISTS (SELECT 1 FROM public.services
        WHERE id = _entity_id AND workflow_state = 'published' AND deleted_at IS NULL) INTO v_ok;
    WHEN 'page', 'pages' THEN
      SELECT EXISTS (SELECT 1 FROM public.pages
        WHERE id = _entity_id AND workflow_state = 'published' AND deleted_at IS NULL) INTO v_ok;
    WHEN 'project_category', 'project_categories', 'category' THEN
      SELECT EXISTS (SELECT 1 FROM public.project_categories
        WHERE id = _entity_id AND COALESCE(is_visible, true) = true) INTO v_ok;
    WHEN 'insight_category', 'insight_categories' THEN
      SELECT EXISTS (SELECT 1 FROM public.insight_categories
        WHERE id = _entity_id) INTO v_ok;
    ELSE
      v_ok := false;
  END CASE;
  RETURN COALESCE(v_ok, false);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cms_entity_is_public(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cms_entity_is_public(text, uuid) TO anon, authenticated;

CREATE POLICY cms_rc_public_read
ON public.cms_related_content
FOR SELECT
USING (
  is_manual = true
  AND public.cms_entity_is_public(source_entity_type, source_entity_id)
  AND public.cms_entity_is_public(target_entity_type, target_entity_id)
);
