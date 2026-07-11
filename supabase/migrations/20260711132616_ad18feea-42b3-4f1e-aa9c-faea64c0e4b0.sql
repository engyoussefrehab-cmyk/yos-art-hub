
-- Roles system (admin gate)
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Bootstrap function: promote current user to admin if NO admin exists yet.
CREATE OR REPLACE FUNCTION public.bootstrap_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  admin_count INT;
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN FALSE; END IF;
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  IF admin_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
    ON CONFLICT DO NOTHING;
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_admin() TO authenticated;

-- Shared updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Categories
CREATE TABLE public.insight_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label_ar TEXT NOT NULL,
  label_en TEXT NOT NULL,
  description_ar TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.insight_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insight_categories TO authenticated;
GRANT ALL ON public.insight_categories TO service_role;
ALTER TABLE public.insight_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON public.insight_categories
  FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.insight_categories
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_insight_categories_updated
  BEFORE UPDATE ON public.insight_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Article status
CREATE TYPE public.article_status AS ENUM ('draft', 'scheduled', 'published');

-- Articles
CREATE TABLE public.insight_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  category_id UUID NOT NULL REFERENCES public.insight_categories(id) ON DELETE RESTRICT,
  status article_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  featured BOOLEAN NOT NULL DEFAULT FALSE,

  -- Bilingual fields
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL DEFAULT '',
  excerpt_ar TEXT NOT NULL DEFAULT '',
  excerpt_en TEXT NOT NULL DEFAULT '',
  content_ar TEXT NOT NULL DEFAULT '',
  content_en TEXT NOT NULL DEFAULT '',

  -- SEO
  seo_title_ar TEXT NOT NULL DEFAULT '',
  seo_title_en TEXT NOT NULL DEFAULT '',
  seo_description_ar TEXT NOT NULL DEFAULT '',
  seo_description_en TEXT NOT NULL DEFAULT '',

  -- Media
  cover_url TEXT,
  featured_image_url TEXT,

  -- Author
  author_name TEXT NOT NULL DEFAULT 'Youssef Rehab',
  author_avatar_url TEXT,

  -- Meta
  reading_minutes INT NOT NULL DEFAULT 5,
  tags TEXT[] NOT NULL DEFAULT '{}',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  faq JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_slugs TEXT[] NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.insight_articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insight_articles TO authenticated;
GRANT ALL ON public.insight_articles TO service_role;
ALTER TABLE public.insight_articles ENABLE ROW LEVEL SECURITY;

-- Public reads only see effectively-published rows
CREATE POLICY "Public can view published articles" ON public.insight_articles
  FOR SELECT USING (
    status <> 'draft'
    AND published_at IS NOT NULL
    AND published_at <= now()
  );

-- Admins can read everything (including drafts) and manage
CREATE POLICY "Admins can read all articles" ON public.insight_articles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert articles" ON public.insight_articles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update articles" ON public.insight_articles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete articles" ON public.insight_articles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_insight_articles_updated
  BEFORE UPDATE ON public.insight_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_insight_articles_status_published_at
  ON public.insight_articles (status, published_at DESC);
CREATE INDEX idx_insight_articles_category
  ON public.insight_articles (category_id, published_at DESC);
CREATE INDEX idx_insight_articles_featured
  ON public.insight_articles (featured) WHERE featured = TRUE;
CREATE INDEX idx_insight_articles_tags
  ON public.insight_articles USING GIN (tags);

-- Seed categories
INSERT INTO public.insight_categories (slug, label_ar, label_en, description_ar, description_en, sort_order) VALUES
('brand-strategy',      'استراتيجية العلامة', 'Brand Strategy',       'أطر عمل ومبادئ لبناء علامات تجارية متماسكة تصمد أمام الزمن.', 'Frameworks and principles for building coherent brands that stand the test of time.', 1),
('visual-identity',     'الهوية البصرية',     'Visual Identity',      'أنظمة بصرية متكاملة تنقل شخصية العلامة بوضوح واتساق.',       'Complete visual systems that convey brand personality with clarity and consistency.', 2),
('logo-design',         'تصميم الشعارات',     'Logo Design',          'منهجية تصميم شعارات دقيقة، خالدة، وذات معنى.',              'A methodology for designing precise, timeless, and meaningful logos.', 3),
('presentation-design', 'تصميم العروض',       'Presentation Design',  'كيف تحوّل الأفكار المعقّدة إلى عروض بصرية مقنعة.',           'How to turn complex ideas into persuasive visual presentations.', 4),
('business',            'أعمال',              'Business',             'رؤى في إدارة أعمال التصميم والتسعير والتعامل مع العملاء.',   'Insights into running a design business — pricing, clients, and operations.', 5),
('marketing',           'التسويق',            'Marketing',            'استراتيجيات التسويق البصري وبناء الحضور الرقمي للعلامة.',    'Visual marketing strategies and building a brand''s digital presence.', 6),
('ai',                  'الذكاء الاصطناعي',   'AI',                   'توظيف الذكاء الاصطناعي في سير عمل التصميم والإبداع.',        'Leveraging AI in design workflows and creative production.', 7),
('case-studies',        'دراسات حالة',        'Case Studies',         'قصص من أرض الواقع لمشاريع علامات تجارية نفّذناها.',          'Real-world stories from brand projects we''ve delivered.', 8),
('resources',           'موارد',              'Resources',            'أدوات، قوالب، ومراجع مختارة لمصمّمي الهويات البصرية.',      'Curated tools, templates, and references for identity designers.', 9);
