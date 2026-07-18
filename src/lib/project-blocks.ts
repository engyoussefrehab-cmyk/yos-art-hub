// Modular page-builder blocks for portfolio project detail pages.
// All block data is stored inside portfolio_projects.layout_blocks (JSONB).
//
// Every visible section on the public project page is a block.
// Blocks support: per-block enabled (show/hide), drag & drop ordering,
// bilingual title/subtitle/content, images, videos, colors.

export type BlockBase = { id: string; enabled?: boolean };

export type HeroBlock = BlockBase & {
  type: "hero";
  kicker_ar?: string;
  kicker_en?: string;
  title_ar?: string; // if empty, falls back to project.name_*
  title_en?: string;
  subtitle_ar?: string; // short description
  subtitle_en?: string;
  description_ar?: string; // long paragraph
  description_en?: string;
  show_meta_card?: boolean; // specialty/type card on the right
  specialty_label_ar?: string;
  specialty_label_en?: string;
  specialty_value_ar?: string;
  specialty_value_en?: string;
  type_label_ar?: string;
  type_label_en?: string;
  type_value_ar?: string;
  type_value_en?: string;
};

export type CoverBlock = BlockBase & {
  type: "cover";
  url: string;
  alt_ar?: string;
  alt_en?: string;
};

export type ApproachBlock = BlockBase & {
  type: "approach";
  kicker_ar?: string;
  kicker_en?: string;
  title_ar?: string;
  title_en?: string;
  items_ar?: string[];
  items_en?: string[];
  value_label_ar?: string;
  value_label_en?: string;
  value_ar?: string;
  value_en?: string;
};

export type MetaBlock = BlockBase & {
  type: "meta";
  title_ar?: string;
  title_en?: string;
  items: { label_ar?: string; label_en?: string; value_ar?: string; value_en?: string; icon?: string }[];
};

export type DeliverablesBlock = BlockBase & {
  type: "deliverables";
  title_ar?: string;
  title_en?: string;
  items: { label_ar?: string; label_en?: string; icon?: string }[];
};

export type TypographyBlock = BlockBase & {
  type: "typography";
  title_ar?: string;
  title_en?: string;
  heading_font?: string;
  body_font?: string;
  sample_ar?: string;
  sample_en?: string;
};

export type LinksBlock = BlockBase & {
  type: "links";
  title_ar?: string;
  title_en?: string;
  items: { label_ar?: string; label_en?: string; url: string; kind?: "live" | "behance" | "figma" | "custom" }[];
};

export type TestimonialBlock = BlockBase & {
  type: "testimonial";
  quote_ar?: string;
  quote_en?: string;
  author_name?: string;
  author_role_ar?: string;
  author_role_en?: string;
  author_avatar_url?: string;
  rating?: number; // 1-5
};

export type EmbedBlock = BlockBase & {
  type: "embed";
  url: string;
  aspect?: "16/9" | "4/3" | "1/1" | "9/16";
  caption_ar?: string;
  caption_en?: string;
};

export type NextProjectBlock = BlockBase & {
  type: "next-project";
  label_ar?: string;
  label_en?: string;
  cta_ar?: string;
  cta_en?: string;
  all_label_ar?: string;
  all_label_en?: string;
};

export type TextBlock = BlockBase & {
  type: "text";
  content_ar?: string;
  content_en?: string;
  align?: "start" | "center";
};

export type HeadingBlock = BlockBase & {
  type: "heading";
  text_ar?: string;
  text_en?: string;
  level?: 2 | 3;
  align?: "start" | "center";
};

export type ImageBlock = BlockBase & {
  type: "image";
  url: string;
  caption_ar?: string;
  caption_en?: string;
  width?: "full" | "wide" | "narrow";
};

export type TwoColImageBlock = BlockBase & {
  type: "two-col-image";
  url_left: string;
  url_right: string;
};

export type GalleryBlock = BlockBase & {
  type: "gallery";
  urls: string[];
  columns?: 2 | 3 | 4;
};

export type QuoteBlock = BlockBase & {
  type: "quote";
  text_ar?: string;
  text_en?: string;
  author?: string;
};

export type PaletteBlock = BlockBase & {
  type: "palette";
  title_ar?: string;
  title_en?: string;
  colors: { name?: string; hex: string; token?: string }[];
};

export type VideoBlock = BlockBase & {
  type: "video";
  url: string;
  caption_ar?: string;
  caption_en?: string;
};

export type StatsBlock = BlockBase & {
  type: "stats";
  items: { label_ar?: string; label_en?: string; value: string }[];
};

export type CalloutBlock = BlockBase & {
  type: "callout";
  text_ar?: string;
  text_en?: string;
  tone?: "info" | "success" | "accent";
};

export type SpacerBlock = BlockBase & {
  type: "spacer";
  size?: "sm" | "md" | "lg";
};

