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

// Defense-in-depth sanitizer for admin-authored HTML using DOMPurify.
// Uses a strict allow-list of tags/attributes suitable for article content.
import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "a", "b", "strong", "i", "em", "u", "s", "mark", "small", "sub", "sup",
  "p", "br", "hr", "span", "div",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "img", "figure", "figcaption",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
];

const ALLOWED_ATTR = [
  "href", "title", "target", "rel",
  "src", "alt", "width", "height", "loading",
  "class", "id", "dir", "lang",
  "colspan", "rowspan",
];

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input", "svg", "math"],
    FORBID_ATTR: ["style", "srcdoc", "formaction", "xlink:href"],
    ALLOW_DATA_ATTR: false,
  });
}

export function coverUrl(row: { cover_url: string | null }): string | null {
  return row.cover_url ?? null;
}
