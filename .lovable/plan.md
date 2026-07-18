# خطة إعادة بناء نظام المشاريع (Projects CMS)

هذا مشروع ضخم — لا يمكن تنفيذه في جولة واحدة. سأقسّمه إلى **6 مراحل مستقلة قابلة للنشر**، كل مرحلة تُبنى فوق سابقتها. سنُنفّذ مرحلة واحدة كل جولة، وأنت توافق قبل الانتقال للتالية.

---

## المرحلة 1 — أساس البيانات (Schema + Categories CMS)

**قاعدة البيانات:**
- جدول `project_categories` جديد: `slug, name_ar, name_en, description_ar/en, icon, cover_image, sort_order, is_hidden, meta`.
- توسيع `portfolio_projects` بحقول: `category_id (FK)`, `client_country`, `year`, `duration`, `role`, `team`, `completed_at`, `is_confidential`, `is_archived`, `is_pinned`, `hero_image`, `thumbnail`, `videos jsonb`, `embeds jsonb`, `pdf_url`, `behance_url`, `figma_url`, `brand_colors jsonb`, `typography jsonb`, `deliverables jsonb`, `stats jsonb`, `testimonial jsonb`, `layout_blocks jsonb`, `tags jsonb`, `views_count`, `locale_content jsonb` (AR/EN منفصلة).
- RLS + GRANTs + سياسات anon للقراءة.

**لوحة التحكم:**
- `/admin/categories`: CRUD + إعادة ترتيب بالسحب + إخفاء/إظهار + رفع أيقونة وغلاف.

**الواجهة:** لا تغيير مرئي بعد.

---

## المرحلة 2 — محرر المشروع الشامل (Fields + Media)

- إعادة بناء `AdminPortfolioEditorView` كتبويبات:
  1. **الأساسيات** (اسم/slug/عميل/قطاع/بلد/سنة/دور/فريق/حالة/سرّي).
  2. **الوسائط** (Cover/Thumbnail/Hero/Gallery/Videos/Embeds/PDF/Before-After).
  3. **البراند** (ألوان unlimited + طباعة + Deliverables checklist).
  4. **الإحصائيات + الشهادة** (KPI cards + Testimonial).
  5. **الروابط** (Behance/Figma/Website).
  6. **SEO** (title/desc/keywords/OG/canonical).
  7. **ثنائي اللغة** (كل الحقول النصية AR + EN).
- Auto-save، Draft/Publish/Schedule، Duplicate، Archive، Pin، Feature.

---

## المرحلة 3 — Page Builder (Modular Layout Blocks)

- محرر بلوكات قابلة للسحب: Hero/Overview/Challenge/Research/Strategy/Moodboard/Logo Process/Sketches/Typography/Colors/Grid/Mockups/Gallery/Video/Testimonials/Downloads/CTA/Divider/Image/Text/2-3 Columns/Quote/Full-width/Before-After/Carousel/Accordion/Timeline.
- كل بلوك: JSON schema + محرر جانبي + معاينة حية.
- تخزين في `layout_blocks jsonb` (مصفوفة مرتّبة).
- زر **Preview** (رابط مؤقت بدون نشر).

---

## المرحلة 4 — قائمة المشاريع في الإدارة (UX احترافي)

- Grid/List toggle، بحث فوري، فلاتر (فئة/سنة/حالة/tag)، فرز، Drag-to-reorder، Bulk actions (delete/edit/archive)، Pin/Feature toggles inline، Duplicate، Version History (سجل تعديلات في `article_revisions` pattern موسّع للمشاريع).

---

## المرحلة 5 — الواجهة العامة (Visitor Experience)

- `/projects` hub ديناميكي: يقرأ الفئات من CMS (لا hardcode).
- `/projects/[category]` صفحة فئة مع فلاتر instant (industry/service/year/tag/search) بدون reload.
- `/projects/[category]/[slug]` صفحة المشروع:
  - Reading progress bar، Breadcrumb، Sticky TOC، Read time.
  - عرض البلوكات ديناميكيًا حسب `layout_blocks`.
  - Gallery: Grid/Masonry/Carousel/Lightbox/Zoom/Keyboard.
  - Colors/Typography/Deliverables/Stats/Testimonial sections.
  - Previous/Next/Related/Same-category/Featured.
  - Share (LinkedIn/X/Copy)، Inquiry button (prefill)، Views counter.
  - JSON-LD CreativeWork + Breadcrumb + Article schema.
- الصفحة الرئيسية: قسم **Latest Projects** (سلايدر أفقي premium: 3/2/1 cards، drag/swipe/loop/autoplay/glassmorphism/zoom-hover) + قسم **Featured Projects**.

---

## المرحلة 6 — تحسينات وتوسّع

- Image optimization pipeline (WebP/AVIF/responsive srcset).
- Recently Viewed (localStorage)، Recommendations (بنفس الخدمات/الفئة).
- Scheduled publishing cron.
- Dashboard overview: counts, storage usage, recent activity, quick add.
- Architecture hooks لأنواع محتوى مستقبلية (Awards/Speaking/Courses/Resources) — جداول جاهزة لكن UI لاحقًا عند الطلب.

---

## تفاصيل تقنية

- **Stack:** TanStack Start + Supabase (نفس ما هو قائم).
- **Drag & Drop:** `@dnd-kit/core`.
- **Animations:** `framer-motion` (مركّبة بالفعل جزئيًا) + `embla-carousel-react` للسلايدرز.
- **Rich blocks:** JSON schema + React switch renderer.
- **i18n للمشاريع:** حقول `*_ar` / `*_en` أو `locale_content jsonb`.
- **Storage:** استخدام bucket `portfolio-covers` الحالي + توسيعه لبقية الأصول.
- **SEO:** كل مشروع يولّد `head()` كامل مع OG/Twitter/JSON-LD.
- **الأداء:** lazy load، prefetch على hover، `<img loading="lazy" decoding="async">`، srcset تلقائي.

---

## نطاق كل جولة

كل جولة ≈ 15-30 ملف. الحجم الكلي للمشروع ≈ 100+ ملف جديد/معدّل. لن أخلط مراحل — كل مرحلة تنتهي بحالة قابلة للاستخدام.

**نبدأ بالمرحلة 1 (الأساس)؟** أم تريد تعديل الترتيب أو دمج مراحل؟