export type BeforeAfterBlock = BlockBase & {
  type: "before-after";
  before_url: string;
  after_url: string;
  label_before_ar?: string;
  label_before_en?: string;
  label_after_ar?: string;
  label_after_en?: string;
  orientation?: "horizontal" | "vertical";
  caption_ar?: string;
  caption_en?: string;
};

export type ProjectBlock =
  | HeroBlock
  | CoverBlock
  | ApproachBlock
  | MetaBlock
  | DeliverablesBlock
  | TypographyBlock
  | LinksBlock
  | TestimonialBlock
  | EmbedBlock
  | NextProjectBlock
  | TextBlock
  | HeadingBlock
  | ImageBlock
  | TwoColImageBlock
  | GalleryBlock
  | QuoteBlock
  | PaletteBlock
  | VideoBlock
  | StatsBlock
  | CalloutBlock
  | SpacerBlock
  | BeforeAfterBlock;

export type BlockType = ProjectBlock["type"];

export const BLOCK_LABELS: Record<BlockType, { ar: string; en: string }> = {
  hero: { ar: "قسم البطل (رأس الصفحة)", en: "Hero" },
  cover: { ar: "صورة الغلاف", en: "Cover Image" },
  approach: { ar: "المنهجية", en: "Approach" },
  meta: { ar: "بيانات المشروع", en: "Project Meta" },
  deliverables: { ar: "المخرجات", en: "Deliverables" },
  typography: { ar: "الطباعة", en: "Typography" },
  links: { ar: "روابط خارجية", en: "External Links" },
  testimonial: { ar: "شهادة عميل", en: "Testimonial" },
  embed: { ar: "تضمين خارجي (iframe)", en: "Embed" },
  "next-project": { ar: "المشروع التالي", en: "Next Project CTA" },
  heading: { ar: "عنوان", en: "Heading" },
  text: { ar: "نص", en: "Text" },
  image: { ar: "صورة", en: "Image" },
  "two-col-image": { ar: "صورتان جنبًا إلى جنب", en: "Two-column image" },
  gallery: { ar: "معرض صور", en: "Gallery grid" },
  quote: { ar: "اقتباس", en: "Quote" },
  palette: { ar: "لوحة ألوان", en: "Color palette" },
  video: { ar: "فيديو", en: "Video" },
  stats: { ar: "إحصائيات", en: "Stats" },
  callout: { ar: "تنبيه بارز", en: "Callout" },
  spacer: { ar: "فاصل", en: "Spacer" },
  "before-after": { ar: "قبل / بعد", en: "Before / After" },
};

export function newBlock(type: BlockType): ProjectBlock {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `b_${Math.random().toString(36).slice(2)}${Date.now()}`;
  switch (type) {
    case "hero":
      return {
        id, type,
        kicker_ar: "", kicker_en: "",
        title_ar: "", title_en: "",
        subtitle_ar: "", subtitle_en: "",
        description_ar: "", description_en: "",
        show_meta_card: true,
        specialty_label_ar: "التخصص", specialty_label_en: "Specialty",
        type_label_ar: "النوع", type_label_en: "Type",
      };
    case "cover":
      return { id, type, url: "" };
    case "approach":
      return {
        id, type,
        kicker_ar: "منهجية العمل", kicker_en: "Our Approach",
        title_ar: "كيف بنينا الهوية", title_en: "How We Built the Identity",
        items_ar: [], items_en: [],
        value_label_ar: "القيمة", value_label_en: "Value",
      };
    case "meta":
      return { id, type, title_ar: "بيانات المشروع", title_en: "Project Details", items: [] };
    case "deliverables":
      return { id, type, title_ar: "المخرجات", title_en: "Deliverables", items: [] };
    case "typography":
      return { id, type, title_ar: "الطباعة", title_en: "Typography", heading_font: "", body_font: "" };
    case "links":
      return { id, type, title_ar: "روابط ذات صلة", title_en: "Related Links", items: [] };
    case "testimonial":
      return { id, type, quote_ar: "", quote_en: "", author_name: "", rating: 5 };
    case "embed":
      return { id, type, url: "", aspect: "16/9" };
    case "next-project":
      return {
        id, type,
        label_ar: "المشروع التالي", label_en: "Next Project",
        cta_ar: "التالي", cta_en: "Next",
        all_label_ar: "كل المشاريع", all_label_en: "All projects",
      };
    case "heading":
      return { id, type, text_ar: "", text_en: "", level: 2, align: "start" };
    case "text":
      return { id, type, content_ar: "", content_en: "", align: "start" };
    case "image":
      return { id, type, url: "", width: "wide" };
    case "two-col-image":
      return { id, type, url_left: "", url_right: "" };
    case "gallery":
      return { id, type, urls: [], columns: 3 };
    case "quote":
      return { id, type, text_ar: "", text_en: "", author: "" };
    case "palette":
      return { id, type, title_ar: "لوحة الألوان", title_en: "Color Palette", colors: [] };
    case "video":
      return { id, type, url: "" };
    case "stats":
      return { id, type, items: [] };
    case "callout":
      return { id, type, text_ar: "", text_en: "", tone: "accent" };
    case "spacer":
      return { id, type, size: "md" };
    case "before-after":
      return {
        id,
        type,
        before_url: "",
        after_url: "",
        label_before_ar: "قبل",
        label_before_en: "Before",
        label_after_ar: "بعد",
        label_after_en: "After",
        orientation: "horizontal",
      };
  }
}

