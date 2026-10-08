import { createServerFn } from "@/lib/static-db/static-fn";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { normalizeBlocks, synthesizeDefaultBlocks, type ProjectBlock } from "@/lib/project-blocks";

function publicClient() {
  return createClient<Database>(
    "static",
    "static",
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export type PortfolioDTO = {
  slug: string;
  name_ar: string;
  name_en: string;
  industry: string | null;
  category_slug: string | null;
  short_ar: string;
  short_en: string;
  description_ar: string;
  description_en: string;
  approach_ar: string[];
  approach_en: string[];
  value_ar: string;
  value_en: string;
  cover: string;
  mockup: string;
  gallery: string[];
  featured: boolean;
  sort_order: number;
  blocks: ProjectBlock[];
  seo_title_ar: string | null;
  seo_title_en: string | null;
  seo_description_ar: string | null;
  seo_description_en: string | null;
  og_image_url: string | null;
  country: string | null;
  year: number | null;
  tags: string[];
  published_at: string | null;
};

function parseBullets(s: string | null): string[] {
  if (!s) return [];
  return s.split("\n").map((l) => l.replace(/^[•\-\s]+/, "").trim()).filter(Boolean);
}

function mapRow(r: any): PortfolioDTO {
  const gallery: string[] = Array.isArray(r.gallery)
    ? r.gallery.map((g: any) => (typeof g === "string" ? g : g?.url)).filter(Boolean)
    : [];
  const cover = r.thumbnail_url || r.og_image_url || gallery[0] || "";
  const mockup = r.hero_image_url || gallery[1] || gallery[0] || cover;
  return {
    slug: r.slug,
    name_ar: r.name_ar,
    name_en: r.name_en || r.name_ar,
    industry: r.industry,
    category_slug: r.category_slug,
    short_ar: r.short_description_ar ?? "",
    short_en: r.short_description_en ?? r.short_description_ar ?? "",
    description_ar: r.challenge_ar ?? "",
    description_en: r.challenge_en ?? r.challenge_ar ?? "",
    approach_ar: parseBullets(r.solution_ar),
    approach_en: parseBullets(r.solution_en || r.solution_ar),
    value_ar: r.results_ar ?? "",
    value_en: r.results_en ?? r.results_ar ?? "",
    cover,
    mockup,
    gallery,
    featured: r.featured,
    sort_order: r.sort_order ?? 0,
    blocks: synthesizeDefaultBlocks(r),
    seo_title_ar: r.seo_title_ar ?? null,
    seo_title_en: r.seo_title_en ?? null,
    seo_description_ar: r.seo_description_ar ?? null,
    seo_description_en: r.seo_description_en ?? null,
    og_image_url: r.og_image_url ?? null,
    country: r.client_country ?? null,
    year: r.year ?? null,
    tags: Array.isArray(r.tags_list) ? r.tags_list.filter((t: any) => typeof t === "string") : [],
    published_at: r.published_at ?? null,
  };
}


export const listPortfolio = createServerFn({ method: "GET" })
  .inputValidator((d: { category?: string }) => d)
  .handler(async ({ data }) => {
    const supabase = publicClient();
    let q = supabase
      .from("portfolio_projects")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (data.category) q = q.eq("category_slug", data.category);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []).map(mapRow);
  });

export const getPortfolioBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    return mapRow(row);
  });

export type CategoryFAQ = { q_ar?: string; q_en?: string; a_ar?: string; a_en?: string };

export type CategoryDTO = {
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  cover_image_url: string | null;
  hero_image_url: string | null;
  intro_ar: string | null;
  intro_en: string | null;
  content_ar: string | null;
  content_en: string | null;
  cta_label_ar: string | null;
  cta_label_en: string | null;
  cta_href: string | null;
  faq: CategoryFAQ[];
  seo_title_ar: string | null;
  seo_title_en: string | null;
  seo_description_ar: string | null;
  seo_description_en: string | null;
  seo_keywords: string[] | null;
  og_image_url: string | null;
  featured_project_ids: string[];
  sort_order: number;
  project_count: number;
};

const CAT_COLS =
  "slug,name_ar,name_en,description_ar,description_en,cover_image_url,hero_image_url,intro_ar,intro_en,content_ar,content_en,cta_label_ar,cta_label_en,cta_href,faq,seo_title_ar,seo_title_en,seo_description_ar,seo_description_en,seo_keywords,og_image_url,featured_project_ids,sort_order";

function mapCat(c: any, project_count = 0): CategoryDTO {
  return {
    slug: c.slug,
    name_ar: c.name_ar,
    name_en: c.name_en,
    description_ar: c.description_ar ?? null,
    description_en: c.description_en ?? null,
    cover_image_url: c.cover_image_url ?? null,
    hero_image_url: c.hero_image_url ?? null,
    intro_ar: c.intro_ar ?? null,
    intro_en: c.intro_en ?? null,
    content_ar: c.content_ar ?? null,
    content_en: c.content_en ?? null,
    cta_label_ar: c.cta_label_ar ?? null,
    cta_label_en: c.cta_label_en ?? null,
    cta_href: c.cta_href ?? null,
    faq: Array.isArray(c.faq) ? (c.faq as CategoryFAQ[]) : [],
    seo_title_ar: c.seo_title_ar ?? null,
    seo_title_en: c.seo_title_en ?? null,
    seo_description_ar: c.seo_description_ar ?? null,
    seo_description_en: c.seo_description_en ?? null,
    seo_keywords: Array.isArray(c.seo_keywords) ? c.seo_keywords : null,
    og_image_url: c.og_image_url ?? null,
    featured_project_ids: Array.isArray(c.featured_project_ids) ? c.featured_project_ids : [],
    sort_order: c.sort_order ?? 0,
    project_count,
  };
}

export const listCategories = createServerFn({ method: "GET" })
  .handler(async () => {
    const supabase = publicClient();
    const [cats, projs] = await Promise.all([
      supabase
        .from("project_categories")
        .select(CAT_COLS)
        .eq("is_hidden", false)
        .order("sort_order", { ascending: true }),
      supabase
        .from("portfolio_projects")
        .select("category_slug")
        .eq("status", "published"),
    ]);
    if (cats.error) throw new Error(cats.error.message);
    const counts = new Map<string, number>();
    (projs.data ?? []).forEach((r: any) => {
      if (r.category_slug) counts.set(r.category_slug, (counts.get(r.category_slug) ?? 0) + 1);
    });
    return (cats.data ?? []).map((c: any) => mapCat(c, counts.get(c.slug) ?? 0));
  });

export const getCategoryBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("project_categories")
      .select(CAT_COLS)
      .eq("slug", data.slug)
      .eq("is_hidden", false)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    return mapCat(row);
  });



/* ── Projects page statistics (admin-controlled) ─────────────── */

export type ProjectsStatsDTO = {
  projects_count: number;
  countries_count: number;
  sectors_count: number;
};

export const getProjectsStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProjectsStatsDTO> => {
    const supabase = publicClient();
    const { data } = await supabase
      .from("projects_page_stats")
      .select("projects_count,countries_count,sectors_count")
      .eq("id", "default")
      .maybeSingle();
    return {
      projects_count: data?.projects_count ?? 0,
      countries_count: data?.countries_count ?? 0,
      sectors_count: data?.sectors_count ?? 0,
    };
  },
);
