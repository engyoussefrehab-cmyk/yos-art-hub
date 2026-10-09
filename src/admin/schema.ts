// What the dashboard can edit, and how each field looks.
// Every content file of the site is listed here. Fields not listed are kept
// untouched when saving.

export type Field =
  | { key: string; label: string; type: "text" | "textarea" | "html" | "url"; bi?: boolean; hint?: string; dir?: "ltr" }
  | { key: string; label: string; type: "image"; hint?: string; fit?: "contain" | "cover"; preserveOriginal?: boolean }
  | { key: string; label: string; type: "gallery"; hint?: string } // [{url}] or [url]
  | { key: string; label: string; type: "toggle"; hint?: string; invert?: boolean }
  | { key: string; label: string; type: "number"; hint?: string }
  | { key: string; label: string; type: "select"; options: { value: string; label: string }[] | "categories" | "insightCategories"; hint?: string }
  | { key: string; label: string; type: "tags"; hint?: string } // string[]
  | { key: string; label: string; type: "biList"; hint?: string } // { ar: string[], en: string[] }
  | { key: string; label: string; type: "pairList"; hint?: string } // [{ar,en}]
  | { key: string; label: string; type: "colors"; hint?: string } // string[] hex
  | { key: string; label: string; type: "group"; fields: Field[] }; // nested object

export type Section = { title: string; fields: Field[]; collapsed?: boolean };

export type Collection = {
  id: string;
  title: string;
  description?: string;
  file: string;
  /** dot path inside the file when the editable part is nested */
  pointer?: string;
  kind: "list" | "single";
  /** for kind=single on an array file: which item */
  index?: number;
  itemTitle?: (x: any) => string;
  itemSubtitle?: (x: any) => string;
  itemImage?: (x: any) => string | null | undefined;
  itemImageFit?: "contain" | "cover";
  /** list: field holding display order */
  sortKey?: string;
  /** list: field that hides an item from the site */
  visibility?: { key: string; on: any; off: any };
  sections: Section[];
  newItem?: (list: any[]) => any;
  /** where to see this on the site */
  siteHref?: (x?: any) => string;
};

const SNAP = "src/data/snapshot";
const uuid = () =>
  (globalThis.crypto?.randomUUID?.() as string) ||
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
const now = () => new Date().toISOString();
const nextSort = (list: any[], key = "sort_order") => (list.reduce((m, x) => Math.max(m, Number(x?.[key]) || 0), 0) || 0) + 10;

const seoSection = (collapsed = true): Section => ({
  title: "الظهور في جوجل والمشاركة",
  collapsed,
  fields: [
    { key: "seo_title", label: "عنوان الصفحة في جوجل", type: "text", bi: true, hint: "لو سبته فاضي هيتاخد الاسم" },
    { key: "seo_description", label: "وصف الصفحة في جوجل", type: "textarea", bi: true },
  ],
});