export function normalizeBlocks(input: unknown): ProjectBlock[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((b: any) => {
      if (!b || typeof b !== "object" || !b.type) return null;
      const id = typeof b.id === "string" ? b.id : `b_${Math.random().toString(36).slice(2)}`;
      return { ...b, id } as ProjectBlock;
    })
    .filter((b): b is ProjectBlock => !!b);
}

/**
 * Synthesize default blocks from legacy portfolio_projects columns.
 * Used when a project has no `hero` block yet, so the public page still
 * renders correctly during the migration to a fully block-driven layout.
 */
export function synthesizeDefaultBlocks(row: any): ProjectBlock[] {
  const existing = normalizeBlocks(row?.layout_blocks);
  const hasType = (t: BlockType) => existing.some((b) => b.type === t);

  const gallery: string[] = Array.isArray(row?.gallery)
    ? row.gallery.map((g: any) => (typeof g === "string" ? g : g?.url)).filter(Boolean)
    : [];
  const cover = row?.thumbnail_url || row?.og_image_url || gallery[0] || row?.hero_image_url || "";

  const solutionAr = String(row?.solution_ar ?? "");
  const solutionEn = String(row?.solution_en ?? row?.solution_ar ?? "");
  const parseBullets = (s: string): string[] =>
    s.split("\n").map((l) => l.replace(/^[•\-\s]+/, "").trim()).filter(Boolean);
  const items_ar = parseBullets(solutionAr);
  const items_en = parseBullets(solutionEn);

  const rid = (s: string) => `syn_${s}_${row?.id ?? row?.slug ?? "x"}`;
  const prefix: ProjectBlock[] = [];

  if (!hasType("hero")) {
    prefix.push({
      id: rid("hero"),
      type: "hero",
      title_ar: row?.name_ar ?? "",
      title_en: row?.name_en ?? row?.name_ar ?? "",
      subtitle_ar: row?.short_description_ar ?? "",
      subtitle_en: row?.short_description_en ?? row?.short_description_ar ?? "",
      description_ar: row?.challenge_ar ?? "",
      description_en: row?.challenge_en ?? row?.challenge_ar ?? "",
      show_meta_card: true,
      specialty_label_ar: "التخصص",
      specialty_label_en: "Specialty",
      type_label_ar: "النوع",
      type_label_en: "Type",
      type_value_ar: row?.industry ?? "",
      type_value_en: row?.industry ?? "",
    } as HeroBlock);
  }

  if (!hasType("cover") && cover) {
    prefix.push({ id: rid("cover"), type: "cover", url: cover } as CoverBlock);
  }

  if (!hasType("approach") && (items_ar.length > 0 || items_en.length > 0)) {
    prefix.push({
      id: rid("approach"),
      type: "approach",
      kicker_ar: "منهجية العمل",
      kicker_en: "Our Approach",
      title_ar: "كيف بنينا الهوية",
      title_en: "How We Built the Identity",
      items_ar,
      items_en,
      value_label_ar: "القيمة",
      value_label_en: "Value",
      value_ar: row?.results_ar ?? "",
      value_en: row?.results_en ?? row?.results_ar ?? "",
    } as ApproachBlock);
  }

  // Legacy dedicated columns → blocks (only if not already present)
  const brandColors = Array.isArray(row?.brand_colors) ? row.brand_colors : [];
  if (!hasType("palette") && brandColors.length > 0) {
    prefix.push({
      id: rid("palette"),
      type: "palette",
      title_ar: "لوحة الألوان",
      title_en: "Color Palette",
      colors: brandColors
        .map((c: any) => (typeof c === "string" ? { hex: c } : { name: c?.name, hex: c?.hex, token: c?.token }))
        .filter((c: any) => c && c.hex),
    } as PaletteBlock);
  }

  const typo = row?.typography && typeof row.typography === "object" ? row.typography : null;
  if (!hasType("typography") && typo && (typo.heading_font || typo.body_font)) {
    prefix.push({
      id: rid("typo"),
      type: "typography",
      title_ar: "الطباعة",
      title_en: "Typography",
      heading_font: typo.heading_font ?? "",
      body_font: typo.body_font ?? "",
      sample_ar: typo.sample_ar ?? "",
      sample_en: typo.sample_en ?? "",
    } as TypographyBlock);
  }

  const deliverables = row?.deliverables && typeof row.deliverables === "object" ? row.deliverables : null;
  if (!hasType("deliverables") && deliverables) {
    const arr = Array.isArray(deliverables) ? deliverables : (deliverables.items ?? []);
    if (Array.isArray(arr) && arr.length > 0) {
      prefix.push({
        id: rid("deliv"),
        type: "deliverables",
        title_ar: "المخرجات",
        title_en: "Deliverables",
        items: arr.map((d: any) => ({
          label_ar: typeof d === "string" ? d : d?.label_ar ?? d?.ar,
          label_en: typeof d === "string" ? d : d?.label_en ?? d?.en,
        })),
      } as DeliverablesBlock);
    }
  }

  // Meta: client/role/team/duration/year/country
  const metaFields = [
    ["client", row?.client],
    ["role", row?.role],
    ["team", row?.team],
    ["duration", row?.duration],
    ["year", row?.year],
    ["country", row?.client_country],
  ].filter(([, v]) => v);
  if (!hasType("meta") && metaFields.length > 0) {
    const LBL: Record<string, { ar: string; en: string }> = {
      client: { ar: "العميل", en: "Client" },
      role: { ar: "الدور", en: "Role" },
      team: { ar: "الفريق", en: "Team" },
      duration: { ar: "المدة", en: "Duration" },
      year: { ar: "السنة", en: "Year" },
      country: { ar: "الدولة", en: "Country" },
    };
    prefix.push({
      id: rid("meta"),
      type: "meta",
      title_ar: "بيانات المشروع",
      title_en: "Project Details",
      items: metaFields.map(([k, v]) => ({
        label_ar: LBL[k as string].ar,
        label_en: LBL[k as string].en,
        value_ar: String(v),
        value_en: String(v),
      })),
    } as MetaBlock);
  }

  // Links
  const linkItems = [
    { url: row?.project_url, kind: "live" as const },
    { url: row?.behance_url, kind: "behance" as const },
    { url: row?.figma_url, kind: "figma" as const },
  ].filter((l) => l.url);
  if (!hasType("links") && linkItems.length > 0) {
    const KIND: Record<string, { ar: string; en: string }> = {
      live: { ar: "الموقع المباشر", en: "Live site" },
      behance: { ar: "على بيهانس", en: "On Behance" },
      figma: { ar: "على فيجما", en: "On Figma" },
      custom: { ar: "رابط", en: "Link" },
    };
    prefix.push({
      id: rid("links"),
      type: "links",
      title_ar: "روابط ذات صلة",
      title_en: "Related Links",
      items: linkItems.map((l) => ({
        url: l.url,
        kind: l.kind,
        label_ar: KIND[l.kind].ar,
        label_en: KIND[l.kind].en,
      })),
    } as LinksBlock);
  }

  // Testimonial (JSON column)
  const t = row?.testimonial && typeof row.testimonial === "object" ? row.testimonial : null;
  if (!hasType("testimonial") && t && (t.quote_ar || t.quote_en || t.text_ar || t.text_en || t.quote)) {
    prefix.push({
      id: rid("testi"),
      type: "testimonial",
      quote_ar: t.quote_ar ?? t.text_ar ?? t.quote ?? "",
      quote_en: t.quote_en ?? t.text_en ?? t.quote ?? "",
      author_name: t.author_name ?? t.author ?? t.name ?? "",
      author_role_ar: t.author_role_ar ?? t.role_ar ?? "",
      author_role_en: t.author_role_en ?? t.role_en ?? "",
      author_avatar_url: t.author_avatar_url ?? t.avatar_url ?? "",
      rating: typeof t.rating === "number" ? t.rating : 5,
    } as TestimonialBlock);
  }

  // Append legacy gallery tail (all but the first, which becomes cover)
  const galleryTail = gallery.slice(1);
  const suffix: ProjectBlock[] = [];
  if (galleryTail.length > 0 && !hasType("gallery")) {
    suffix.push({
      id: rid("gal"),
      type: "gallery",
      urls: galleryTail,
      columns: 3,
    } as GalleryBlock);
  }

  // Next-project CTA (rendered even without data — component will hide if no next)
  if (!hasType("next-project")) {
    suffix.push({
      id: rid("nextp"),
      type: "next-project",
      label_ar: "المشروع التالي",
      label_en: "Next Project",
      cta_ar: "التالي",
      cta_en: "Next",
      all_label_ar: "كل المشاريع",
      all_label_en: "All projects",
    } as NextProjectBlock);
  }

  return [...prefix, ...existing, ...suffix];
}
