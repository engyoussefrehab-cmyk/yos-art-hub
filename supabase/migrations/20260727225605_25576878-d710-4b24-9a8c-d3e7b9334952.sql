CREATE TABLE public.home_methodology_page (
  id text PRIMARY KEY DEFAULT 'default',
  kicker_ar text, kicker_en text,
  title_ar text, title_en text,
  lede_ar text, lede_en text,
  is_visible boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.home_methodology_page TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_methodology_page TO authenticated;
GRANT ALL ON public.home_methodology_page TO service_role;

ALTER TABLE public.home_methodology_page ENABLE ROW LEVEL SECURITY;

CREATE POLICY "methodology_page_public_read" ON public.home_methodology_page
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "methodology_page_manage" ON public.home_methodology_page
  FOR ALL TO authenticated USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());

CREATE TRIGGER trg_home_methodology_page_updated_at
  BEFORE UPDATE ON public.home_methodology_page
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.home_methodology_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.home_methodology_steps TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_methodology_steps TO authenticated;
GRANT ALL ON public.home_methodology_steps TO service_role;

ALTER TABLE public.home_methodology_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "methodology_steps_public_read" ON public.home_methodology_steps
  FOR SELECT TO anon, authenticated
  USING (is_published = true AND deleted_at IS NULL);
CREATE POLICY "methodology_steps_manage" ON public.home_methodology_steps
  FOR ALL TO authenticated USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());

CREATE TRIGGER trg_home_methodology_steps_updated_at
  BEFORE UPDATE ON public.home_methodology_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.home_methodology_page (id, kicker_ar, kicker_en, title_ar, title_en, lede_ar, lede_en)
VALUES ('default', 'منهجيّة العمل', 'How I work', 'من الفكرة إلى الهويّة', 'From idea to identity',
  'منهجٌ استراتيجيٌّ واضح يضمن أن تعكس هويّتك جوهر علامتك وتخدم أهدافها التجاريّة.',
  'A clear strategic method that ensures your identity reflects your brand''s essence and serves its business goals.');

INSERT INTO public.home_methodology_steps (title_ar, title_en, description_ar, description_en, sort_order) VALUES
('الاكتشاف', 'Discovery', 'جلسةٌ عميقة لفهم علامتك، جمهورك، وموقعك في السوق.', 'A deep session to understand your brand, audience, and market position.', 1),
('الاستراتيجيّة', 'Strategy', 'بناء التوجّه البصري والمفاهيم التي تقود التصميم.', 'Building the visual direction and concepts that guide the design.', 2),
('التصميم', 'Design', 'تنفيذ الهويّة عبر شعارٍ ونظامٍ بصريٍّ متكامل.', 'Executing the identity through a logo and a complete visual system.', 3),
('التسليم', 'Delivery', 'دليل استخدامٍ واضح وملفّاتٌ نهائيّة جاهزة للتطبيق.', 'A clear usage guide and final files ready for real-world application.', 4);