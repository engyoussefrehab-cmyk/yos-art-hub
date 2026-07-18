
-- =========================
-- 1. site_sections
-- =========================
CREATE TABLE IF NOT EXISTS public.site_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,           -- 'home', 'projects', 'contact', 'insights', 'packages', 'footer', 'header', 'about'
  section_key text NOT NULL,        -- 'hero', 'about', 'featured', 'stats', 'cta', 'newsletter', ...
  layout_variant text NOT NULL DEFAULT 'default',
  order_index int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,   -- { title_ar, title_en, subtitle_ar, subtitle_en, image_url, cta:[{...}], blocks:[...] }
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page_key, section_key)
);
CREATE INDEX IF NOT EXISTS idx_site_sections_page ON public.site_sections (page_key, order_index);

GRANT SELECT ON public.site_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_sections TO authenticated;
GRANT ALL ON public.site_sections TO service_role;

ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_sections public read visible"
  ON public.site_sections FOR SELECT
  USING (is_visible = true);

CREATE POLICY "site_sections admin read all"
  ON public.site_sections FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "site_sections admin write"
  ON public.site_sections FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_site_sections_updated
  BEFORE UPDATE ON public.site_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- 2. site_menus
-- =========================
CREATE TABLE IF NOT EXISTS public.site_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,           -- 'header', 'footer_primary', 'footer_secondary', 'mobile'
  label_ar text NOT NULL,
  label_en text NOT NULL,
  url text NOT NULL,
  order_index int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  is_external boolean NOT NULL DEFAULT false,
  open_in_new_tab boolean NOT NULL DEFAULT false,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_site_menus_loc ON public.site_menus (location, order_index);

GRANT SELECT ON public.site_menus TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_menus TO authenticated;
GRANT ALL ON public.site_menus TO service_role;

ALTER TABLE public.site_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_menus public read visible"
  ON public.site_menus FOR SELECT
  USING (is_visible = true);

CREATE POLICY "site_menus admin write"
  ON public.site_menus FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_site_menus_updated
  BEFORE UPDATE ON public.site_menus
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- 3. testimonials
-- =========================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text,
  role_ar text,
  role_en text,
  text_ar text NOT NULL,
  text_en text,
  rating numeric(2,1) NOT NULL DEFAULT 5.0,
  source text,                    -- 'mostaql', 'direct', 'linkedin', ...
  source_url text,
  avatar_url text,
  is_verified boolean NOT NULL DEFAULT true,
  is_visible boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  order_index int NOT NULL DEFAULT 0,
  project_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_testimonials_order ON public.testimonials (is_visible, order_index);

GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "testimonials public read visible"
  ON public.testimonials FOR SELECT
  USING (is_visible = true);

CREATE POLICY "testimonials admin read all"
  ON public.testimonials FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "testimonials admin write"
  ON public.testimonials FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_testimonials_updated
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- 4. page_seo
-- =========================
CREATE TABLE IF NOT EXISTS public.page_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_key text NOT NULL UNIQUE,   -- '/', '/en', '/projects', '/contact', ...
  title_ar text,
  title_en text,
  description_ar text,
  description_en text,
  keywords text,
  og_image_url text,
  canonical_url text,
  robots text NOT NULL DEFAULT 'index,follow',
  json_ld jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.page_seo TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_seo TO authenticated;
GRANT ALL ON public.page_seo TO service_role;

ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_seo public read active"
  ON public.page_seo FOR SELECT
  USING (is_active = true);

CREATE POLICY "page_seo admin write"
  ON public.page_seo FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_page_seo_updated
  BEFORE UPDATE ON public.page_seo
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- 5. site_settings — extend with theme & copy
-- =========================
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS theme jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS copy jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS logo_url_dark text,
  ADD COLUMN IF NOT EXISTS og_default_image_url text,
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS default_lang text NOT NULL DEFAULT 'ar';
