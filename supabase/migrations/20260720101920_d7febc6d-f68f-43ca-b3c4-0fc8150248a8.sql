
CREATE TABLE public.service_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  description_ar text,
  description_en text,
  deliverables jsonb NOT NULL DEFAULT '[]'::jsonb,
  price_ar text,
  price_en text,
  cta_label_ar text,
  cta_label_en text,
  cta_href text DEFAULT '/contact',
  featured boolean NOT NULL DEFAULT false,
  badge_ar text,
  badge_en text,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_tiers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_tiers TO authenticated;
GRANT ALL ON public.service_tiers TO service_role;
ALTER TABLE public.service_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_tiers public read" ON public.service_tiers
  FOR SELECT TO anon, authenticated
  USING (is_published = true AND deleted_at IS NULL);
CREATE POLICY "service_tiers managers all" ON public.service_tiers
  FOR ALL TO authenticated
  USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());
CREATE TRIGGER trg_service_tiers_updated_at BEFORE UPDATE ON public.service_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.service_tier_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label_ar text NOT NULL,
  label_en text NOT NULL,
  launch text NOT NULL DEFAULT 'none' CHECK (launch IN ('none','core','extended','full')),
  signature text NOT NULL DEFAULT 'none' CHECK (signature IN ('none','core','extended','full')),
  "system" text NOT NULL DEFAULT 'none' CHECK ("system" IN ('none','core','extended','full')),
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_tier_features TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_tier_features TO authenticated;
GRANT ALL ON public.service_tier_features TO service_role;
ALTER TABLE public.service_tier_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_tier_features public read" ON public.service_tier_features
  FOR SELECT TO anon, authenticated
  USING (is_published = true AND deleted_at IS NULL);
CREATE POLICY "service_tier_features managers all" ON public.service_tier_features
  FOR ALL TO authenticated
  USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());
CREATE TRIGGER trg_service_tier_features_updated_at BEFORE UPDATE ON public.service_tier_features
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.service_tier_page (
  id text PRIMARY KEY DEFAULT 'default',
  eyebrow_ar text, eyebrow_en text,
  title_ar text, title_en text,
  subtitle_ar text, subtitle_en text,
  footnote_ar text, footnote_en text,
  cta_eyebrow_ar text, cta_eyebrow_en text,
  cta_title_ar text, cta_title_en text,
  cta_subtitle_ar text, cta_subtitle_en text,
  cta_button_ar text, cta_button_en text,
  cta_href text DEFAULT '/contact',
  compare_eyebrow_ar text, compare_eyebrow_en text,
  compare_title_ar text, compare_title_en text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (id = 'default')
);
GRANT SELECT ON public.service_tier_page TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_tier_page TO authenticated;
GRANT ALL ON public.service_tier_page TO service_role;
ALTER TABLE public.service_tier_page ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_tier_page public read" ON public.service_tier_page
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "service_tier_page managers all" ON public.service_tier_page
  FOR ALL TO authenticated
  USING (public.cms_can_manage()) WITH CHECK (public.cms_can_manage());
CREATE TRIGGER trg_service_tier_page_updated_at BEFORE UPDATE ON public.service_tier_page
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.service_tiers (slug, name_ar, name_en, description_ar, description_en, deliverables, price_ar, price_en, cta_label_ar, cta_label_en, featured, badge_ar, badge_en, sort_order) VALUES
('launch','انطلاق العلامة','Brand Launch',
 'للشركات الناشئة والمشاريع الجديدة التي تحتاج أساسًا بصريًا نظيفًا للانطلاق.',
 'For startups and new businesses that need a clean visual foundation to launch with.',
 '[{"ar":"تصميم الشعار","en":"Logo Design"},{"ar":"لوحة الألوان","en":"Color Palette"},{"ar":"نظام الطباعة","en":"Typography"},{"ar":"أصول الهوية الأساسية","en":"Basic Brand Assets"},{"ar":"حزمة السوشيال ميديا","en":"Social Media Kit"}]'::jsonb,
 'يبدأ من ٤٥٠ $','Starting from $450','اطلب عرضًا','Request Proposal',false,null,null,10),
