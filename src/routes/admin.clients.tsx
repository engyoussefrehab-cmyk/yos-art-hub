import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Save, Trash2, ArrowUp, ArrowDown, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAdminLang } from "@/i18n/admin-lang";

type Row = {
  id: string;
  name: string;
  logo_url: string;
  href: string | null;
  sort_order: number;
  is_visible: boolean;
};

const MAX_SIZE = 500 * 1024; // 500KB

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function ClientsAdminPage() {
  const { lang, dir } = useAdminLang();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [dirty, setDirty] = useState<Record<string, boolean>>({});

  const load = async () => {
    const { data, error } = await supabase
      .from("client_logos")
      .select("*")
      .order("sort_order", { ascending: true });
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
    const { error } = await supabase.from("client_logos").update(rest as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(lang === "ar" ? "تم الحفظ" : "Saved");
    setDirty((d) => { const n = { ...d }; delete n[id]; return n; });
  };
  const add = async () => {
    const nextOrder = (rows ?? []).reduce((m, r) => Math.max(m, r.sort_order), 0) + 10;
    const { data, error } = await supabase.from("client_logos").insert({
      name: lang === "ar" ? "علامة جديدة" : "New brand",
      logo_url: "",
      sort_order: nextOrder,
      is_visible: true,
    }).select("*").maybeSingle();
    if (error) { toast.error(error.message); return; }
    if (data) setRows((rs) => [...(rs ?? []), data as Row]);
  };
  const remove = async (id: string) => {
    if (!confirm(lang === "ar" ? "حذف هذا الشعار؟" : "Delete this logo?")) return;
    const { error } = await supabase.from("client_logos").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  };
  const move = async (i: number, dr: -1 | 1) => {
    const list = rows ?? []; const j = i + dr;
    if (j < 0 || j >= list.length) return;
    const a = list[i]; const b = list[j];
    await supabase.from("client_logos").update({ sort_order: b.sort_order }).eq("id", a.id);
    await supabase.from("client_logos").update({ sort_order: a.sort_order }).eq("id", b.id);
    load();
  };

  const onUpload = async (r: Row, file: File) => {
    if (!/^image\/(png|svg\+xml|webp)$/.test(file.type)) {
      toast.error(lang === "ar" ? "الرجاء رفع PNG أو SVG أو WEBP" : "Please upload PNG, SVG, or WEBP");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error(lang === "ar" ? "حجم الملف يجب أن يكون أقل من 500 كيلوبايت" : "File must be under 500KB");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    const { error } = await supabase.from("client_logos").update({ logo_url: dataUrl }).eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    toast.success(lang === "ar" ? "تم رفع الشعار" : "Logo uploaded");
    patch(r.id, { logo_url: dataUrl });
    setDirty((d) => { const n = { ...d }; delete n[r.id]; return n; });
  };

  return (
    <div dir={dir} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {lang === "ar" ? "أبرز العملاء (شعارات)" : "Selected Clients (Logos)"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "ar"
              ? "ارفع شعار PNG أبيض لكل علامة تجارية — سيظهر تلقائيًا في السلايدر بالصفحة الرئيسية. الحد الأقصى 500 كيلوبايت."
              : "Upload a white PNG logo per brand — it appears automatically in the homepage marquee. Max 500KB."}
          </p>
        </div>
        <Button size="sm" onClick={add}>
          <Plus className="me-1 h-4 w-4" /> {lang === "ar" ? "إضافة شعار" : "Add logo"}
        </Button>
      </div>

      {rows === null ? (
        <div className="text-sm text-muted-foreground">
          {lang === "ar" ? "جاري التحميل…" : "Loading…"}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
          {lang === "ar" ? "لا توجد شعارات بعد." : "No logos yet."}
        </div>
      ) : (
        <ol className="grid gap-4 md:grid-cols-2">
          {rows.map((r, i) => (
            <LogoRow
              key={r.id}
              r={r}
              i={i}
              total={rows.length}
              lang={lang}
              dirty={!!dirty[r.id]}
              onPatch={(p) => patch(r.id, p)}
              onSave={() => saveOne(r)}
              onRemove={() => remove(r.id)}
              onMove={(dr) => move(i, dr)}
              onUpload={(f) => onUpload(r, f)}
            />
          ))}
        </ol>
      )}
    </div>
  );
}

function LogoRow(props: {
  r: Row; i: number; total: number; lang: "ar" | "en"; dirty: boolean;
  onPatch: (p: Partial<Row>) => void;
  onSave: () => void;
  onRemove: () => void;
  onMove: (dr: -1 | 1) => void;
  onUpload: (f: File) => void;
}) {
  const { r, i, total, lang, dirty } = props;
  const fileRef = useRef<HTMLInputElement | null>(null);
  return (
    <li className="rounded-xl border border-border/70 bg-background p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-40 shrink-0 items-center justify-center rounded-lg bg-neutral-900 p-3">
          {r.logo_url ? (
            <img src={r.logo_url} alt={r.name} className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-xs text-white/40">
              {lang === "ar" ? "لا يوجد شعار" : "No logo"}
            </span>
          )}
        </div>
        <div className="grid flex-1 gap-2">
          <div className="grid gap-1.5">
            <Label className="text-xs">{lang === "ar" ? "اسم العلامة" : "Brand name"}</Label>
            <Input value={r.name} onChange={(e) => props.onPatch({ name: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">{lang === "ar" ? "الرابط (اختياري)" : "Href (optional)"}</Label>
            <Input value={r.href ?? ""} dir="ltr" onChange={(e) => props.onPatch({ href: e.target.value })} placeholder="https://…" />
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/svg+xml,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) props.onUpload(f);
            e.target.value = "";
          }}
        />
        <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>
          <Upload className="me-1 h-4 w-4" /> {lang === "ar" ? "رفع شعار" : "Upload logo"}
        </Button>
        <label className="ms-2 flex items-center gap-2">
          <Switch checked={r.is_visible} onCheckedChange={(v) => props.onPatch({ is_visible: v })} />
          {lang === "ar" ? "ظاهر" : "Visible"}
        </label>
        <div className="ms-auto flex items-center gap-1">
          <IconBtn onClick={() => props.onMove(-1)} disabled={i === 0}><ArrowUp className="h-3.5 w-3.5" /></IconBtn>
          <IconBtn onClick={() => props.onMove(1)} disabled={i === total - 1}><ArrowDown className="h-3.5 w-3.5" /></IconBtn>
          <IconBtn onClick={props.onRemove}><Trash2 className="h-3.5 w-3.5 text-destructive" /></IconBtn>
          <Button size="sm" onClick={props.onSave} disabled={!dirty}>
            <Save className="me-1 h-4 w-4" /> {lang === "ar" ? "حفظ" : "Save"}
          </Button>
        </div>
      </div>
    </li>
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

export const Route = createFileRoute("/admin/clients")({
  component: ClientsAdminPage,
});
