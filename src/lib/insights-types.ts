export type Lang = "ar" | "en";
export type ArticleStatus = "draft" | "scheduled" | "published";

export interface InsightCategoryRow {
  id: string;
  slug: string;
  label_ar: string;
  label_en: string;
  description_ar: string;
  description_en: string;
  sort_order: number;
}

export interface FaqItemRow {
  q_ar: string;
  q_en: string;
  a_ar: string;
  a_en: string;
}

export interface InsightArticleRow {
  id: string;
  slug: string;
  category_id: string;
  status: ArticleStatus;
  published_at: string | null;
  featured: boolean;

  title_ar: string;
  title_en: string;
  excerpt_ar: string;
  excerpt_en: string;
  content_ar: string;
  content_en: string;

  seo_title_ar: string;
  seo_title_en: string;
  seo_description_ar: string;
  seo_description_en: string;

  cover_url: string | null;
  featured_image_url: string | null;

  author_name: string;
  author_avatar_url: string | null;

  reading_minutes: number;
  tags: string[];
  keywords: string[];
  faq: FaqItemRow[];
  related_slugs: string[];

  created_at: string;
  updated_at: string;
}

// Denormalized view used by public UI
export interface InsightArticle extends InsightArticleRow {
  category: InsightCategoryRow;
}

export function formatDate(iso: string | null, lang: Lang): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

// Simple defense-in-depth sanitizer for admin-authored HTML.
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

export function coverUrl(row: { cover_url: string | null }): string | null {
  return row.cover_url ?? null;
}
