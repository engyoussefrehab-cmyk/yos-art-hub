import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";

type SeoRow = {
  kind: "page" | "article" | "project" | "service";
  id: string;
  slug: string;
  title: string;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  status: string;
  editHref: string;
  publicHref: string;
};

function issues(r: SeoRow) {
  const problems: string[] = [];
  if (!r.seo_title || r.seo_title.length < 20) problems.push("عنوان SEO قصير أو مفقود");
  else if (r.seo_title.length > 65) problems.push("عنوان SEO طويل جداً");
  if (!r.seo_description || r.seo_description.length < 50) problems.push("وصف Meta قصير أو مفقود");
  else if (r.seo_description.length > 170) problems.push("وصف Meta طويل جداً");
  if (!r.og_image) problems.push("صورة OG مفقودة");
  return problems;
}

function SeoManager() {
  const [rows, setRows] = useState<SeoRow[] | null>(null);
  const [filter, setFilter] = useState<"all" | "issues" | "ok">("all");
  const [kind, setKind] = useState<"all" | SeoRow["kind"]>("all");

  useEffect(() => {
    (async () => {
      const [pages, arts, projs, servs] = await Promise.all([
        supabase.from("pages").select("id,slug,title_ar,seo_title_ar,seo_description_ar,og_image_url,status"),
        supabase
          .from("insight_articles")
          .select("id,slug,title_ar,seo_title_ar,seo_description_ar,cover_image_url,status,category:insight_categories(slug)"),
        supabase
          .from("portfolio_projects")
          .select("id,slug,title_ar,seo_title_ar,seo_description_ar,cover_image_url,status,category"),
        supabase.from("services").select("id,slug,title_ar,seo_title_ar,seo_description_ar,cover_image_url,status"),
      ]);
      const out: SeoRow[] = [];
      (pages.data ?? []).forEach((r: any) =>
        out.push({
          kind: "page",
          id: r.id,
          slug: r.slug,
          title: r.title_ar,
          seo_title: r.seo_title_ar,
          seo_description: r.seo_description_ar,
          og_image: r.og_image_url,
          status: r.status,
          editHref: `/admin/pages?edit=${r.id}`,
          publicHref: r.slug === "home" ? "/" : `/${r.slug}`,
        }),
      );
      (arts.data ?? []).forEach((r: any) =>
        out.push({
          kind: "article",
          id: r.id,
          slug: r.slug,
          title: r.title_ar,
          seo_title: r.seo_title_ar,
          seo_description: r.seo_description_ar,
          og_image: r.cover_image_url,
          status: r.status,
          editHref: `/admin/insights/${r.id}`,
          publicHref: `/insights/${r.category?.slug ?? "all"}/${r.slug}`,
        }),
      );
      (projs.data ?? []).forEach((r: any) =>
        out.push({
          kind: "project",
          id: r.id,
          slug: r.slug,
          title: r.title_ar,
          seo_title: r.seo_title_ar,
          seo_description: r.seo_description_ar,
          og_image: r.cover_image_url,
          status: r.status,
          editHref: `/admin/portfolio/${r.id}`,
          publicHref: `/projects/${r.category}/${r.slug}`,
        }),
      );
      (servs.data ?? []).forEach((r: any) =>
        out.push({
          kind: "service",
          id: r.id,
          slug: r.slug,
          title: r.title_ar,
          seo_title: r.seo_title_ar,
          seo_description: r.seo_description_ar,
          og_image: r.cover_image_url,
          status: r.status,
          editHref: `/admin/services/${r.id}`,
          publicHref: `/services/${r.slug}`,
        }),
      );
      setRows(out);
    })();
  }, []);

  const kindLabel: Record<SeoRow["kind"], string> = {
    page: "صفحة",
    article: "مقال",
    project: "مشروع",
    service: "خدمة",
  };

  const filtered = (rows ?? []).filter((r) => {
    if (kind !== "all" && r.kind !== kind) return false;
    const has = issues(r).length > 0;
    if (filter === "issues" && !has) return false;
    if (filter === "ok" && has) return false;
    return true;
  });

  const total = rows?.length ?? 0;
  const withIssues = (rows ?? []).filter((r) => issues(r).length > 0).length;

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">مدير SEO</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          نظرة موحّدة على SEO لكل الصفحات، المقالات، المشاريع، والخدمات.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <div className="text-2xl font-semibold">{total}</div>
          <div className="text-xs text-muted-foreground">إجمالي المحتوى</div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center gap-2 text-2xl font-semibold text-emerald-600">
            <CheckCircle2 className="h-5 w-5" /> {total - withIssues}
          </div>
          <div className="text-xs text-muted-foreground">مكتمل SEO</div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center gap-2 text-2xl font-semibold text-amber-600">
            <AlertTriangle className="h-5 w-5" /> {withIssues}
          </div>
          <div className="text-xs text-muted-foreground">بحاجة إلى مراجعة</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as any)}
          className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
        >
          <option value="all">كل الأنواع</option>
          <option value="page">صفحات</option>
          <option value="article">مقالات</option>
          <option value="project">مشاريع</option>
          <option value="service">خدمات</option>
        </select>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
        >
          <option value="all">الكل</option>
          <option value="issues">به مشاكل</option>
          <option value="ok">مكتمل</option>
        </select>
      </div>

      {rows === null ? (
        <div className="text-sm text-muted-foreground">جاري التحميل…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
          لا توجد نتائج.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const probs = issues(r);
            const ok = probs.length === 0;
            return (
              <div
                key={`${r.kind}-${r.id}`}
                className="flex items-start justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        ok ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-700"
                      }`}
                    >
                      {kindLabel[r.kind]}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      {r.status === "published" ? "منشور" : "مسودة"}
                    </span>
                    <span className="truncate font-medium">{r.title || r.slug}</span>
                  </div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">/{r.slug}</div>
                  {!ok && (
                    <ul className="mt-2 space-y-0.5 text-xs text-amber-700">
                      {probs.map((p) => (
                        <li key={p}>• {p}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={r.publicHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> معاينة
                  </a>
                  <Link
                    to={r.editHref as any}
                    className="rounded-md border border-border/70 px-3 py-1.5 text-xs hover:border-primary hover:text-primary"
                  >
                    تحرير
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/admin/seo")({
  component: SeoManager,
});
