import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Star, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [toDelete, setToDelete] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = async () => {
    setErr(null);
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("id,slug,name_ar,name_en,client,category_slug,status,featured,updated_at")
      .order("updated_at", { ascending: false });
    if (error) setErr(error.message);
    setRows((data ?? []) as Row[]);
    setSelected(new Set());
  };
  useEffect(() => { load(); }, []);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const { error } = await supabase.from("portfolio_projects").delete().eq("id", toDelete.id);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تم حذف المشروع");
    setToDelete(null);
    load();
  };

  const duplicate = async (r: Row) => {
    const { data: full, error: fErr } = await supabase
      .from("portfolio_projects").select("*").eq("id", r.id).maybeSingle();
    if (fErr || !full) { toast.error(fErr?.message ?? "تعذر جلب المشروع"); return; }
    const suffix = Math.random().toString(36).slice(2, 6);
    const { id, created_at, updated_at, published_at, ...rest } = full as any;
    const copy = {
      ...rest,
      slug: `${r.slug}-copy-${suffix}`.slice(0, 80),
      name_ar: `${full.name_ar ?? ""} (نسخة)`,
      name_en: full.name_en ? `${full.name_en} (Copy)` : full.name_en,
      status: "draft",
      featured: false,
      is_pinned: false,
      published_at: null,
    };
    const { data: ins, error: iErr } = await supabase
      .from("portfolio_projects").insert(copy).select("id").maybeSingle();
    if (iErr) { toast.error(iErr.message); return; }
    // duplicate tag links
    const { data: pt } = await supabase.from("project_tags").select("tag_id").eq("project_id", r.id);
    if (pt && pt.length > 0 && ins?.id) {
      await supabase.from("project_tags").insert(pt.map((t: any) => ({ project_id: ins.id, tag_id: t.tag_id })));
    }
    toast.success("تم نسخ المشروع كمسودة");
    load();
  };

  const filtered = (rows ?? []).filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (q && !`${r.name_ar} ${r.name_en} ${r.slug} ${r.client ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const toggleOne = (id: string) => {
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.id)));
  };

  const bulkSetStatus = async (status: "draft" | "published") => {
    if (selected.size === 0) return;
    setBulkBusy(true);
    const ids = Array.from(selected);
    const patch: any = { status };
    if (status === "published") patch.published_at = new Date().toISOString();
    const { error } = await supabase.from("portfolio_projects").update(patch).in("id", ids);
    setBulkBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "published" ? `تم نشر ${ids.length} مشروع` : `تم إرجاع ${ids.length} مشروع كمسودة`);
    load();
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    setBulkBusy(true);
    const ids = Array.from(selected);
    const { error } = await supabase.from("portfolio_projects").delete().in("id", ids);
    setBulkBusy(false);
    setBulkDeleteOpen(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`تم حذف ${ids.length} مشروع`);
    load();
  };

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

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          <span className="font-medium">{selected.size} محدد</span>
          <div className="ms-auto flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => bulkSetStatus("published")}>
              <Eye className="ms-1 h-4 w-4" /> نشر
            </Button>
            <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => bulkSetStatus("draft")}>
              <EyeOff className="ms-1 h-4 w-4" /> إرجاع كمسودة
            </Button>
            <Button size="sm" variant="destructive" disabled={bulkBusy} onClick={() => setBulkDeleteOpen(true)}>
              <Trash2 className="ms-1 h-4 w-4" /> حذف
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>إلغاء التحديد</Button>
          </div>
        </div>
      )}

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
                <th className="p-3 w-10">
                  <Checkbox
                    checked={selected.size > 0 && selected.size === filtered.length}
                    onCheckedChange={toggleAll}
                    aria-label="تحديد الكل"
                  />
                </th>
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
                    <Checkbox
                      checked={selected.has(r.id)}
                      onCheckedChange={() => toggleOne(r.id)}
                      aria-label={`تحديد ${r.name_ar || r.slug}`}
                    />
                  </td>
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
                      <Button size="icon" variant="ghost" title="نسخ" onClick={() => duplicate(r)}><Copy className="h-4 w-4" /></Button>
                      <Button asChild size="icon" variant="ghost" title="تعديل"><Link to="/admin/portfolio/$id" params={{ id: r.id }}><Pencil className="h-4 w-4" /></Link></Button>
                      <Button size="icon" variant="ghost" title="حذف" onClick={() => setToDelete(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && !deleting && setToDelete(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف المشروع</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المشروع "{toDelete?.name_ar || toDelete?.name_en || toDelete?.slug}" بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmDelete(); }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "جاري الحذف…" : "حذف نهائي"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={(open) => !open && !bulkBusy && setBulkDeleteOpen(false)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف {selected.size} مشروع</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف {selected.size} مشروع بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkBusy}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); bulkDelete(); }}
              disabled={bulkBusy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkBusy ? "جاري الحذف…" : "حذف نهائي"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
