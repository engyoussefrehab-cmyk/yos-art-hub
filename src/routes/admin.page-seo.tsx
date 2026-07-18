import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminLang } from "@/i18n/admin-lang";

type Row = {
  id: string;
  route_key: string;
  title_ar: string | null; title_en: string | null;
  description_ar: string | null; description_en: string | null;
  keywords: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  robots: string;
  is_active: boolean;
};

const ROUTE_SUGGESTIONS = ["/", "/projects", "/projects/$slug", "/insights", "/packages", "/contact", "/about"];

function PageSeoPage() {
  const { lang, dir } = useAdminLang();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [dirty, setDirty] = useState<Record<string, boolean>>({});

  const load = async () => {
    const { data, error } = await supabase.from("page_seo").select("*").order("route_key");
    if (error) { toast.error(error.message); return; }
    setRows((data ?? []) as Row[]);
    setDirty({});
  };
  useEffect(() => { load(); }, []);

  const patch = (id: string, p: Partial<Row>) => {
    setRows((rs) => (rs ?? []).map((r) => (r.id === id ? { ...r, ...p } : r)));
    setDirty((d) => ({ ...d, [id]: true }));
  };
  const saveOne = async (r: Row) => {
    const { id, ...rest } = r;
    const { error } = await supabase.from("page_seo").update(rest as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(lang === "ar" ? "تم الحفظ" : "Saved");
    setDirty((d) => { const n = { ...d }; delete n[id]; return n; });
  };
  const add = async () => {
    const key = prompt(lang === "ar" ? "مفتاح المسار (مثل /projects):" : "Route key (e.g. /projects):");
    if (!key) return;
    const { data, error } = await supabase.from("page_seo").insert({ route_key: key.trim(), robots: "index,follow", is_active: true }).select("*").maybeSingle();
    if (error) { toast.error(error.message); return; }
    if (data) setRows((rs) => [...(rs ?? []), data as Row]);
  };
  const remove = async (id: string) => {
    if (!confirm(lang === "ar" ? "حذف؟" : "Delete?")) return;
    await supabase.from("page_seo").delete().eq("id", id);
    load();
  };

  return (
    <div dir={dir} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{lang === "ar" ? "SEO لكل صفحة" : "Per-page SEO"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "ar" ? "تحكم في العنوان والوصف والصورة الاجتماعية لكل مسار." : "Control title, description, and social image per route."}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {lang === "ar" ? "مسارات مقترحة: " : "Suggested routes: "}
            {ROUTE_SUGGESTIONS.map((r) => <code key={r} className="me-1 rounded bg-muted px-1.5">{r}</code>)}
          </p>
        </div>
        <Button size="sm" onClick={add}><Plus className="me-1 h-4 w-4" /> {lang === "ar" ? "إضافة مسار" : "Add route"}</Button>
      </div>

      {rows === null ? (
        <div className="text-sm text-muted-foreground">{lang === "ar" ? "جاري التحميل…" : "Loading…"}</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
          {lang === "ar" ? "لا يوجد إعدادات مخصصة بعد." : "No custom SEO yet."}
        </div>
      ) : (
        <ol className="grid gap-4">
          {rows.map((r) => (
            <li key={r.id} className="rounded-xl border border-border/70 bg-background p-4">
              <div className="mb-3 flex items-center gap-2">
                <code className="rounded bg-muted px-2 py-1 text-xs">{r.route_key}</code>
                <label className="ms-auto flex items-center gap-2 text-xs">
                  <Switch checked={r.is_active} onCheckedChange={(v) => patch(r.id, { is_active: v })} />
                  {lang === "ar" ? "نشط" : "Active"}
                </label>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <F label={lang === "ar" ? "العنوان (عربي)" : "Title (Arabic)"} value={r.title_ar ?? ""} dir="rtl" onChange={(v) => patch(r.id, { title_ar: v })} />
                <F label="Title (English)" value={r.title_en ?? ""} dir="ltr" onChange={(v) => patch(r.id, { title_en: v })} />
                <div className="grid gap-1.5">
                  <Label className="text-xs">{lang === "ar" ? "الوصف (عربي)" : "Description (Arabic)"}</Label>
                  <Textarea rows={2} value={r.description_ar ?? ""} onChange={(e) => patch(r.id, { description_ar: e.target.value })} dir="rtl" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Description (English)</Label>
                  <Textarea rows={2} value={r.description_en ?? ""} onChange={(e) => patch(r.id, { description_en: e.target.value })} dir="ltr" />
                </div>
                <F label={lang === "ar" ? "كلمات مفتاحية" : "Keywords"} value={r.keywords ?? ""} dir="ltr" onChange={(v) => patch(r.id, { keywords: v })} />
                <F label="Robots" value={r.robots} dir="ltr" onChange={(v) => patch(r.id, { robots: v })} placeholder="index,follow" />
                <F label={lang === "ar" ? "صورة المشاركة (URL)" : "OG image URL"} value={r.og_image_url ?? ""} dir="ltr" onChange={(v) => patch(r.id, { og_image_url: v })} />
                <F label="Canonical URL" value={r.canonical_url ?? ""} dir="ltr" onChange={(v) => patch(r.id, { canonical_url: v })} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button type="button" onClick={() => remove(r.id)} className="rounded-md border border-border/60 p-1.5 text-destructive"><Trash2 className="h-4 w-4" /></button>
                <div className="ms-auto">
                  <Button size="sm" onClick={() => saveOne(r)} disabled={!dirty[r.id]}><Save className="me-1 h-4 w-4" /> {lang === "ar" ? "حفظ" : "Save"}</Button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function F({ label, value, onChange, dir, placeholder }: { label: string; value: string; onChange: (v: string) => void; dir?: "rtl" | "ltr"; placeholder?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} dir={dir} placeholder={placeholder} />
    </div>
  );
}

export const Route = createFileRoute("/admin/page-seo")({
  component: PageSeoPage,
});
