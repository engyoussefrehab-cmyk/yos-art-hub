import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export type TierDeliverable = { ar: string; en: string };

export type ServiceTierDTO = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  deliverables: TierDeliverable[];
  price_ar: string | null;
  price_en: string | null;
  cta_label_ar: string | null;
  cta_label_en: string | null;
  cta_href: string | null;
  featured: boolean;
  badge_ar: string | null;
  badge_en: string | null;
  sort_order: number;
};

export type ServiceTierFeatureDTO = {
  id: string;
  label_ar: string;
  label_en: string;
  launch: "none" | "core" | "extended" | "full";
  signature: "none" | "core" | "extended" | "full";
  system: "none" | "core" | "extended" | "full";
  sort_order: number;
};

export type ServiceTierPageDTO = {
  eyebrow_ar: string | null; eyebrow_en: string | null;
  title_ar: string | null; title_en: string | null;
  subtitle_ar: string | null; subtitle_en: string | null;
  footnote_ar: string | null; footnote_en: string | null;
  cta_eyebrow_ar: string | null; cta_eyebrow_en: string | null;
  cta_title_ar: string | null; cta_title_en: string | null;
  cta_subtitle_ar: string | null; cta_subtitle_en: string | null;
  cta_button_ar: string | null; cta_button_en: string | null;
  cta_href: string | null;
  compare_eyebrow_ar: string | null; compare_eyebrow_en: string | null;
  compare_title_ar: string | null; compare_title_en: string | null;
};

export type ServiceTiersPageDataDTO = {
  page: ServiceTierPageDTO | null;
  tiers: ServiceTierDTO[];
  features: ServiceTierFeatureDTO[];
};

export const getServiceTiersPageData = createServerFn({ method: "GET" }).handler(
  async (): Promise<ServiceTiersPageDataDTO> => {
    const supabase = publicClient();
    const [pageRes, tiersRes, featRes] = await Promise.all([
      supabase.from("service_tier_page").select("*").eq("id", "default").maybeSingle(),
      supabase
        .from("service_tiers")
        .select("*")
        .is("deleted_at", null)
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("service_tier_features")
        .select("*")
        .is("deleted_at", null)
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),
    ]);
    if (pageRes.error) throw new Error(pageRes.error.message);
    if (tiersRes.error) throw new Error(tiersRes.error.message);
    if (featRes.error) throw new Error(featRes.error.message);
    return {
      page: (pageRes.data as ServiceTierPageDTO | null) ?? null,
      tiers: (tiersRes.data ?? []).map((r) => {
        const row = r as Record<string, unknown>;
        const raw = row.deliverables;
        const deliverables = Array.isArray(raw) ? (raw as TierDeliverable[]) : [];
        return { ...row, deliverables } as unknown as ServiceTierDTO;
      }),
      features: (featRes.data ?? []) as ServiceTierFeatureDTO[],
    };
  },
);

export const getServiceTierPageCopy = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = (context as { supabase: ReturnType<typeof publicClient> }).supabase;
    const { data, error } = await supabase
      .from("service_tier_page")
      .select("*")
      .eq("id", "default")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as ServiceTierPageDTO | null;
  });

export const saveServiceTierPageCopy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Partial<ServiceTierPageDTO>) => d)
  .handler(async ({ data, context }) => {
    const supabase = (context as { supabase: ReturnType<typeof publicClient> }).supabase;
    const { error } = await supabase
      .from("service_tier_page")
      .upsert({ id: "default", ...data });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
