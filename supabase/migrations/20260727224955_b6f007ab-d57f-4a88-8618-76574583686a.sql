DROP POLICY IF EXISTS "categories_public_read" ON public.project_categories;
CREATE POLICY "categories_public_read" ON public.project_categories
FOR SELECT USING (
  COALESCE(is_hidden, false) = false
  AND workflow_state = 'published'
  AND deleted_at IS NULL
);

DROP POLICY IF EXISTS "site_menus public read visible" ON public.site_menus;
CREATE POLICY "site_menus public read visible" ON public.site_menus
FOR SELECT USING (
  is_visible = true
  AND workflow_state = 'published'
  AND deleted_at IS NULL
);

DROP POLICY IF EXISTS "site_sections public read visible" ON public.site_sections;
CREATE POLICY "site_sections public read visible" ON public.site_sections
FOR SELECT USING (
  is_visible = true
  AND workflow_state = 'published'
  AND deleted_at IS NULL
);

DROP POLICY IF EXISTS "testimonials public read visible" ON public.testimonials;
CREATE POLICY "testimonials public read visible" ON public.testimonials
FOR SELECT USING (
  is_visible = true
  AND workflow_state = 'published'
  AND deleted_at IS NULL
);