('signature','توقيع العلامة','Brand Signature',
 'للأعمال النامية التي تسعى إلى هويّةٍ بصريّةٍ متكاملة تصنع حضورًا مميّزًا.',
 'For growing businesses seeking a complete visual identity with a distinctive presence.',
 '[{"ar":"اكتشاف العلامة","en":"Brand Discovery"},{"ar":"استراتيجيّة العلامة","en":"Brand Strategy"},{"ar":"نظام الشعار","en":"Logo System"},{"ar":"الهوية البصريّة","en":"Visual Identity"},{"ar":"قوالب السوشيال ميديا","en":"Social Media Templates"},{"ar":"دليل الهوية","en":"Brand Guidelines"}]'::jsonb,
 'يبدأ من ١٢٥٠ $','Starting from $1,250','احجز جلسة اكتشاف','Book a Discovery Call',true,'الأكثر اختيارًا','Most Popular',20),
('system','نظام العلامة','Brand System',
 'للمؤسّسات والشركات المتوسّعة التي تحتاج نظامًا بصريًّا استراتيجيًّا شاملًا.',
 'For established businesses and organizations that need a comprehensive strategic brand system.',
 '[{"ar":"استراتيجيّة علامة شاملة","en":"Comprehensive Brand Strategy"},{"ar":"نظام علامة متكامل","en":"Complete Brand System"},{"ar":"هندسة العلامة","en":"Brand Architecture"},{"ar":"الأصول التسويقيّة","en":"Marketing Assets"},{"ar":"دعم تصميميّ طويل الأمد","en":"Long-Term Design Support"}]'::jsonb,
 'سعرٌ مخصّص','Custom Pricing','لنتحدّث','Let''s Talk',false,null,null,30);

INSERT INTO public.service_tier_features (label_ar, label_en, launch, signature, "system", sort_order) VALUES
('اكتشاف العلامة','Brand Discovery','none','core','full',10),
('استراتيجيّة العلامة','Brand Strategy','none','core','full',20),
('نظام الشعار','Logo System','core','extended','full',30),
('الهوية البصريّة','Visual Identity','core','extended','full',40),
('دليل الهوية','Brand Guidelines','none','core','full',50),
('الورقيّات','Stationery','none','core','full',60),
('قوالب السوشيال ميديا','Social Templates','core','extended','full',70),
('الأصول التسويقيّة','Marketing Assets','none','none','full',80),
('الدعم المستمر','Ongoing Support','none','none','full',90);

INSERT INTO public.service_tier_page (id, eyebrow_ar, eyebrow_en, title_ar, title_en, subtitle_ar, subtitle_en, footnote_ar, footnote_en, cta_eyebrow_ar, cta_eyebrow_en, cta_title_ar, cta_title_en, cta_subtitle_ar, cta_subtitle_en, cta_button_ar, cta_button_en, compare_eyebrow_ar, compare_eyebrow_en, compare_title_ar, compare_title_en)
VALUES ('default',
 'فئات الخدمات','Service Tiers',
 'اختر الحلّ المناسب لعلامتك','Choose the Right Branding Solution',
 'كلّ علامةٍ فريدة. خدماتي مُصمَّمة لتتناسب مع أهدافك التجاريّة وقطاعك ومرحلة نموّك.',
 'Every brand is unique. Our services are tailored to your business goals, industry, and growth stage.',
 'كلّ مشروع علامة تجاريّة فريدٌ من نوعه. يعتمد السعر النهائي على نطاق المشروع، والأهداف التجاريّة، والمخرجات، والجدول الزمني. الأسعار المذكورة تُمثّل قيمة الاستثمار الأوّليّة لكلّ فئة خدمة.',
 'Every branding project is unique. Final pricing depends on project scope, business goals, deliverables, and timeline. The listed prices represent the starting investment for each service tier.',
 'لنبدأ','Let''s begin',
 'غير متأكّد من الفئة المناسبة؟','Not sure which tier fits your brand?',
 'أخبرني عن مشروعك، وسأُعدّ لك عرضًا مخصّصًا يعكس أهدافك ومرحلة نموّ علامتك.',
 'Tell me about your project and I''ll prepare a tailored proposal aligned with your goals and growth stage.',
 'اطلب عرضًا مخصّصًا','Request a custom proposal',
 'مقارنة','Compare',
 'ما الذي تحصل عليه في كلّ فئة','What''s included in each tier');
