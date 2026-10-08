import { createServerFn } from "@/lib/static-db/static-fn";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    "static",
    "static",
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export type ServiceDTO = {
  slug: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  features: string[];
  icon: string | null;
  cover_url: string | null;
  cta_label_ar: string | null;
  cta_label_en: string | null;
  cta_href: string | null;
  featured: boolean;
  sort_order: number;
};

function mapRow(r: any): ServiceDTO {
  const features = Array.isArray(r.features)
    ? r.features.map((f: any) => (typeof f === "string" ? f : f?.text ?? "")).filter(Boolean)
    : [];
  return {
    slug: r.slug,
    title_ar: r.title_ar,
    title_en: r.title_en || r.title_ar,
    description_ar: r.description_ar ?? "",
    description_en: r.description_en ?? r.description_ar ?? "",
    features,
    icon: r.icon,
    cover_url: r.og_image_url ?? null,
    cta_label_ar: r.cta_label_ar,
    cta_label_en: r.cta_label_en,
    cta_href: r.cta_href,
    featured: r.featured,
    sort_order: r.sort_order ?? 0,
  };
}


export const listServices = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data: rows, error } = await supabase
    .from("services")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (rows ?? []).map(mapRow);
});
