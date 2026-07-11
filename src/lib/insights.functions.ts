import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type {
  InsightArticle,
  InsightArticleRow,
  InsightCategoryRow,
} from "./insights-types";

// Server-only publishable client factory (no session persistence).
async function getPublicClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

const ARTICLE_FIELDS =
  "id,slug,category_id,status,published_at,featured,title_ar,title_en,excerpt_ar,excerpt_en,content_ar,content_en,seo_title_ar,seo_title_en,seo_description_ar,seo_description_en,cover_url,featured_image_url,author_name,author_avatar_url,reading_minutes,tags,keywords,faq,related_slugs,created_at,updated_at,category:insight_categories!inner(id,slug,label_ar,label_en,description_ar,description_en,sort_order)";

function normalize(row: any): InsightArticle {
  return {
    ...(row as InsightArticleRow),
    category: row.category as InsightCategoryRow,
    faq: Array.isArray(row.faq) ? row.faq : [],
    tags: row.tags ?? [],
    keywords: row.keywords ?? [],
    related_slugs: row.related_slugs ?? [],
  };
}

export const getCategoriesFn = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getPublicClient();
  const { data, error } = await supabase
    .from("insight_categories")
    .select("id,slug,label_ar,label_en,description_ar,description_en,sort_order")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as InsightCategoryRow[];
});

export const getPublishedArticlesFn = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getPublicClient();
  const { data, error } = await supabase
    .from("insight_articles")
    .select(ARTICLE_FIELDS)
    .order("published_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map(normalize);
});

export const getFeaturedArticleFn = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getPublicClient();
  const { data } = await supabase
    .from("insight_articles")
    .select(ARTICLE_FIELDS)
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (data) return normalize(data);
  // fallback: newest
  const { data: fallback } = await supabase
    .from("insight_articles")
    .select(ARTICLE_FIELDS)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return fallback ? normalize(fallback) : null;
});

export const getArticleBySlugFn = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string; categorySlug: string }) =>
    z.object({ slug: z.string(), categorySlug: z.string() }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getPublicClient();
    const { data: article } = await supabase
      .from("insight_articles")
      .select(ARTICLE_FIELDS)
      .eq("slug", data.slug)
      .maybeSingle();
    if (!article) return null;
    const norm = normalize(article);
    if (norm.category.slug !== data.categorySlug) return null;
    return norm;
  });

export const getArticlesByCategoryFn = createServerFn({ method: "GET" })
  .inputValidator((input: { categorySlug: string }) =>
    z.object({ categorySlug: z.string() }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getPublicClient();
    const { data: cat } = await supabase
      .from("insight_categories")
      .select("id,slug,label_ar,label_en,description_ar,description_en,sort_order")
      .eq("slug", data.categorySlug)
      .maybeSingle();
    if (!cat) return { category: null, articles: [] as InsightArticle[] };
    const { data: rows } = await supabase
      .from("insight_articles")
      .select(ARTICLE_FIELDS)
      .eq("category_id", cat.id)
      .order("published_at", { ascending: false });
    return {
      category: cat as InsightCategoryRow,
      articles: (rows ?? []).map(normalize),
    };
  });

export const getInsightsHubDataFn = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getPublicClient();
  const [{ data: cats }, { data: arts }] = await Promise.all([
    supabase
      .from("insight_categories")
      .select("id,slug,label_ar,label_en,description_ar,description_en,sort_order")
      .order("sort_order"),
    supabase
      .from("insight_articles")
      .select(ARTICLE_FIELDS)
      .order("published_at", { ascending: false })
      .limit(200),
  ]);
  return {
    categories: (cats ?? []) as InsightCategoryRow[],
    articles: (arts ?? []).map(normalize),
  };
});
