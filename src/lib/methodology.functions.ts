import { createServerFn } from "@/lib/static-db/static-fn";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
const requireSupabaseAuth = null; // admin-only (static site)

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

export type MethodologyCopyDTO = {
  kicker_ar: string | null; kicker_en: string | null;
  title_ar: string | null; title_en: string | null;
  lede_ar: string | null; lede_en: string | null;
  is_visible: boolean;
};

export type MethodologyStepDTO = {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  sort_order: number;
  is_published: boolean;
};

export type MethodologyDataDTO = {
  copy: MethodologyCopyDTO | null;
  steps: MethodologyStepDTO[];
};

export const getMethodology = createServerFn({ method: "GET" }).handler(
  async (): Promise<MethodologyDataDTO> => {
    const supabase = publicClient();
    const [copyRes, stepsRes] = await Promise.all([
      supabase.from("home_methodology_page").select("*").eq("id", "default").maybeSingle(),
      supabase
        .from("home_methodology_steps")
        .select("*")
        .is("deleted_at", null)
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),
    ]);
    return {
      copy: (copyRes.data as MethodologyCopyDTO | null) ?? null,
      steps: (stepsRes.data ?? []) as MethodologyStepDTO[],
    };
  },
);

type AuthedCtx = { supabase: ReturnType<typeof publicClient> };

export const getMethodologyAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MethodologyDataDTO> => {
    const supabase = (context as AuthedCtx).supabase;
    const [copyRes, stepsRes] = await Promise.all([
      supabase.from("home_methodology_page").select("*").eq("id", "default").maybeSingle(),
      supabase
        .from("home_methodology_steps")
        .select("*")
        .is("deleted_at", null)
        .order("sort_order", { ascending: true }),
    ]);
    if (copyRes.error) throw new Error(copyRes.error.message);
    if (stepsRes.error) throw new Error(stepsRes.error.message);
    return {
      copy: (copyRes.data as MethodologyCopyDTO | null) ?? null,
      steps: (stepsRes.data ?? []) as MethodologyStepDTO[],
    };
  });

export type SaveMethodologyInput = {
  copy: Partial<MethodologyCopyDTO>;
  steps: Array<Partial<MethodologyStepDTO> & { id?: string }>;
  deletedIds: string[];
};

export const saveMethodology = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: SaveMethodologyInput) => d)
  .handler(async ({ data, context }) => {
    const supabase = (context as AuthedCtx).supabase;

    const copyRes = await supabase
      .from("home_methodology_page")
      .upsert({ id: "default", ...data.copy });
    if (copyRes.error) throw new Error(copyRes.error.message);

    if (data.deletedIds.length) {
      const del = await supabase
        .from("home_methodology_steps")
        .update({ deleted_at: new Date().toISOString() })
        .in("id", data.deletedIds);
      if (del.error) throw new Error(del.error.message);
    }

    for (const [i, step] of data.steps.entries()) {
      const row = {
        title_ar: step.title_ar ?? "",
        title_en: step.title_en ?? "",
        description_ar: step.description_ar ?? "",
        description_en: step.description_en ?? "",
        is_published: step.is_published ?? true,
        sort_order: i + 1,
      };
      const res = step.id
        ? await supabase.from("home_methodology_steps").update(row).eq("id", step.id)
        : await supabase.from("home_methodology_steps").insert(row);
      if (res.error) throw new Error(res.error.message);
    }

    return { ok: true };
  });
