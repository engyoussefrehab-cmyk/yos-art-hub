// Prebuilt block templates for common project-page sections.
// Each template returns an array of new blocks (with fresh IDs) that can
// be appended to an existing layout.
import { newBlock, type ProjectBlock } from "@/lib/project-blocks";

export type TemplateId =
  | "hero-intro"
  | "case-study"
  | "gallery-showcase"
  | "stats-impact"
  | "brand-guidelines"
  | "before-after"
  | "process-3-steps"
  | "full-brand-identity"
  | "packaging-project"
  | "digital-marketing"
  | "logo-showcase"
  | "company-profile"
  | "social-media-campaign";

export type TemplateMeta = {
  id: TemplateId;
  label_ar: string;
  label_en: string;
  desc_ar: string;
};

export const BLOCK_TEMPLATES: TemplateMeta[] = [
  { id: "hero-intro", label_ar: "مقدمة + صورة رئيسية", label_en: "Hero + Intro", desc_ar: "عنوان كبير، نص تعريفي، وصورة عريضة." },
  { id: "case-study", label_ar: "دراسة حالة كاملة", label_en: "Full Case Study", desc_ar: "تحدي + حل + نتائج + إحصائيات." },
  { id: "gallery-showcase", label_ar: "عرض معرض صور", label_en: "Gallery Showcase", desc_ar: "عنوان + معرض شبكي 3 أعمدة." },
  { id: "stats-impact", label_ar: "إحصائيات الأثر", label_en: "Impact Stats", desc_ar: "3 أرقام بارزة مع عنوان." },
  { id: "brand-guidelines", label_ar: "دليل الهوية", label_en: "Brand Guidelines", desc_ar: "لوحة ألوان + طباعة (صورتان)." },
  { id: "before-after", label_ar: "قبل / بعد", label_en: "Before / After", desc_ar: "صورتان جنبًا إلى جنب مع عنوان." },
  { id: "process-3-steps", label_ar: "منهجية العمل (3 خطوات)", label_en: "3-Step Process", desc_ar: "عناوين فرعية مع فقرات." },
  { id: "full-brand-identity", label_ar: "هوية بصرية موسّعة", label_en: "Full Brand Identity", desc_ar: "بطل + منهجية + ألوان + طباعة + مخرجات + معرض + شهادة + التالي." },
  { id: "packaging-project", label_ar: "مشروع تغليف منتج", label_en: "Product Packaging", desc_ar: "بطل + تحدي + قبل/بعد + معرض تغليف + إحصائيات." },
  { id: "digital-marketing", label_ar: "حملة تسويق رقمي", label_en: "Digital Marketing Campaign", desc_ar: "بطل + استراتيجية + قنوات + إحصائيات نمو + فيديو + شهادة." },
  { id: "logo-showcase", label_ar: "عرض شعار", label_en: "Logo Showcase", desc_ar: "بطل + شعار كبير + نسخ الشعار + ألوان + تطبيقات." },
  { id: "company-profile", label_ar: "ملف تعريفي لشركة", label_en: "Company Profile", desc_ar: "بطل + بيانات المشروع + مخرجات + معرض صفحات + رابط تحميل." },
  { id: "social-media-campaign", label_ar: "حملة سوشيال ميديا", label_en: "Social Media Campaign", desc_ar: "بطل + أهداف + معرض بوستات + إحصائيات تفاعل + شهادة." },
];

function withPatch<T extends ProjectBlock>(type: T["type"], patch: Partial<T>): T {
  return { ...newBlock(type), ...patch } as T;
}

