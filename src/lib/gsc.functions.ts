import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { SITE_URL } from "@/lib/site";

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role" as never, {
    _user_id: userId,
    _role: "admin",
  } as never);
  if (data) return;
  const { data: rows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .limit(1);
  if (!rows || rows.length === 0) throw new Error("Forbidden");
}

function gscHeaders() {
  const lovable = process.env.LOVABLE_API_KEY;
  const gsc = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;
  if (!lovable || !gsc) throw new Error("لم يتم ربط Google Search Console بعد.");
  return {
    Authorization: `Bearer ${lovable}`,
    "X-Connection-Api-Key": gsc,
    "Content-Type": "application/json",
  };
}

async function gscFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: { ...gscHeaders(), ...(init?.headers as Record<string, string> | undefined) },
  });
  const text = await res.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    const msg = typeof body === "object" && body?.error?.message ? body.error.message : text || res.statusText;
    throw new Error(`GSC ${res.status}: ${msg}`);
  }
  return body;
}

export type GscOverview = {
  connected: boolean;
  sites: Array<{ siteUrl: string; permissionLevel?: string }>;
  selectedSiteUrl: string | null;
  sitemaps: Array<{
    path: string;
    lastSubmitted?: string;
    lastDownloaded?: string;
    isPending?: boolean;
    isSitemapsIndex?: boolean;
    type?: string;
    warnings?: string;
    errors?: string;
    contents?: Array<{ type?: string; submitted?: string; indexed?: string }>;
  }>;
  homepage: {
    inspectedUrl: string;
    verdict?: string;
    coverageState?: string;
    lastCrawlTime?: string;
    robotsTxtState?: string;
    indexingState?: string;
    pageFetchState?: string;
    googleCanonical?: string;
    userCanonical?: string;
    mobileVerdict?: string;
    richResultsVerdict?: string;
  } | null;
  error?: string;
};

function preferredSite(sites: Array<{ siteUrl: string }>): string | null {
  if (!sites.length) return null;
  const wanted = ["https://yrstudio.art/", "https://www.yrstudio.art/", "sc-domain:yrstudio.art"];
  for (const w of wanted) {
    const hit = sites.find((s) => s.siteUrl === w);
    if (hit) return hit.siteUrl;
  }
  return sites[0].siteUrl;
}

export const gscOverviewFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<GscOverview> => {
    await assertAdmin(context.supabase, context.userId);

    let sites: GscOverview["sites"] = [];
    try {
      const list = await gscFetch("/webmasters/v3/sites");
      sites = (list?.siteEntry ?? []).map((s: any) => ({
        siteUrl: s.siteUrl,
        permissionLevel: s.permissionLevel,
      }));
    } catch (e: any) {
      return {
        connected: false,
        sites: [],
        selectedSiteUrl: null,
        sitemaps: [],
        homepage: null,
        error: e?.message ?? "تعذّر الاتصال بـ Google Search Console.",
      };
    }

    const selected = preferredSite(sites);
    if (!selected) {
      return { connected: true, sites, selectedSiteUrl: null, sitemaps: [], homepage: null };
    }

    const enc = encodeURIComponent(selected);
    const [sitemapsRes, inspectRes] = await Promise.allSettled([
      gscFetch(`/webmasters/v3/sites/${enc}/sitemaps`),
      gscFetch(`/v1/urlInspection/index:inspect`, {
        method: "POST",
        body: JSON.stringify({
          inspectionUrl: SITE_URL.endsWith("/") ? SITE_URL : `${SITE_URL}/`,
          siteUrl: selected,
        }),
      }),
    ]);

    const sitemaps =
      sitemapsRes.status === "fulfilled"
        ? (sitemapsRes.value?.sitemap ?? []).map((s: any) => ({
            path: s.path,
            lastSubmitted: s.lastSubmitted,
            lastDownloaded: s.lastDownloaded,
            isPending: s.isPending,
            isSitemapsIndex: s.isSitemapsIndex,
            type: s.type,
            warnings: s.warnings,
            errors: s.errors,
            contents: s.contents,
          }))
        : [];

    let homepage: GscOverview["homepage"] = null;
    if (inspectRes.status === "fulfilled") {
      const r = inspectRes.value?.inspectionResult ?? {};
      const idx = r.indexStatusResult ?? {};
      homepage = {
        inspectedUrl: SITE_URL,
        verdict: idx.verdict,
        coverageState: idx.coverageState,
        lastCrawlTime: idx.lastCrawlTime,
        robotsTxtState: idx.robotsTxtState,
        indexingState: idx.indexingState,
        pageFetchState: idx.pageFetchState,
        googleCanonical: idx.googleCanonical,
        userCanonical: idx.userCanonical,
        mobileVerdict: r.mobileUsabilityResult?.verdict,
        richResultsVerdict: r.richResultsResult?.verdict,
      };
    }

    return {
      connected: true,
      sites,
      selectedSiteUrl: selected,
      sitemaps,
      homepage,
      error:
        sitemapsRes.status === "rejected"
          ? (sitemapsRes.reason?.message ?? "تعذّر جلب خرائط الموقع.")
          : inspectRes.status === "rejected"
            ? (inspectRes.reason?.message ?? "تعذّر فحص الصفحة الرئيسية.")
            : undefined,
    };
  });

export const gscSubmitSitemapFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => {
    const v = d as { siteUrl?: string; feedpath?: string };
    if (!v?.siteUrl || !v?.feedpath) throw new Error("siteUrl و feedpath مطلوبان.");
    return { siteUrl: v.siteUrl, feedpath: v.feedpath };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const enc = encodeURIComponent(data.siteUrl);
    const feed = encodeURIComponent(data.feedpath);
    await gscFetch(`/webmasters/v3/sites/${enc}/sitemaps/${feed}`, { method: "PUT" });
    return { ok: true, submittedAt: new Date().toISOString() };
  });
