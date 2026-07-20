
-- Tighten public read policies to avoid exposing draft/unpublished/config content

-- 1) cms_form_fields: only fields whose parent form is published & not deleted
DROP POLICY IF EXISTS cms_ff_public_read ON public.cms_form_fields;
CREATE POLICY cms_ff_public_read ON public.cms_form_fields
FOR SELECT TO public
USING (EXISTS (
  SELECT 1 FROM public.cms_forms f
  WHERE f.id = cms_form_fields.form_id
    AND f.workflow_state = 'published'
    AND f.deleted_at IS NULL
));

-- 2) Structural tables: no workflow_state — restrict public reads to active/default rows,
--    and remove public read where no such flag exists (managers keep full access via *_manage).
DROP POLICY IF EXISTS cms_dt_public_read ON public.cms_design_tokens;
CREATE POLICY cms_dt_public_read ON public.cms_design_tokens
FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS cms_tp_public_read ON public.cms_theme_presets;
CREATE POLICY cms_tp_public_read ON public.cms_theme_presets
FOR SELECT TO public USING (is_default = true);

DROP POLICY IF EXISTS cms_nav_public_read ON public.cms_navigations;
-- No published flag exists; navigations are surfaced via cms_navigation_items which enforces its own state.
-- Remove anon read entirely; managers retain access via cms_nav_manage.

DROP POLICY IF EXISTS cms_ct_public_read ON public.cms_category_templates;
-- Category templates are editorial defaults; not needed anonymously.

DROP POLICY IF EXISTS cms_cl_public_read ON public.cms_category_layouts;
-- Category layouts include draft block configs; not needed anonymously.

DROP POLICY IF EXISTS cms_rc_public_read ON public.cms_related_content;
CREATE POLICY cms_rc_public_read ON public.cms_related_content
FOR SELECT TO public USING (is_manual = true);

-- 3) insight_categories: only published, non-deleted rows visible publicly
DROP POLICY IF EXISTS "Anyone can view categories" ON public.insight_categories;
CREATE POLICY "Anyone can view categories" ON public.insight_categories
FOR SELECT TO public
USING (workflow_state = 'published' AND deleted_at IS NULL);
