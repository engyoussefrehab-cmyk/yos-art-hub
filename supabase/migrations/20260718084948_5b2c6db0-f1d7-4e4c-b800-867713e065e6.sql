
-- ============ project_categories ============
CREATE TABLE public.project_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  description_ar text,
  description_en text,
  icon text,
  cover_image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_hidden boolean NOT NULL DEFAULT false,
  seo_title_ar text,
  seo_title_en text,
  seo_description_ar text,
  seo_description_en text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.project_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_categories TO authenticated;
GRANT ALL ON public.project_categories TO service_role;

ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read"
  ON public.project_categories FOR SELECT
  TO anon, authenticated
  USING (is_hidden = false OR private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "categories_admin_write"
  ON public.project_categories FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'editor'::app_role));

CREATE TRIGGER project_categories_updated_at
  BEFORE UPDATE ON public.project_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX project_categories_sort_idx ON public.project_categories (sort_order, name_en);

-- Seed initial categories (matches existing hardcoded ones + expansions)
INSERT INTO public.project_categories (slug, name_ar, name_en, description_ar, description_en, sort_order) VALUES
  ('branding', 'الهوية البصرية', 'Visual Identity', 'هويات بصرية استراتيجية.', 'Strategic visual identities.', 1),
  ('logos', 'الشعارات', 'Logos', 'شعارات دقيقة.', 'Precise logos.', 2),
  ('profiles', 'ملفات الشركات', 'Company Profiles', 'ملفات شركات مقنعة.', 'Compelling company profiles.', 3),
  ('social', 'سوشيال ميديا', 'Social Media', 'منشورات إبداعية.', 'Creative social posts.', 4),
  ('presentations', 'العروض التقديمية', 'Presentations', 'عروض تقديمية احترافية.', 'Professional presentations.', 5),
  ('packaging', 'التغليف', 'Packaging', 'تصميم تغليف مميز.', 'Distinctive packaging design.', 6);

-- ============ portfolio_projects extensions ============
ALTER TABLE public.portfolio_projects
  ADD COLUMN category_id uuid REFERENCES public.project_categories(id) ON DELETE SET NULL,
  ADD COLUMN client_country text,
  ADD COLUMN year integer,
  ADD COLUMN duration text,
  ADD COLUMN role text,
  ADD COLUMN team text,
  ADD COLUMN completed_at date,
  ADD COLUMN is_confidential boolean NOT NULL DEFAULT false,
  ADD COLUMN is_archived boolean NOT NULL DEFAULT false,
  ADD COLUMN is_pinned boolean NOT NULL DEFAULT false,
  ADD COLUMN hero_image_url text,
  ADD COLUMN thumbnail_url text,
  ADD COLUMN videos jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN embeds jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN pdf_url text,
  ADD COLUMN behance_url text,
  ADD COLUMN figma_url text,
  ADD COLUMN brand_colors jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN typography jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN deliverables jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN stats jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN testimonial jsonb,
  ADD COLUMN layout_blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN tags_list text[] NOT NULL DEFAULT '{}',
  ADD COLUMN views_count integer NOT NULL DEFAULT 0,
  ADD COLUMN scheduled_at timestamptz;

-- Allow 'scheduled' status
ALTER TABLE public.portfolio_projects DROP CONSTRAINT IF EXISTS portfolio_projects_status_check;
ALTER TABLE public.portfolio_projects
  ADD CONSTRAINT portfolio_projects_status_check
  CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'scheduled'::text, 'archived'::text]));

CREATE INDEX portfolio_projects_category_id_idx ON public.portfolio_projects (category_id);
CREATE INDEX portfolio_projects_featured_idx ON public.portfolio_projects (featured, published_at DESC) WHERE status = 'published';
CREATE INDEX portfolio_projects_pinned_idx ON public.portfolio_projects (is_pinned, sort_order);

-- Backfill category_id from existing category_slug
UPDATE public.portfolio_projects p
SET category_id = c.id
FROM public.project_categories c
WHERE p.category_slug = c.slug AND p.category_id IS NULL;