export function buildTemplate(id: TemplateId): ProjectBlock[] {
  switch (id) {
    case "hero-intro":
      return [
        withPatch("heading", { text_ar: "عن المشروع", text_en: "About the project", level: 2, align: "start" } as any),
        withPatch("text", { content_ar: "نبذة قصيرة عن سياق المشروع وأهدافه…", content_en: "A short intro about the project's context and goals…" } as any),
        withPatch("image", { width: "full" } as any),
      ];
    case "case-study":
      return [
        withPatch("heading", { text_ar: "التحدي", text_en: "The Challenge", level: 2 } as any),
        withPatch("text", { content_ar: "صف المشكلة أو الفرصة…", content_en: "Describe the problem or opportunity…" } as any),
        withPatch("heading", { text_ar: "الحل", text_en: "The Solution", level: 2 } as any),
        withPatch("text", { content_ar: "اشرح المقاربة الاستراتيجية والتصميمية…", content_en: "Explain the strategic and design approach…" } as any),
        withPatch("image", { width: "wide" } as any),
        withPatch("heading", { text_ar: "النتائج", text_en: "Results", level: 2 } as any),
        withPatch("stats", {
          items: [
            { label_ar: "زيادة الوعي", label_en: "Awareness lift", value: "+120%" },
            { label_ar: "معدل التفاعل", label_en: "Engagement", value: "3.4×" },
            { label_ar: "الرضا", label_en: "Satisfaction", value: "98%" },
          ],
        } as any),
      ];
    case "gallery-showcase":
      return [
        withPatch("heading", { text_ar: "معرض الأعمال", text_en: "Showcase", level: 2 } as any),
        withPatch("gallery", { urls: [], columns: 3 } as any),
      ];
    case "stats-impact":
      return [
        withPatch("heading", { text_ar: "الأثر بالأرقام", text_en: "Impact in Numbers", level: 2, align: "center" } as any),
        withPatch("stats", {
          items: [
            { label_ar: "عملاء جدد", label_en: "New clients", value: "+50" },
            { label_ar: "نمو المبيعات", label_en: "Sales growth", value: "2.1×" },
            { label_ar: "متابعون", label_en: "Followers", value: "18K" },
          ],
        } as any),
      ];
    case "brand-guidelines":
      return [
        withPatch("heading", { text_ar: "نظام الهوية", text_en: "Brand System", level: 2 } as any),
        withPatch("palette", {
          colors: [
            { name: "Primary", hex: "#0F172A" },
            { name: "Accent", hex: "#F97316" },
            { name: "Cream", hex: "#F5EFE6" },
            { name: "Ink", hex: "#111827" },
          ],
        } as any),
        withPatch("two-col-image", {} as any),
      ];
    case "before-after":
      return [
        withPatch("heading", { text_ar: "قبل / بعد", text_en: "Before / After", level: 2, align: "center" } as any),
        withPatch("two-col-image", {} as any),
      ];
    case "process-3-steps":
      return [
        withPatch("heading", { text_ar: "منهجية العمل", text_en: "Our Process", level: 2 } as any),
        withPatch("heading", { text_ar: "١. الاكتشاف", text_en: "1. Discovery", level: 3 } as any),
        withPatch("text", { content_ar: "أبحاث، ورش استراتيجية، ورؤى.", content_en: "Research, strategy workshops, insights." } as any),
        withPatch("heading", { text_ar: "٢. التصميم", text_en: "2. Design", level: 3 } as any),
        withPatch("text", { content_ar: "استكشاف بصري وتطوير النظام.", content_en: "Visual exploration and system design." } as any),
        withPatch("heading", { text_ar: "٣. التطبيق", text_en: "3. Delivery", level: 3 } as any),
        withPatch("text", { content_ar: "دليل هوية وأصول جاهزة للتطبيق.", content_en: "Guidelines and production-ready assets." } as any),
      ];
    case "full-brand-identity":
      return [
        withPatch("hero", {
          kicker_ar: "هوية بصرية", kicker_en: "Brand Identity",
          subtitle_ar: "نظام هوية متكامل يعكس جوهر العلامة.",
          subtitle_en: "A complete identity system reflecting the brand's essence.",
          show_meta_card: true,
        } as any),
        withPatch("cover", { url: "" } as any),
        withPatch("approach", {
          kicker_ar: "المنهجية", kicker_en: "Approach",
          title_ar: "كيف بنينا الهوية", title_en: "How we built the identity",
          items_ar: ["بحث واستكشاف", "استراتيجية التموضع", "استكشاف بصري", "تطوير النظام", "التطبيقات النهائية"],
          items_en: ["Research & discovery", "Positioning strategy", "Visual exploration", "System development", "Final applications"],
        } as any),
        withPatch("palette", {
          title_ar: "لوحة الألوان", title_en: "Color Palette",
          colors: [
            { name: "Primary", hex: "#0F172A" },
            { name: "Accent", hex: "#F97316" },
            { name: "Cream", hex: "#F5EFE6" },
            { name: "Ink", hex: "#111827" },
          ],
        } as any),
        withPatch("typography", {
          title_ar: "الطباعة", title_en: "Typography",
          heading_font: "Readex Pro", body_font: "Inter",
          sample_ar: "الجمال في التفاصيل.", sample_en: "Beauty lives in details.",
        } as any),
        withPatch("deliverables", {
          title_ar: "المخرجات", title_en: "Deliverables",
          items: [
            { label_ar: "شعار رئيسي ومتغيراته", label_en: "Primary logo & variants" },
            { label_ar: "دليل الهوية الكامل", label_en: "Full brand guidelines" },
            { label_ar: "قرطاسية", label_en: "Stationery" },
            { label_ar: "قوالب سوشيال ميديا", label_en: "Social media templates" },
          ],
        } as any),
        withPatch("gallery", { urls: [], columns: 3 } as any),
        withPatch("testimonial", {
          quote_ar: "نتيجة استثنائية تفوق التوقعات.",
          quote_en: "An exceptional result that exceeded expectations.",
          rating: 5,
        } as any),
        withPatch("next-project", {} as any),
      ];
    case "packaging-project":
      return [
        withPatch("hero", {
          kicker_ar: "تغليف منتج", kicker_en: "Product Packaging",
          subtitle_ar: "تصميم تغليف يبرز على الرف ويحكي قصة المنتج.",
          subtitle_en: "Packaging that stands out on shelf and tells the product story.",
        } as any),
        withPatch("cover", { url: "" } as any),
        withPatch("heading", { text_ar: "التحدي", text_en: "The Challenge", level: 2 } as any),
        withPatch("text", { content_ar: "منتج جديد يحتاج حضورًا بصريًا مميزًا في سوق مزدحم.", content_en: "A new product needing distinct shelf presence in a crowded market." } as any),
        withPatch("before-after", {
          before_url: "", after_url: "",
          label_before_ar: "قبل", label_before_en: "Before",
          label_after_ar: "بعد", label_after_en: "After",
        } as any),
        withPatch("heading", { text_ar: "تطبيقات التغليف", text_en: "Packaging Applications", level: 2 } as any),
        withPatch("gallery", { urls: [], columns: 2 } as any),
        withPatch("palette", {
          title_ar: "ألوان التغليف", title_en: "Packaging Colors",
          colors: [{ name: "Primary", hex: "#0F172A" }, { name: "Accent", hex: "#F97316" }],
        } as any),
        withPatch("stats", {
          items: [
            { label_ar: "نمو المبيعات", label_en: "Sales growth", value: "+65%" },
            { label_ar: "التمييز على الرف", label_en: "Shelf recognition", value: "3.2×" },
            { label_ar: "رضا العملاء", label_en: "Customer satisfaction", value: "96%" },
          ],
        } as any),
        withPatch("next-project", {} as any),
      ];
    case "digital-marketing":
      return [
        withPatch("hero", {
          kicker_ar: "تسويق رقمي", kicker_en: "Digital Marketing",
          subtitle_ar: "حملة متعددة القنوات لنمو حقيقي وقابل للقياس.",
          subtitle_en: "A multi-channel campaign for real, measurable growth.",
        } as any),
        withPatch("cover", { url: "" } as any),
        withPatch("approach", {
          kicker_ar: "الاستراتيجية", kicker_en: "Strategy",
          title_ar: "خطة الحملة", title_en: "Campaign Strategy",
          items_ar: ["تحليل الجمهور", "رسائل الحملة", "خطة المحتوى", "توزيع القنوات", "قياس الأداء"],
          items_en: ["Audience analysis", "Campaign messaging", "Content plan", "Channel distribution", "Performance tracking"],
        } as any),
        withPatch("deliverables", {
          title_ar: "القنوات", title_en: "Channels",
          items: [
            { label_ar: "إعلانات ميتا", label_en: "Meta Ads" },
            { label_ar: "إعلانات جوجل", label_en: "Google Ads" },
            { label_ar: "تيك توك", label_en: "TikTok" },
            { label_ar: "بريد إلكتروني", label_en: "Email marketing" },
          ],
        } as any),
        withPatch("stats", {
          items: [
            { label_ar: "الظهور", label_en: "Impressions", value: "2.4M" },
            { label_ar: "التحويل", label_en: "Conversion", value: "+185%" },
            { label_ar: "عائد الإنفاق", label_en: "ROAS", value: "5.8×" },
            { label_ar: "تكلفة الاكتساب", label_en: "CAC", value: "-42%" },
          ],
        } as any),
        withPatch("video", { url: "" } as any),
        withPatch("gallery", { urls: [], columns: 3 } as any),
        withPatch("testimonial", {
          quote_ar: "أرقام تتحدث عن نفسها.",
          quote_en: "The numbers speak for themselves.",
          rating: 5,
        } as any),
        withPatch("next-project", {} as any),
      ];
    case "logo-showcase":
      return [
        withPatch("hero", {
          kicker_ar: "تصميم شعار", kicker_en: "Logo Design",
          subtitle_ar: "شعار يجسّد شخصية العلامة في أبسط شكل.",
          subtitle_en: "A logo that captures the brand's personality in its purest form.",
        } as any),
        withPatch("image", { url: "", width: "wide" } as any),
        withPatch("heading", { text_ar: "المفهوم", text_en: "The Concept", level: 2 } as any),
        withPatch("text", { content_ar: "الفكرة الجوهرية خلف تصميم الشعار.", content_en: "The core idea behind the logo design." } as any),
        withPatch("heading", { text_ar: "نسخ الشعار", text_en: "Logo Variants", level: 2 } as any),
        withPatch("gallery", { urls: [], columns: 3 } as any),
        withPatch("palette", {
          title_ar: "الألوان", title_en: "Colors",
          colors: [{ name: "Primary", hex: "#0F172A" }, { name: "Accent", hex: "#F97316" }],
        } as any),
        withPatch("heading", { text_ar: "تطبيقات الشعار", text_en: "Logo in Use", level: 2 } as any),
        withPatch("gallery", { urls: [], columns: 2 } as any),
        withPatch("next-project", {} as any),
      ];
    case "company-profile":
      return [
        withPatch("hero", {
          kicker_ar: "ملف تعريفي", kicker_en: "Company Profile",
          subtitle_ar: "مطبوعة احترافية تعرّف الجمهور بالشركة وخدماتها.",
          subtitle_en: "A professional booklet introducing the company and its services.",
          show_meta_card: true,
        } as any),
        withPatch("cover", { url: "" } as any),
        withPatch("meta", {
          title_ar: "بيانات المشروع", title_en: "Project Details",
          items: [
            { label_ar: "العميل", label_en: "Client", value_ar: "", value_en: "" },
            { label_ar: "القطاع", label_en: "Industry", value_ar: "", value_en: "" },
            { label_ar: "الصفحات", label_en: "Pages", value_ar: "24", value_en: "24" },
            { label_ar: "السنة", label_en: "Year", value_ar: "2025", value_en: "2025" },
          ],
        } as any),
        withPatch("deliverables", {
          title_ar: "المخرجات", title_en: "Deliverables",
          items: [
            { label_ar: "تصميم كامل للملف", label_en: "Full profile design" },
            { label_ar: "ملف PDF تفاعلي", label_en: "Interactive PDF" },
            { label_ar: "نسخة جاهزة للطباعة", label_en: "Print-ready file" },
            { label_ar: "قوالب InDesign", label_en: "InDesign templates" },
          ],
        } as any),
        withPatch("heading", { text_ar: "معاينة الصفحات", text_en: "Page Previews", level: 2 } as any),
        withPatch("gallery", { urls: [], columns: 2 } as any),
        withPatch("links", {
          title_ar: "روابط", title_en: "Links",
          items: [{ label_ar: "تحميل الملف", label_en: "Download profile", url: "", kind: "custom" }],
        } as any),
        withPatch("next-project", {} as any),
      ];
    case "social-media-campaign":
      return [
        withPatch("hero", {
          kicker_ar: "سوشيال ميديا", kicker_en: "Social Media",
          subtitle_ar: "حملة محتوى بصري متكامل لبناء حضور رقمي قوي.",
          subtitle_en: "An integrated visual content campaign for a strong digital presence.",
        } as any),
        withPatch("cover", { url: "" } as any),
        withPatch("approach", {
          kicker_ar: "الأهداف", kicker_en: "Objectives",
          title_ar: "أهداف الحملة", title_en: "Campaign Goals",
          items_ar: ["زيادة الوعي بالعلامة", "بناء مجتمع نشط", "توليد عملاء محتملين", "تعزيز التفاعل"],
          items_en: ["Brand awareness", "Community building", "Lead generation", "Engagement boost"],
        } as any),
        withPatch("heading", { text_ar: "معرض البوستات", text_en: "Posts Gallery", level: 2 } as any),
        withPatch("gallery", { urls: [], columns: 3 } as any),
        withPatch("stats", {
          items: [
            { label_ar: "الوصول", label_en: "Reach", value: "850K" },
            { label_ar: "التفاعل", label_en: "Engagement", value: "+240%" },
            { label_ar: "متابعون جدد", label_en: "New followers", value: "+18K" },
            { label_ar: "معدل التفاعل", label_en: "ER", value: "9.4%" },
          ],
        } as any),
        withPatch("video", { url: "" } as any),
        withPatch("testimonial", {
          quote_ar: "قفزة نوعية في حضورنا الرقمي.",
          quote_en: "A qualitative leap in our digital presence.",
          rating: 5,
        } as any),
        withPatch("next-project", {} as any),
      ];
  }
}