export const COLLECTIONS: Collection[] = [
  {
    id: "projects",
    title: "المشاريع",
    description: "كل مشروع له صفحة خاصة، ويظهر في صفحة المشاريع والصفحة الرئيسية.",
    file: `${SNAP}/portfolio_projects.json`,
    kind: "list",
    sortKey: "sort_order",
    visibility: { key: "status", on: "published", off: "draft" },
    itemTitle: (x) => x.name_ar || x.name_en || "مشروع بدون اسم",
    itemSubtitle: (x) => [x.client, x.industry].filter(Boolean).join(" · "),
    itemImage: (x) => x.thumbnail_url || x.og_image_url || x.gallery?.[0]?.url || x.gallery?.[0] || x.hero_image_url,
    siteHref: (x) => (x ? `/projects/${x.category_slug}/${x.slug}` : "/projects"),
    sections: [
      {
        title: "الأساسيات",
        fields: [
          { key: "name", label: "اسم المشروع", type: "text", bi: true },
          { key: "category_slug", label: "القسم", type: "select", options: "categories" },
          { key: "slug", label: "رابط الصفحة", type: "text", dir: "ltr", hint: "حروف إنجليزي صغيرة وشَرطة بس، مثلاً qutoof-brand. لو غيّرته الرابط القديم هيبطل." },
          { key: "short_description", label: "وصف قصير (تحت الاسم وفي الكروت)", type: "textarea", bi: true },
          { key: "featured", label: "مشروع مميّز", type: "toggle" },
        ],
      },
      {
        title: "الصور",
        fields: [
          { key: "thumbnail_url", label: "صورة الكارت (الغلاف)", type: "image", hint: "بتظهر في قوائم المشاريع وأعلى صفحة المشروع" },
          { key: "og_image_url", label: "صورة المشاركة", type: "image", hint: "بتظهر لما حد يبعت رابط المشروع على واتساب أو لينكدإن" },
          { key: "hero_image_url", label: "صورة إضافية كبيرة", type: "image" },
          { key: "gallery", label: "معرض الصور", type: "gallery", hint: "صور المشروع بالترتيب. اسحب أو استخدم الأسهم لتغيير الترتيب." },
        ],
      },
      {
        title: "قصة المشروع",
        fields: [
          { key: "challenge", label: "الفكرة / التحدّي", type: "textarea", bi: true },
          { key: "solution", label: "نقاط المنهجية (كل سطر نقطة)", type: "textarea", bi: true },
          { key: "results", label: "القيمة / النتيجة", type: "textarea", bi: true },
          { key: "deliverables", label: "المخرجات", type: "biList" },
          { key: "brand_colors", label: "ألوان الهوية", type: "colors" },
        ],
      },
      {
        title: "بيانات المشروع",
        collapsed: true,
        fields: [
          { key: "client", label: "العميل", type: "text" },
          { key: "industry", label: "المجال / النوع", type: "text" },
          { key: "client_country", label: "الدولة", type: "text" },
          { key: "year", label: "السنة", type: "number" },
          { key: "role", label: "دورك في المشروع", type: "text" },
          { key: "duration", label: "المدة", type: "text" },
          { key: "behance_url", label: "رابط بيهانس", type: "url" },
          { key: "project_url", label: "رابط المشروع", type: "url" },
        ],
      },
      seoSection(),
    ],
    newItem: (list) => {
      const id = uuid();
      return {
        id,
        slug: `project-${list.length + 1}`,
        name_ar: "",
        name_en: "",
        category_slug: "branding",
        short_description_ar: "",
        short_description_en: "",
        challenge_ar: "",
        challenge_en: "",
        solution_ar: "",
        solution_en: "",
        results_ar: "",
        results_en: "",
        gallery: [],
        thumbnail_url: null,
        og_image_url: null,
        hero_image_url: null,
        featured: false,
        status: "draft",
        sort_order: nextSort(list),
        layout_blocks: [],
        published_at: now(),
        created_at: now(),
        updated_at: now(),
      };
    },
  },
  {
    id: "categories",
    title: "أقسام المشاريع",
    description: "الهوية البصرية، الشعارات، ملفات الشركات… وغيرها.",
    file: `${SNAP}/project_categories.json`,
    kind: "list",
    sortKey: "sort_order",
    visibility: { key: "is_hidden", on: false, off: true },
    itemTitle: (x) => x.name_ar || x.slug,
    itemSubtitle: (x) => x.description_ar || "",
    itemImage: (x) => x.cover_image_url || x.hero_image_url,
    siteHref: (x) => (x ? `/projects/${x.slug}` : "/projects"),
    sections: [
      {
        title: "الأساسيات",
        fields: [
          { key: "name", label: "اسم القسم", type: "text", bi: true },
          { key: "slug", label: "رابط القسم", type: "text", dir: "ltr" },
          { key: "description", label: "وصف قصير", type: "textarea", bi: true },
          { key: "intro", label: "مقدمة صفحة القسم", type: "textarea", bi: true },
          { key: "cover_image_url", label: "صورة القسم", type: "image" },
          { key: "hero_image_url", label: "صورة أعلى صفحة القسم", type: "image" },
        ],
      },
      {
        title: "زرار آخر الصفحة",
        collapsed: true,
        fields: [
          { key: "cta_label", label: "نص الزرار", type: "text", bi: true },
          { key: "cta_href", label: "رابط الزرار", type: "url" },
        ],
      },
      seoSection(),
    ],
    newItem: (list) => ({
      id: uuid(),
      slug: `category-${list.length + 1}`,
      name_ar: "",
      name_en: "",
      description_ar: "",
      description_en: "",
      sort_order: nextSort(list),
      is_hidden: true,
      faq: [],
      featured_project_ids: [],
      workflow_state: "published",
      created_at: now(),
      updated_at: now(),
    }),
  },
  {
    id: "services",
    title: "الخدمات",
    description: "قسم «ماذا أقدّم» في الصفحة الرئيسية.",
    file: `${SNAP}/services.json`,
    kind: "list",
    sortKey: "sort_order",
    visibility: { key: "status", on: "published", off: "draft" },
    itemTitle: (x) => x.title_ar,
    itemSubtitle: (x) => x.description_ar || "",
    siteHref: () => "/#services",
    sections: [
      {
        title: "الخدمة",
        fields: [
          { key: "title", label: "اسم الخدمة", type: "text", bi: true },
          { key: "description", label: "الوصف", type: "textarea", bi: true },
          { key: "features", label: "النقاط", type: "tags" },
          { key: "cta_label", label: "نص الزرار", type: "text", bi: true },
          { key: "cta_href", label: "رابط الزرار", type: "url" },
          { key: "featured", label: "مميّزة", type: "toggle" },
        ],
      },
    ],
    newItem: (list) => ({
      id: uuid(),
      slug: `service-${list.length + 1}`,
      title_ar: "",
      title_en: "",
      description_ar: "",
      description_en: "",
      features: [],
      cta_href: "/contact",
      status: "draft",
      sort_order: nextSort(list),
      workflow_state: "published",
      created_at: now(),
      updated_at: now(),
    }),
  },
  {
    id: "methodology",
    title: "منهجية العمل — العنوان",
    file: `${SNAP}/home_methodology_page.json`,
    kind: "single",
    index: 0,
    siteHref: () => "/",
    sections: [
      {
        title: "عنوان القسم",
        fields: [
          { key: "kicker", label: "العنوان الصغير", type: "text", bi: true },
          { key: "title", label: "العنوان", type: "text", bi: true },
          { key: "lede", label: "الوصف", type: "textarea", bi: true },
          { key: "is_visible", label: "إظهار القسم", type: "toggle" },
        ],
      },
    ],
  },
  {
    id: "steps",
    title: "منهجية العمل — الخطوات",
    file: `${SNAP}/home_methodology_steps.json`,
    kind: "list",
    sortKey: "sort_order",
    visibility: { key: "is_published", on: true, off: false },
    itemTitle: (x) => x.title_ar,
    itemSubtitle: (x) => x.description_ar,
    siteHref: () => "/",
    sections: [
      {
        title: "الخطوة",
        fields: [
          { key: "title", label: "اسم الخطوة", type: "text", bi: true },
          { key: "description", label: "الوصف", type: "textarea", bi: true },
        ],
      },
    ],
    newItem: (list) => ({
      id: uuid(),
      title_ar: "",
      title_en: "",
      description_ar: "",
      description_en: "",
      sort_order: nextSort(list),
      is_published: false,
      created_at: now(),
      updated_at: now(),
    }),
  },
  {
    id: "clients",
    title: "العملاء",
    description: "شريط «علاماتٌ وثقت بالعمل معي».",
    file: `${SNAP}/client_logos.json`,
    kind: "list",
    sortKey: "sort_order",
    visibility: { key: "is_visible", on: true, off: false },
    itemTitle: (x) => x.name,
    itemImage: (x) => x.logo_url,
    itemImageFit: "contain",
    siteHref: () => "/",
    sections: [
      {
        title: "العميل",
        fields: [
          { key: "name", label: "اسم العميل", type: "text" },
          { key: "logo_url", label: "اللوجو", type: "image", fit: "contain", preserveOriginal: true, hint: "ارفع PNG أو SVG بخلفية شفافة — الملف هيفضل بجودته الأصلية من غير ضغط أو قص" },
          { key: "href", label: "رابط (اختياري)", type: "url" },
        ],
      },
    ],
    newItem: (list) => ({
      id: uuid(),
      name: "",
      logo_url: null,
      href: null,
      sort_order: nextSort(list),
      is_visible: false,
      created_at: now(),
      updated_at: now(),
    }),
  },
  {
    id: "testimonials",
    title: "آراء العملاء",
    file: "src/content/testimonials.json",
    pointer: "items",
    kind: "list",
    itemTitle: (x) => x.name,
    itemSubtitle: (x) => x.project,
    siteHref: () => "/",
    sections: [
      {
        title: "الرأي",
        fields: [
          { key: "name", label: "اسم العميل", type: "text" },
          { key: "project", label: "المشروع", type: "text" },
          { key: "quote", label: "الرأي", type: "textarea" },
          { key: "rating", label: "التقييم (من 5)", type: "number" },
        ],
      },
    ],
    newItem: () => ({ name: "", project: "", quote: "", rating: 5 }),
  },
  {
    id: "testimonialStats",
    title: "آراء العملاء — الأرقام",
    file: "src/content/testimonials.json",
    pointer: "stats",
    kind: "single",
    siteHref: () => "/",
    sections: [
      {
        title: "الأرقام",
        fields: [
          { key: "count", label: "عدد التقييمات", type: "number" },
          { key: "averageRating", label: "متوسط التقييم", type: "number" },
          { key: "platform", label: "اسم المنصة", type: "text" },
        ],
      },
    ],
  },
  {
    id: "tierPage",
    title: "فئات الخدمات — نصوص الصفحة",
    file: `${SNAP}/service_tier_page.json`,
    kind: "single",
    index: 0,
    siteHref: () => "/packages",
    sections: [
      {
        title: "أعلى الصفحة",
        fields: [
          { key: "eyebrow", label: "العنوان الصغير", type: "text", bi: true },
          { key: "title", label: "العنوان", type: "text", bi: true },
          { key: "subtitle", label: "الوصف", type: "textarea", bi: true },
          { key: "footnote", label: "ملاحظة تحت الفئات", type: "textarea", bi: true },
        ],
      },
      {
        title: "جدول المقارنة",
        fields: [
          { key: "compare_eyebrow", label: "العنوان الصغير", type: "text", bi: true },
          { key: "compare_title", label: "العنوان", type: "text", bi: true },
        ],
      },
      {
        title: "آخر الصفحة",
        fields: [
          { key: "cta_eyebrow", label: "العنوان الصغير", type: "text", bi: true },
          { key: "cta_title", label: "العنوان", type: "text", bi: true },
          { key: "cta_subtitle", label: "الوصف", type: "textarea", bi: true },
          { key: "cta_button", label: "نص الزرار", type: "text", bi: true },
          { key: "cta_href", label: "رابط الزرار", type: "url" },
        ],
      },
    ],
  },
  {
    id: "tiers",
    title: "فئات الخدمات — الفئات",
    file: `${SNAP}/service_tiers.json`,
    kind: "list",
    sortKey: "sort_order",
    visibility: { key: "is_published", on: true, off: false },
    itemTitle: (x) => x.name_ar,
    itemSubtitle: (x) => x.price_ar || x.description_ar,
    siteHref: () => "/packages",
    sections: [
      {
        title: "الفئة",
        fields: [
          { key: "name", label: "اسم الفئة", type: "text", bi: true },
          { key: "slug", label: "المعرّف", type: "text", dir: "ltr", hint: "بيربط الفئة بعمود جدول المقارنة — متغيّروش إلا لو عارف" },
          { key: "description", label: "الوصف", type: "textarea", bi: true },
          { key: "price", label: "السعر", type: "text", bi: true, hint: "لو فاضي السعر مش هيظهر" },
          { key: "badge", label: "شارة (مثلاً: الأكثر طلبًا)", type: "text", bi: true },
          { key: "deliverables", label: "المخرجات", type: "pairList" },
          { key: "cta_label", label: "نص الزرار", type: "text", bi: true },
          { key: "cta_href", label: "رابط الزرار", type: "url" },
          { key: "featured", label: "الفئة المميّزة", type: "toggle" },
        ],
      },
    ],
    newItem: (list) => ({
      id: uuid(),
      slug: `tier-${list.length + 1}`,
      name_ar: "",
      name_en: "",
      description_ar: "",
      description_en: "",
      deliverables: [],
      price_ar: "",
      price_en: "",
      cta_href: "/contact",
      featured: false,
      sort_order: nextSort(list),
      is_published: false,
      created_at: now(),
      updated_at: now(),
    }),
  },
  {
    id: "tierFeatures",
    title: "فئات الخدمات — جدول المقارنة",
    file: `${SNAP}/service_tier_features.json`,
    kind: "list",
    sortKey: "sort_order",
    visibility: { key: "is_published", on: true, off: false },
    itemTitle: (x) => x.label_ar,
    itemSubtitle: (x) => [x.launch, x.signature, x.system].join(" / "),
    siteHref: () => "/packages",
    sections: [
      {
        title: "الميزة",
        fields: [
          { key: "label", label: "اسم الميزة", type: "text", bi: true },
          ...(["launch", "signature", "system"] as const).map(
            (k) =>
              ({
                key: k,
                label: `في فئة ${k === "launch" ? "انطلاق العلامة" : k === "signature" ? "توقيع العلامة" : "نظام العلامة"}`,
                type: "select",
                options: [
                  { value: "none", label: "غير متاحة" },
                  { value: "core", label: "أساسية" },
                  { value: "extended", label: "موسّعة" },
                  { value: "full", label: "كاملة" },
                ],
              }) as Field,
          ),
        ],
      },
    ],
    newItem: (list) => ({
      id: uuid(),
      label_ar: "",
      label_en: "",
      launch: "none",
      signature: "core",
      system: "full",
      sort_order: nextSort(list),
      is_published: false,
      created_at: now(),
      updated_at: now(),
    }),
  },
  {
    id: "tierMeta",
    title: "فئات الخدمات — مدة ومراجعات كل فئة",
    file: "src/content/packages.json",
    pointer: "tier_meta",
    kind: "single",
    siteHref: () => "/packages",
    sections: (["launch", "signature", "system"] as const).map((k) => ({
      title: k === "launch" ? "انطلاق العلامة" : k === "signature" ? "توقيع العلامة" : "نظام العلامة",
      fields: [
        {
          key: k,
          label: "",
          type: "group",
          fields: [
            { key: "timeline", label: "المدة", type: "group", fields: [{ key: "ar", label: "عربي", type: "text" }, { key: "en", label: "English", type: "text", dir: "ltr" }] },
            { key: "revisions", label: "المراجعات", type: "group", fields: [{ key: "ar", label: "عربي", type: "text" }, { key: "en", label: "English", type: "text", dir: "ltr" }] },
            { key: "bestFor", label: "مناسبة لـ", type: "group", fields: [{ key: "ar", label: "عربي", type: "text" }, { key: "en", label: "English", type: "text", dir: "ltr" }] },
          ],
        } as Field,
      ],
    })),
  },
  {
    id: "trustStats",
    title: "فئات الخدمات — أرقام الثقة",
    file: "src/content/packages.json",
    pointer: "trust_stats",
    kind: "list",
    itemTitle: (x) => `${x.value_ar} ${x.label_ar}`,
    siteHref: () => "/packages",
    sections: [{ title: "الرقم", fields: [{ key: "value", label: "الرقم", type: "text", bi: true }, { key: "label", label: "الوصف", type: "text", bi: true }] }],
    newItem: () => ({ value_ar: "", label_ar: "", value_en: "", label_en: "" }),
  },
  {
    id: "processSteps",
    title: "فئات الخدمات — خطوات العمل",
    file: "src/content/packages.json",
    pointer: "process_steps",
    kind: "list",
    itemTitle: (x) => x.title_ar,
    itemSubtitle: (x) => x.desc_ar,
    siteHref: () => "/packages",
    sections: [{ title: "الخطوة", fields: [{ key: "title", label: "الخطوة", type: "text", bi: true }, { key: "desc", label: "الوصف", type: "textarea", bi: true }] }],
    newItem: () => ({ title_ar: "", desc_ar: "", title_en: "", desc_en: "" }),
  },
  {
    id: "faqs",
    title: "فئات الخدمات — الأسئلة الشائعة",
    file: "src/content/packages.json",
    pointer: "faqs",
    kind: "list",
    itemTitle: (x) => x.q_ar,
    siteHref: () => "/packages",
    sections: [{ title: "السؤال", fields: [{ key: "q", label: "السؤال", type: "text", bi: true }, { key: "a", label: "الإجابة", type: "textarea", bi: true }] }],
    newItem: () => ({ q_ar: "", a_ar: "", q_en: "", a_en: "" }),
  },
  {
    id: "articles",
    title: "المقالات (الرؤى)",
    file: `${SNAP}/insight_articles.json`,
    kind: "list",
    visibility: { key: "status", on: "published", off: "draft" },
    itemTitle: (x) => x.title_ar,
    itemSubtitle: (x) => x.excerpt_ar,
    itemImage: (x) => x.cover_url || x.featured_image_url,
    siteHref: () => "/insights",
    sections: [
      {
        title: "المقال",
        fields: [
          { key: "title", label: "العنوان", type: "text", bi: true },
          { key: "slug", label: "رابط المقال", type: "text", dir: "ltr" },
          { key: "category_id", label: "القسم", type: "select", options: "insightCategories" },
          { key: "excerpt", label: "ملخّص", type: "textarea", bi: true },
          { key: "cover_url", label: "صورة الغلاف", type: "image" },
          { key: "content", label: "نص المقال", type: "html", bi: true, hint: "تقدر تستخدم <p> للفقرة و <h2> للعنوان و <strong> للخط العريض" },
          { key: "reading_minutes", label: "مدة القراءة (دقائق)", type: "number" },
          { key: "featured", label: "مقال مميّز", type: "toggle" },
        ],
      },
      seoSection(),
    ],
    newItem: () => ({
      id: uuid(),
      slug: "new-article",
      category_id: null,
      status: "draft",
      published_at: now(),
      featured: false,
      title_ar: "",
      title_en: "",
      excerpt_ar: "",
      excerpt_en: "",
      content_ar: "",
      content_en: "",
      author_name: "Youssef Rehab",
      reading_minutes: 5,
      tags: [],
      keywords: [],
      faq: [],
      related_slugs: [],
      gallery: [],
      related_article_ids: [],
      workflow_state: "published",
      created_at: now(),
      updated_at: now(),
    }),
  },
  {
    id: "articleCategories",
    title: "أقسام المقالات",
    file: `${SNAP}/insight_categories.json`,
    kind: "list",
    sortKey: "sort_order",
    itemTitle: (x) => x.label_ar,
    siteHref: () => "/insights",
    sections: [
      {
        title: "القسم",
        fields: [
          { key: "label", label: "اسم القسم", type: "text", bi: true },
          { key: "slug", label: "رابط القسم", type: "text", dir: "ltr" },
          { key: "description", label: "الوصف", type: "textarea", bi: true },
        ],
      },
    ],
    newItem: (list) => ({ id: uuid(), slug: `category-${list.length + 1}`, label_ar: "", label_en: "", description_ar: "", description_en: "", sort_order: nextSort(list) }),
  },
  {
    id: "settings",
    title: "بيانات التواصل",
    description: "الإيميل والأرقام والروابط — بتتغيّر في كل مكان في الموقع مرة واحدة (الفوتر، صفحة التواصل، زرار واتساب…).",
    file: "src/content/contact.json",
    kind: "single",
    siteHref: () => "/contact",
    sections: [
      {
        title: "الإيميل",
        fields: [
          { key: "email", label: "الإيميل الأساسي", type: "text", dir: "ltr", hint: "بيظهر في الفوتر وصفحة التواصل" },
          { key: "cta_email", label: "الإيميل تحت زرار «تواصل معي» في الصفحة الرئيسية", type: "text", dir: "ltr" },
        ],
      },
      {
        title: "الموبايل وواتساب",
        fields: [
          { key: "phone_display", label: "الرقم في صفحة التواصل", type: "text", dir: "ltr" },
          { key: "phone_footer", label: "الرقم في الفوتر", type: "text", dir: "ltr" },
          { key: "phone_e164", label: "الرقم الدولي (للاتصال المباشر)", type: "text", dir: "ltr", hint: "بالشكل ده: ‎+201030365405" },
          { key: "whatsapp_url", label: "رابط واتساب", type: "url", hint: "بالشكل ده: https://wa.me/201030365405" },
        ],
      },
      { title: "السوشيال", fields: [{ key: "linkedin_url", label: "لينكدإن", type: "url" }] },
    ],
  },
  {
    id: "projectStats",
    title: "أرقام صفحة المشاريع",
    file: `${SNAP}/projects_page_stats.json`,
    kind: "single",
    index: 0,
    siteHref: () => "/projects",
    sections: [
      {
        title: "الأرقام",
        fields: [
          { key: "projects_count", label: "عدد المشاريع", type: "number", hint: "0 = يتحسب تلقائي" },
          { key: "countries_count", label: "عدد الدول", type: "number" },
          { key: "sectors_count", label: "عدد القطاعات", type: "number" },
        ],
      },
    ],
  },
];

