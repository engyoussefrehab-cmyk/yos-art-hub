import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { normalizeBlocks, type ProjectBlock } from "@/lib/project-blocks";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
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
};

function parseBullets(s: string | null): string[] {
  if (!s) return [];
  return s.split("\n").map((l) => l.replace(/^[•\-\s]+/, "").trim()).filter(Boolean);
}

function mapRow(r: any): PortfolioDTO {
  const gallery: string[] = Array.isArray(r.gallery)
    ? r.gallery.map((g: any) => (typeof g === "string" ? g : g?.url)).filter(Boolean)
    : [];
  const cover = r.og_image_url || gallery[0] || "";
  const mockup = gallery[1] || gallery[0] || cover;
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
