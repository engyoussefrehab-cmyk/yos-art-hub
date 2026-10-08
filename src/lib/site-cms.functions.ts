import { createServerFn } from "@/lib/static-db/static-fn";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = "static";
  return createClient<Database>("static", key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type SectionDTO = {
  id: string;
  page_key: string;
  section_key: string;
  layout_variant: string;
  order_index: number;
  is_visible: boolean;
  content: Record<string, any>;
};

export type MenuItemDTO = {
  id: string;
  location: string;
  label_ar: string;
  label_en: string;
  url: string;
  order_index: number;
  is_external: boolean;
  open_in_new_tab: boolean;
  icon: string | null;
};

export type TestimonialDTO = {
  id: string;
  name_ar: string;
  name_en: string | null;
  role_ar: string | null;
  role_en: string | null;
  text_ar: string;
  text_en: string | null;
  rating: number;
  source: string | null;
  source_url: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  is_featured: boolean;
  order_index: number;
};

export type PageSeoDTO = {
  route_key: string;
  title_ar: string | null;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  keywords: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  robots: string;
};

export type SiteSettingsDTO = {
  logo_url: string | null;
  logo_url_dark: string | null;
  favicon_url: string | null;
  og_default_image_url: string | null;
  company_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp_number: string | null;
  address: string | null;
  socials: Record<string, string>;
  analytics: Record<string, string>;
  theme: Record<string, any>;
  copy: Record<string, any>;
  default_lang: string;
};

/** Fetch all sections for a given page in a single call. */
export const getPageSections = createServerFn({ method: "GET" })
  .inputValidator((v: { pageKey: string }) => v)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: rows } = await sb
      .from("site_sections")
      .select("id,page_key,section_key,layout_variant,order_index,is_visible,content")
      .eq("page_key", data.pageKey)
      .eq("is_visible", true)
      .order("order_index", { ascending: true });
    return (rows ?? []) as SectionDTO[];
  });

/** Fetch menu items for a location (header, footer_primary, footer_secondary). */
export const getMenu = createServerFn({ method: "GET" })
  .inputValidator((v: { location: string }) => v)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: rows } = await sb
      .from("site_menus")
      .select("id,location,label_ar,label_en,url,order_index,is_external,open_in_new_tab,icon")
      .eq("location", data.location)
      .eq("is_visible", true)
      .order("order_index", { ascending: true });
    return (rows ?? []) as MenuItemDTO[];
  });

/** All visible testimonials, ordered. */
export const listTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("testimonials")
    .select(
      "id,name_ar,name_en,role_ar,role_en,text_ar,text_en,rating,source,source_url,avatar_url,is_verified,is_featured,order_index",
    )
    .eq("is_visible", true)
    .order("order_index", { ascending: true });
  return (data ?? []) as TestimonialDTO[];
});

/** SEO overrides for a given route. */
export const getPageSeo = createServerFn({ method: "GET" })
  .inputValidator((v: { routeKey: string }) => v)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row } = await sb
      .from("page_seo")
      .select("route_key,title_ar,title_en,description_ar,description_en,keywords,og_image_url,canonical_url,robots")
      .eq("route_key", data.routeKey)
      .eq("is_active", true)
      .maybeSingle();
    return (row ?? null) as PageSeoDTO | null;
  });

/** Global site settings snapshot. */
export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb.from("site_settings").select("*").eq("key", "default").maybeSingle();
  if (!data) return null;
  return {
    logo_url: (data as any).logo_url ?? null,
    logo_url_dark: (data as any).logo_url_dark ?? null,
    favicon_url: (data as any).favicon_url ?? null,
    og_default_image_url: (data as any).og_default_image_url ?? null,
    company_name: (data as any).company_name ?? null,
    contact_email: (data as any).contact_email ?? null,
    contact_phone: (data as any).contact_phone ?? null,
    whatsapp_number: (data as any).whatsapp_number ?? null,
    address: (data as any).address ?? null,
    socials: (data as any).socials ?? {},
    analytics: (data as any).analytics ?? {},
    theme: (data as any).theme ?? {},
    copy: (data as any).copy ?? {},
    default_lang: (data as any).default_lang ?? "ar",
  } as SiteSettingsDTO;
});

/** Reduce an array of sections into a keyed map for easy lookup in views. */
export function sectionsByKey(rows: SectionDTO[]): Record<string, SectionDTO> {
  const out: Record<string, SectionDTO> = {};
  for (const r of rows) out[r.section_key] = r;
  return out;
}

/** Pick a bilingual string from a section content object with a fallback. */
export function pickBi(
  content: Record<string, any> | undefined,
  key: string,
  lang: "ar" | "en",
  fallback = "",
): string {
  if (!content) return fallback;
  const v = content[`${key}_${lang}`] ?? content[key];
  if (typeof v === "string" && v.trim()) return v;
  const other = content[`${key}_${lang === "ar" ? "en" : "ar"}`];
  if (typeof other === "string" && other.trim()) return other;
  return fallback;
}
