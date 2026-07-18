import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { gscOverviewFn, gscSubmitSitemapFn, type GscOverview } from "@/lib/gsc.functions";
import { SITE_URL } from "@/lib/site";
import { AlertTriangle, CheckCircle2, RefreshCw, Send, ExternalLink } from "lucide-react";

function fmt(ts?: string) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString("ar-EG", { hour12: false });
  } catch {
    return ts;
  }
}

function Badge({ ok, label }: { ok?: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] ${
        ok ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-700"
      }`}
    >
      {label}
    </span>
  );
}

function IndexingPage() {
  const [data, setData] = useState<GscOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await gscOverviewFn();
      setData(res);
    } catch (e: any) {
      setErr(e?.message ?? "تعذّر جلب بيانات الفهرسة.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const submit = async (feedpath: string) => {
    if (!data?.selectedSiteUrl) return;
    setSubmitting(feedpath);
    setSubmitMsg(null);
    try {
      await gscSubmitSitemapFn({ data: { siteUrl: data.selectedSiteUrl, feedpath } });
      setSubmitMsg(`تم إرسال ${feedpath} إلى Google بنجاح.`);
      await load();
    } catch (e: any) {
      setSubmitMsg(e?.message ?? "فشل إرسال خريطة الموقع.");
    } finally {
      setSubmitting(null);
    }
  };

  const sitemapUrl = `${SITE_URL}/sitemap.xml`;

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">حالة الفهرسة في Google</h1>
          <p className="text-sm text-muted-foreground">
            بيانات مباشرة من Google Search Console: خرائط الموقع، الأخطاء، وحالة آخر إرسال.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs hover:border-accent hover:text-accent disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> تحديث
          </button>
          <Link
            to="/admin"
            className="rounded-full border border-border px-4 py-1.5 text-xs hover:border-accent hover:text-accent"
          >
            رجوع
          </Link>
        </div>
      </div>

      {err && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-500">{err}</p>
      )}

      {data?.error && (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700">{data.error}</p>
      )}

      {data && !data.connected && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            لم يتم ربط Google Search Console بعد. اطلب من مطوّر الموقع تفعيل الاتصال.
          </p>
        </div>
      )}

      {data?.connected && (
        <>
          {/* Property selector info */}
          <div className="rounded-2xl border border-border/70 bg-card p-4">
            <div className="text-xs text-muted-foreground">الملكية النشطة</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm">{data.selectedSiteUrl ?? "لا توجد ملكية موثّقة."}</span>
              {data.sites.length > 1 && (
                <span className="text-[11px] text-muted-foreground">
                  ({data.sites.length} ملكيات متاحة)
                </span>
              )}
            </div>
          </div>

          {/* Homepage inspection */}
          {data.homepage && (
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">فحص الصفحة الرئيسية</h2>
                <a
                  href={data.homepage.inspectedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent"
                >
                  {data.homepage.inspectedUrl} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Row label="الحالة العامة" value={data.homepage.verdict} highlight />
                <Row label="حالة الفهرسة" value={data.homepage.coverageState} />
                <Row label="آخر زحف" value={fmt(data.homepage.lastCrawlTime)} />
                <Row label="robots.txt" value={data.homepage.robotsTxtState} />
                <Row label="حالة الجلب" value={data.homepage.pageFetchState} />
                <Row label="قابلية الفهرسة" value={data.homepage.indexingState} />
                <Row label="Canonical (Google)" value={data.homepage.googleCanonical} mono />
                <Row label="Canonical (لديك)" value={data.homepage.userCanonical} mono />
                <Row label="جودة الجوال" value={data.homepage.mobileVerdict} />
                <Row label="النتائج الغنية" value={data.homepage.richResultsVerdict} />
              </dl>
            </div>
          )}

          {/* Sitemaps */}
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold">خرائط الموقع (Sitemaps)</h2>
                <p className="text-xs text-muted-foreground">حالة كل خريطة مُرسَلة، آخر تنزيل، والأخطاء إن وجدت.</p>
              </div>
              <button
                onClick={() => submit("sitemap.xml")}
                disabled={!data.selectedSiteUrl || submitting !== null}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs text-accent-foreground hover:opacity-90 disabled:opacity-60"
              >
                <Send className="h-3.5 w-3.5" />
                {submitting === "sitemap.xml" ? "جارٍ الإرسال…" : "إرسال sitemap.xml"}
              </button>
            </div>

            {submitMsg && (
              <p className="mb-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">{submitMsg}</p>
            )}

            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="min-w-full text-right text-sm">
                <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">الخريطة</th>
                    <th className="px-3 py-2">آخر إرسال</th>
                    <th className="px-3 py-2">آخر تنزيل</th>
                    <th className="px-3 py-2">النوع</th>
                    <th className="px-3 py-2">تحذيرات</th>
                    <th className="px-3 py-2">أخطاء</th>
                    <th className="px-3 py-2">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sitemaps.map((s) => {
                    const hasErrors = Number(s.errors ?? 0) > 0;
                    const hasWarnings = Number(s.warnings ?? 0) > 0;
                    return (
                      <tr key={s.path} className="border-t border-border/60 align-top">
                        <td className="px-3 py-2">
                          <a
                            href={s.path}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-xs hover:text-accent"
                          >
                            {s.path.replace(SITE_URL, "") || s.path}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{fmt(s.lastSubmitted)}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{fmt(s.lastDownloaded)}</td>
                        <td className="px-3 py-2 text-xs">{s.type ?? "—"}</td>
                        <td className="px-3 py-2 text-xs">{s.warnings ?? 0}</td>
                        <td className="px-3 py-2 text-xs">{s.errors ?? 0}</td>
                        <td className="px-3 py-2">
                          {hasErrors ? (
                            <span className="inline-flex items-center gap-1 text-xs text-red-500">
                              <AlertTriangle className="h-3.5 w-3.5" /> أخطاء
                            </span>
                          ) : hasWarnings ? (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                              <AlertTriangle className="h-3.5 w-3.5" /> تحذيرات
                            </span>
                          ) : s.isPending ? (
                            <Badge label="قيد المعالجة" />
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" /> سليم
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {data.sitemaps.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-xs text-muted-foreground">
                        لا توجد خرائط موقع مُرسَلة بعد. استخدم زر "إرسال sitemap.xml" أعلاه لإرسال{" "}
                        <span className="font-mono">{sitemapUrl}</span> إلى Google.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  highlight?: boolean;
}) {
  const v = value && value.length ? value : "—";
  const ok = highlight && (v === "PASS" || v === "SUCCESS" || v === "VERDICT_UNSPECIFIED" ? false : v === "PASS");
  return (
    <div className="flex flex-col rounded-lg border border-border/50 bg-background/40 px-3 py-2">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={`mt-0.5 truncate text-sm ${mono ? "font-mono text-xs" : ""} ${highlight && v === "PASS" ? "text-emerald-600" : ""}`}>
        {v}
      </span>
      {highlight && v !== "—" && v !== "PASS" && (
        <span className="mt-1 text-[10px] text-amber-600">راجع تفاصيل الفحص أدناه.</span>
      )}
      {ok /* placeholder to keep prop referenced */ && null}
    </div>
  );
}

export const Route = createFileRoute("/admin/indexing")({
  head: () => ({
    meta: [
      { title: "حالة الفهرسة | لوحة التحكم" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: IndexingPage,
});
