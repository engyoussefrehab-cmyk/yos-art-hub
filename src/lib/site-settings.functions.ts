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

export type SiteSettingsDTO = {
  logo_url: string | null;
  favicon_url: string | null;
  company_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  socials: Record<string, string>;
};

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("logo_url, favicon_url, company_name, contact_email, contact_phone, address, socials")
    .eq("key", "default")
    .maybeSingle();
  if (error) throw new Error(error.message);
  const socials = (data?.socials ?? {}) as Record<string, string>;
  return {
    logo_url: data?.logo_url ?? null,
    favicon_url: data?.favicon_url ?? null,
    company_name: data?.company_name ?? null,
    contact_email: data?.contact_email ?? null,
    contact_phone: data?.contact_phone ?? null,
    address: data?.address ?? null,
    socials,
  } satisfies SiteSettingsDTO;
});
