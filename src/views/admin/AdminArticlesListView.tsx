import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { InsightArticleRow, InsightCategoryRow, ArticleStatus } from "@/lib/insights-types";

interface Row extends InsightArticleRow {
  category: InsightCategoryRow;
}

export function AdminArticlesListView() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [categories, setCategories] = useState<InsightCategoryRow[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ArticleStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setErr(null);
    const [{ data: arts, error }, { data: cats }] = await Promise.all([
      supabase.from("insight_articles")
        .select("*, category:insight_categories!inner(id,slug,label_ar,label_en,description_ar,description_en,sort_order)")
        .order("updated_at", { ascending: false }),
      supabase.from("insight_categories").select("*").order("sort_order"),
    ]);
    if (error) setErr(error.message);
    setRows((arts ?? []) as unknown as Row[]);
    setCategories((cats ?? []) as InsightCategoryRow[]);
  };

  useEffect(() => { load(); }, []);

  const del = async (id: string, title: string) => {
    if (!confirm(`حذف المقال "${title}"؟`)) return;
    const { error } = await supabase.from("insight_articles").delete().eq("id", id);
    if (error) alert(error.message);
    else load();
  };

  const filtered = (rows ?? []).filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (categoryFilter !== "all" && r.category.slug !== categoryFilter) return false;
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      if (![r.title_ar, r.title_en, r.slug].join(" ").toLowerCase().includes(s)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">المقالات</h1>
          <p className="mt-1 text-sm text-muted-foreground">إدارة كل مقالات الرؤى.</p>
        </div>
        <Link
          to="/admin/insights/new"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          + مقال جديد
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 rounded-2xl border border-border/70 bg-card p-4">
        <input
          type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="بحث بالاسم أو الرابط…"
          className="min-w-[220px] flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none"
        />
        <select
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
          className="rounded-full border border-border bg-background px-4 py-2 text-sm"
        >
          <option value="all">كل الحالات</option>
          <option value="draft">مسودّة</option>
          <option value="scheduled">مجدولة</option>
          <option value="published">منشورة</option>
        </select>
        <select
          value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-full border border-border bg-background px-4 py-2 text-sm"
        >
          <option value="all">كل التصنيفات</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label_ar}</option>)}
        </select>
      </div>

      {err && <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{err}</p>}

      <div className="mt-6 overflow-hidden rounded-2xl border border-border/70">
        <table className="w-full text-sm">
          <thead className="bg-card text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start">العنوان</th>
              <th className="px-4 py-3 text-start">التصنيف</th>
              <th className="px-4 py-3 text-start">الحالة</th>
              <th className="px-4 py-3 text-start">تاريخ النشر</th>
              <th className="px-4 py-3 text-start">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-background">
            {rows === null ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">جاري التحميل…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">لا توجد مقالات.</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className="hover:bg-card/50">
                <td className="px-4 py-3">
                  <button
                    onClick={() => navigate({ to: "/admin/insights/$id", params: { id: r.id } })}
                    className="text-start font-medium text-foreground hover:text-accent"
                  >
                    {r.title_ar || r.title_en || r.slug}
                  </button>
                  {r.featured && <span className="ms-2 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">مميّز</span>}
                  <div className="mt-0.5 text-xs text-muted-foreground">/{r.slug}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.category.label_ar}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {r.published_at ? new Date(r.published_at).toLocaleDateString("ar-EG") : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      to="/admin/insights/$id" params={{ id: r.id }}
                      className="text-xs text-muted-foreground hover:text-accent"
                    >تعديل</Link>
                    <button onClick={() => del(r.id, r.title_ar || r.slug)} className="text-xs text-red-500 hover:underline">
                      حذف
                    </button>
                    {r.status === "published" && r.published_at && new Date(r.published_at) <= new Date() && (
                      <a
                        href={`/insights/${r.category.slug}/${r.slug}`} target="_blank" rel="noreferrer"
                        className="text-xs text-muted-foreground hover:text-accent"
                      >عرض</a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ArticleStatus }) {
  const cfg = {
    draft:     { label: "مسودّة",  cls: "bg-muted text-muted-foreground" },
    scheduled: { label: "مجدولة",  cls: "bg-amber-500/15 text-amber-600" },
    published: { label: "منشورة",  cls: "bg-emerald-500/15 text-emerald-600" },
  }[status];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
