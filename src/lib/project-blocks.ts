// Modular page-builder blocks for portfolio project detail pages.
// All block data is stored inside portfolio_projects.layout_blocks (JSONB).

export type BlockBase = { id: string; enabled?: boolean };

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
  colors: { name?: string; hex: string }[];
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
      return { id, type, colors: [] };
    case "video":
      return { id, type, url: "" };
    case "stats":
      return { id, type, items: [] };
    case "callout":
      return { id, type, text_ar: "", text_en: "", tone: "accent" };
    case "spacer":
      return { id, type, size: "md" };
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