export const TEXTS_FILE = "src/content/dictionary.json";
export const TEXT_SECTIONS_FILE = "src/content/dictionary.sections.json";
export const SEO_FILE = "src/content/seo.json";

/** Every file the dashboard loads (and may write). */
export const CONTENT_FILES: { path: string }[] = Array.from(
  new Set([TEXTS_FILE, TEXT_SECTIONS_FILE, SEO_FILE, ...COLLECTIONS.map((c) => c.file)]),
).map((path) => ({ path }));

export const NAV_GROUPS: { title: string; items: { id: string; title: string }[] }[] = [
  { title: "الرئيسية", items: [{ id: "home", title: "نظرة عامة" }] },
  { title: "المحتوى", items: [{ id: "visual", title: "المحرر المرئي ✦" }, { id: "texts", title: "نصوص الموقع" }, { id: "projects", title: "المشاريع" }, { id: "categories", title: "أقسام المشاريع" }, { id: "media", title: "مكتبة الصور" }] },
  {
    title: "الصفحة الرئيسية",
    items: [
      { id: "services", title: "الخدمات" },
      { id: "methodology", title: "منهجية العمل — العنوان" },
      { id: "steps", title: "منهجية العمل — الخطوات" },
      { id: "clients", title: "العملاء" },
      { id: "testimonials", title: "آراء العملاء" },
      { id: "testimonialStats", title: "آراء العملاء — الأرقام" },
    ],
  },
  {
    title: "فئات الخدمات",
    items: [
      { id: "tierPage", title: "نصوص الصفحة" },
      { id: "tiers", title: "الفئات" },
      { id: "tierFeatures", title: "جدول المقارنة" },
      { id: "tierMeta", title: "المدة والمراجعات" },
      { id: "trustStats", title: "أرقام الثقة" },
      { id: "processSteps", title: "خطوات العمل" },
      { id: "faqs", title: "الأسئلة الشائعة" },
    ],
  },
  { title: "المقالات", items: [{ id: "articles", title: "المقالات" }, { id: "articleCategories", title: "أقسام المقالات" }] },
  { title: "الإعدادات", items: [{ id: "seo", title: "جوجل والمشاركة" }, { id: "settings", title: "بيانات التواصل" }, { id: "projectStats", title: "أرقام صفحة المشاريع" }, { id: "history", title: "سجل التعديلات" }] },
];
