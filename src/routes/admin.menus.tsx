import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Save, Trash2, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAdminLang } from "@/i18n/admin-lang";

type Item = {
  id: string;
  location: string;
  label_ar: string;
  label_en: string;
  url: string;
  order_index: number;
  is_visible: boolean;
  is_external: boolean;
  open_in_new_tab: boolean;
  icon: string | null;
};

const LOCATIONS = [
  { key: "header",           ar: "الهيدر",           en: "Header" },
  { key: "footer_primary",   ar: "الفوتر - أساسي",   en: "Footer - primary" },
  { key: "footer_secondary", ar: "الفوتر - إضافي",   en: "Footer - secondary" },
  { key: "mobile",           ar: "قائمة الموبايل",   en: "Mobile menu" },
];

function MenusPage() {
  const { lang, dir } = useAdminLang();
  const [location, setLocation] = useState<string>("header");
  const [rows, setRows] = useState<Item[] | null>(null);
  const [dirty, setDirty] = useState<Record<string, boolean>>({});

  const load = async () => {
    const { data, error } = await supabase
      .from("site_menus")
      .select("*")
      .eq("location", location)
      .order("order_index", { ascending: true });
    if (error) { toast.error(error.message); return; }
    setRows((data ?? []) as Item[]);
    setDirty({});
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [location]);

  const patch = (id: string, p: Partial<Item>) => {
    setRows((rs) => (rs ?? []).map((r) => (r.id === id ? { ...r, ...p } : r)));
    setDirty((d) => ({ ...d, [id]: true }));
  };
  const saveOne = async (r: Item) => {
    const { error } = await supabase.from("site_menus").update({
      label_ar: r.label_ar, label_en: r.label_en, url: r.url,
      order_index: r.order_index, is_visible: r.is_visible,
      is_external: r.is_external, open_in_new_tab: r.open_in_new_tab, icon: r.icon,
    }).eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    toast.success(lang === "ar" ? "تم الحفظ" : "Saved");
    setDirty((d) => { const n = { ...d }; delete n[r.id]; return n; });
  };
  const add = async () => {
    const nextOrder = (rows ?? []).reduce((m, r) => Math.max(m, r.order_index), 0) + 10;
    const { data, error } = await supabase.from("site_menus").insert({
      location, label_ar: lang === "ar" ? "عنصر جديد" : "New item",
      label_en: "New item", url: "/", order_index: nextOrder,
    }).select("*").maybeSingle();
    if (error) { toast.error(error.message); return; }
    if (data) setRows((rs) => [...(rs ?? []), data as Item]);
  };
  const remove = async (id: string) => {
    if (!confirm(lang === "ar" ? "حذف هذا العنصر؟" : "Delete this item?")) return;
    await supabase.from("site_menus").delete().eq("id", id);
    load();
  };
  const move = async (i: number, dr: -1 | 1) => {
    const list = rows ?? []; const j = i + dr;
    if (j < 0 || j >= list.length) return;
    const a = list[i]; const b = list[j];
    await supabase.from("site_menus").update({ order_index: b.order_index }).eq("id", a.id);
    await supabase.from("site_menus").update({ order_index: a.order_index }).eq("id", b.id);
    load();
  };

  return (
    <div dir={dir} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{lang === "ar" ? "قوائم التنقل" : "Navigation Menus"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "ar"
              ? "روابط الهيدر والفوتر وقائمة الموبايل، ثنائية اللغة وقابلة للترتيب."
              : "Header, footer, and mobile links — bilingual and reorderable."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-10 rounded-md border border-border/70 bg-background px-3 text-sm"
          >
            {LOCATIONS.map((l) => (<option key={l.key} value={l.key}>{lang === "ar" ? l.ar : l.en}</option>))}
          </select>
          <Button size="sm" onClick={add}><Plus className="me-1 h-4 w-4" /> {lang === "ar" ? "إضافة" : "Add"}</Button>
        </div>
      </div>

      {rows === null ? (
        <div className="text-sm text-muted-foreground">{lang === "ar" ? "جاري التحميل…" : "Loading…"}</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
          {lang === "ar" ? "لا توجد عناصر بعد." : "No items yet."}
        </div>
      ) : (
        <ol className="grid gap-3">
          {rows.map((r, i) => (
            <li key={r.id} className="rounded-xl border border-border/70 bg-background p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs">{lang === "ar" ? "التسمية (عربي)" : "Label (Arabic)"}</Label>
                  <Input value={r.label_ar} onChange={(e) => patch(r.id, { label_ar: e.target.value })} dir="rtl" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">{lang === "ar" ? "Label (English)" : "Label (English)"}</Label>
                  <Input value={r.label_en} onChange={(e) => patch(r.id, { label_en: e.target.value })} dir="ltr" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">URL</Label>
                  <Input value={r.url} onChange={(e) => patch(r.id, { url: e.target.value })} dir="ltr" placeholder="/projects أو https://…" />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <label className="flex items-center gap-2">
                  <Switch checked={r.is_visible} onCheckedChange={(v) => patch(r.id, { is_visible: v })} />
                  {lang === "ar" ? "ظاهر" : "Visible"}
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={r.is_external} onCheckedChange={(v) => patch(r.id, { is_external: v })} />
                  <ExternalLink className="h-3 w-3" /> {lang === "ar" ? "خارجي" : "External"}
                </label>
                <label className="flex items-center gap-2">
                  <Switch checked={r.open_in_new_tab} onCheckedChange={(v) => patch(r.id, { open_in_new_tab: v })} />
                  {lang === "ar" ? "تبويب جديد" : "New tab"}
                </label>
                <div className="ms-auto flex items-center gap-1">
                  <IconBtn onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-3.5 w-3.5" /></IconBtn>
                  <IconBtn onClick={() => move(i, 1)} disabled={i === rows.length - 1}><ArrowDown className="h-3.5 w-3.5" /></IconBtn>
                  <IconBtn onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></IconBtn>
                  <Button size="sm" onClick={() => saveOne(r)} disabled={!dirty[r.id]}>
                    <Save className="me-1 h-4 w-4" /> {lang === "ar" ? "حفظ" : "Save"}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
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

export const Route = createFileRoute("/admin/menus")({
  component: MenusPage,
});
