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
  | "process-3-steps";

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
  }
}
