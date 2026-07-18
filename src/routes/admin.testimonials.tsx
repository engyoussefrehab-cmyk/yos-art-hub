import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Save, Trash2, ArrowUp, ArrowDown, Star } from "lucide-react";
import { toast } from "sonner";
import { useAdminLang } from "@/i18n/admin-lang";

type Row = {
  id: string;
  name_ar: string; name_en: string | null;
  role_ar: string | null; role_en: string | null;
  text_ar: string; text_en: string | null;
  rating: number;
  source: string | null; source_url: string | null;
  avatar_url: string | null;
  is_verified: boolean; is_featured: boolean; is_visible: boolean;
  order_index: number;
};

function TestimonialsPage() {
  const { lang, dir } = useAdminLang();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [dirty, setDirty] = useState<Record<string, boolean>>({});

  const load = async () => {
    const { data, error } = await supabase.from("testimonials").select("*").order("order_index", { ascending: true });
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
    const { error } = await supabase.from("testimonials").update(rest as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(lang === "ar" ? "تم الحفظ" : "Saved");
    setDirty((d) => { const n = { ...d }; delete n[id]; return n; });
  };
  const add = async () => {
    const nextOrder = (rows ?? []).reduce((m, r) => Math.max(m, r.order_index), 0) + 10;
    const { data, error } = await supabase.from("testimonials").insert({
      name_ar: lang === "ar" ? "عميل جديد" : "New client",
      text_ar: "", rating: 5, order_index: nextOrder,
    }).select("*").maybeSingle();
    if (error) { toast.error(error.message); return; }
    if (data) setRows((rs) => [...(rs ?? []), data as Row]);
  };
  const remove = async (id: string) => {
    if (!confirm(lang === "ar" ? "حذف هذا الرأي؟" : "Delete this testimonial?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    load();
  };
  const move = async (i: number, dr: -1 | 1) => {
    const list = rows ?? []; const j = i + dr;
    if (j < 0 || j >= list.length) return;
    const a = list[i]; const b = list[j];
    await supabase.from("testimonials").update({ order_index: b.order_index }).eq("id", a.id);
    await supabase.from("testimonials").update({ order_index: a.order_index }).eq("id", b.id);
    load();
  };

  return (
    <div dir={dir} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{lang === "ar" ? "آراء العملاء" : "Testimonials"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "ar" ? "إدارة آراء العملاء التي تظهر على الصفحة الرئيسية." : "Manage client testimonials shown on the homepage."}
          </p>
        </div>
        <Button size="sm" onClick={add}><Plus className="me-1 h-4 w-4" /> {lang === "ar" ? "إضافة رأي" : "Add testimonial"}</Button>
      </div>

      {rows === null ? (
        <div className="text-sm text-muted-foreground">{lang === "ar" ? "جاري التحميل…" : "Loading…"}</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
          {lang === "ar" ? "لا توجد آراء بعد." : "No testimonials yet."}
        </div>
      ) : (
        <ol className="grid gap-4">
          {rows.map((r, i) => (
            <li key={r.id} className="rounded-xl border border-border/70 bg-background p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label={lang === "ar" ? "الاسم (عربي)" : "Name (Arabic)"} value={r.name_ar} dir="rtl" onChange={(v) => patch(r.id, { name_ar: v })} />
                <Field label="Name (English)" value={r.name_en ?? ""} dir="ltr" onChange={(v) => patch(r.id, { name_en: v })} />
                <Field label={lang === "ar" ? "المسمى (عربي)" : "Role (Arabic)"} value={r.role_ar ?? ""} dir="rtl" onChange={(v) => patch(r.id, { role_ar: v })} />
                <Field label="Role (English)" value={r.role_en ?? ""} dir="ltr" onChange={(v) => patch(r.id, { role_en: v })} />
                <div className="md:col-span-2 grid gap-1.5">
                  <Label className="text-xs">{lang === "ar" ? "النص (عربي)" : "Text (Arabic)"}</Label>
                  <Textarea rows={3} value={r.text_ar} onChange={(e) => patch(r.id, { text_ar: e.target.value })} dir="rtl" />
                </div>
                <div className="md:col-span-2 grid gap-1.5">
                  <Label className="text-xs">Text (English)</Label>
                  <Textarea rows={3} value={r.text_en ?? ""} onChange={(e) => patch(r.id, { text_en: e.target.value })} dir="ltr" />
                </div>
                <Field label={lang === "ar" ? "المصدر" : "Source"} value={r.source ?? ""} dir="ltr" onChange={(v) => patch(r.id, { source: v })} placeholder="Mostaql / Website" />
                <Field label={lang === "ar" ? "رابط المصدر" : "Source URL"} value={r.source_url ?? ""} dir="ltr" onChange={(v) => patch(r.id, { source_url: v })} />
                <Field label={lang === "ar" ? "رابط الصورة" : "Avatar URL"} value={r.avatar_url ?? ""} dir="ltr" onChange={(v) => patch(r.id, { avatar_url: v })} />
                <div className="grid gap-1.5">
                  <Label className="text-xs">{lang === "ar" ? "التقييم" : "Rating"}</Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => patch(r.id, { rating: n })}>
                        <Star className={`h-5 w-5 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/50"}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <label className="flex items-center gap-2"><Switch checked={r.is_visible} onCheckedChange={(v) => patch(r.id, { is_visible: v })} />{lang === "ar" ? "ظاهر" : "Visible"}</label>
                <label className="flex items-center gap-2"><Switch checked={r.is_verified} onCheckedChange={(v) => patch(r.id, { is_verified: v })} />{lang === "ar" ? "موثّق" : "Verified"}</label>
                <label className="flex items-center gap-2"><Switch checked={r.is_featured} onCheckedChange={(v) => patch(r.id, { is_featured: v })} />{lang === "ar" ? "مميز" : "Featured"}</label>
                <div className="ms-auto flex items-center gap-1">
                  <IconBtn onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-3.5 w-3.5" /></IconBtn>
                  <IconBtn onClick={() => move(i, 1)} disabled={i === rows.length - 1}><ArrowDown className="h-3.5 w-3.5" /></IconBtn>
                  <IconBtn onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></IconBtn>
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

function Field({ label, value, onChange, dir, placeholder }: { label: string; value: string; onChange: (v: string) => void; dir?: "rtl" | "ltr"; placeholder?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} dir={dir} placeholder={placeholder} />
    </div>
  );
}
function IconBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="rounded-md border border-border/60 bg-background p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-40">
      {children}
    </button>
  );
}

export const Route = createFileRoute("/admin/testimonials")({
  component: TestimonialsPage,
});
