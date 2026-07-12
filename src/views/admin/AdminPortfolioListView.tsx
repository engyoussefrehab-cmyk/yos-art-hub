import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Star } from "lucide-react";

type Row = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  client: string | null;
  category_slug: string | null;
  status: string;
  featured: boolean;
  updated_at: string;
};

export function AdminPortfolioListView() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setErr(null);
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("id,slug,name_ar,name_en,client,category_slug,status,featured,updated_at")
      .order("updated_at", { ascending: false });
    if (error) setErr(error.message);
    setRows((data ?? []) as Row[]);
  };
  useEffect(() => { load(); }, []);

  const del = async (id: string, name: string) => {
    if (!confirm(`حذف المشروع "${name}"؟`)) return;
    const { error } = await supabase.from("portfolio_projects").delete().eq("id", id);
    if (error) alert(error.message); else load();
  };

  const filtered = (rows ?? []).filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (q && !`${r.name_ar} ${r.name_en} ${r.slug} ${r.client ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">المشاريع</h1>
          <p className="mt-1 text-sm text-muted-foreground">إدارة مشاريع البرتفوليو والتصنيفات والحالة.</p>
        </div>
        <Button asChild><Link to="/admin/portfolio/new"><Plus className="ms-1 h-4 w-4" /> مشروع جديد</Link></Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="بحث…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
        >
          <option value="all">كل الحالات</option>
          <option value="draft">مسودة</option>
          <option value="published">منشور</option>
        </select>
      </div>

      {err && <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</div>}
      {rows === null ? (
        <div className="text-sm text-muted-foreground">جاري التحميل…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
          لا توجد مشاريع بعد. ابدأ بإضافة مشروع جديد.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="p-3 text-right">الاسم</th>
                <th className="p-3 text-right">العميل</th>
                <th className="p-3 text-right">التصنيف</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border/60 hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-2 font-medium">
                      {r.featured && <Star className="h-3.5 w-3.5 text-primary" />}
                      {r.name_ar || r.name_en || r.slug}
                    </div>
                    <div className="text-xs text-muted-foreground">/{r.slug}</div>
                  </td>
                  <td className="p-3 text-muted-foreground">{r.client ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{r.category_slug ?? "—"}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "published" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      {r.status === "published" ? "منشور" : "مسودة"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button asChild size="icon" variant="ghost"><Link to="/admin/portfolio/$id" params={{ id: r.id }}><Pencil className="h-4 w-4" /></Link></Button>
                      <Button size="icon" variant="ghost" onClick={() => del(r.id, r.name_ar || r.slug)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
