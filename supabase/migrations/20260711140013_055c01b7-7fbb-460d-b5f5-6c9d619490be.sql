
-- profiles
CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- tags
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label_ar text NOT NULL,
  label_en text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_public_read" ON public.tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tags_admin_write" ON public.tags FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));
CREATE TRIGGER tags_updated_at BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- media_folders
CREATE TABLE public.media_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES public.media_folders(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_folders TO authenticated;
GRANT ALL ON public.media_folders TO service_role;
ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media_folders_admin_all" ON public.media_folders FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));
CREATE TRIGGER media_folders_updated_at BEFORE UPDATE ON public.media_folders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- media_assets
CREATE TABLE public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL,
  path text NOT NULL,
  mime text,
  size bigint,
  width int,
  height int,
  alt_ar text,
  alt_en text,
  folder_id uuid REFERENCES public.media_folders(id) ON DELETE SET NULL,
  uploader_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bucket, path)
);
CREATE INDEX media_assets_folder_created_idx ON public.media_assets (folder_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media_assets_admin_all" ON public.media_assets FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));
CREATE TRIGGER media_assets_updated_at BEFORE UPDATE ON public.media_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- services
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  description_ar text,
  description_en text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  icon text,
  cover_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  cta_label_ar text,
  cta_label_en text,
  cta_href text,
  seo_title_ar text,
  seo_title_en text,
  seo_description_ar text,
  seo_description_en text,
  seo_keywords text[],
  og_image_url text,
  featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  sort_order int NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX services_status_sort_idx ON public.services (status, sort_order);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_public_read_published" ON public.services FOR SELECT TO anon, authenticated
  USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));
CREATE POLICY "services_admin_read_all" ON public.services FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));
CREATE POLICY "services_admin_write" ON public.services FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- portfolio_projects
CREATE TABLE public.portfolio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  client text,
  industry text,
  category_slug text,
  short_description_ar text,
  short_description_en text,
  challenge_ar text,
  challenge_en text,
  solution_ar text,
  solution_en text,
  results_ar text,
  results_en text,
  cover_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  services_used uuid[] NOT NULL DEFAULT '{}',
  seo_title_ar text,
  seo_title_en text,
  seo_description_ar text,
  seo_description_en text,
  seo_keywords text[],
  og_image_url text,
  featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  sort_order int NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX portfolio_projects_status_pub_idx ON public.portfolio_projects (status, published_at DESC);
CREATE INDEX portfolio_projects_category_idx ON public.portfolio_projects (category_slug);
GRANT SELECT ON public.portfolio_projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_projects TO authenticated;
GRANT ALL ON public.portfolio_projects TO service_role;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_public_read_published" ON public.portfolio_projects FOR SELECT TO anon, authenticated
  USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));
CREATE POLICY "projects_admin_read_all" ON public.portfolio_projects FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));
CREATE POLICY "projects_admin_write" ON public.portfolio_projects FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));
CREATE TRIGGER portfolio_projects_updated_at BEFORE UPDATE ON public.portfolio_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- article_tags
CREATE TABLE public.article_tags (
  article_id uuid NOT NULL REFERENCES public.insight_articles(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);
GRANT SELECT ON public.article_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.article_tags TO authenticated;
GRANT ALL ON public.article_tags TO service_role;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "article_tags_public_read" ON public.article_tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "article_tags_admin_write" ON public.article_tags FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

-- project_tags
CREATE TABLE public.project_tags (
  project_id uuid NOT NULL REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);
GRANT SELECT ON public.project_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_tags TO authenticated;
GRANT ALL ON public.project_tags TO service_role;
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_tags_public_read" ON public.project_tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "project_tags_admin_write" ON public.project_tags FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

-- pages
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  hero jsonb NOT NULL DEFAULT '{}'::jsonb,
  blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  seo_title_ar text,
  seo_title_en text,
  seo_description_ar text,
  seo_description_en text,
  seo_keywords text[],
  og_image_url text,
  canonical_url text,
  robots text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pages_public_read_published" ON public.pages FOR SELECT TO anon, authenticated
  USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));
CREATE POLICY "pages_admin_read_all" ON public.pages FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));
CREATE POLICY "pages_admin_write" ON public.pages FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));
CREATE TRIGGER pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- contact_messages
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread','read','archived')),
  ip inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX contact_messages_status_created_idx ON public.contact_messages (status, created_at DESC);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_messages_public_insert" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "contact_messages_admin_all" ON public.contact_messages FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));
CREATE TRIGGER contact_messages_updated_at BEFORE UPDATE ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- article_revisions
CREATE TABLE public.article_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.insight_articles(id) ON DELETE CASCADE,
  snapshot jsonb NOT NULL,
  editor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX article_revisions_article_created_idx ON public.article_revisions (article_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.article_revisions TO authenticated;
GRANT ALL ON public.article_revisions TO service_role;
ALTER TABLE public.article_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "article_revisions_admin_all" ON public.article_revisions FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

-- site_settings
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  logo_url text,
  favicon_url text,
  company_name text,
  contact_email text,
  contact_phone text,
  address text,
  socials jsonb NOT NULL DEFAULT '{}'::jsonb,
  analytics jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings_public_read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "site_settings_admin_write" ON public.site_settings FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.site_settings (key) VALUES ('default') ON CONFLICT DO NOTHING;

-- Extend insight_articles
ALTER TABLE public.insight_articles
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS related_article_ids uuid[] NOT NULL DEFAULT '{}';

-- Realtime for contact_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;
