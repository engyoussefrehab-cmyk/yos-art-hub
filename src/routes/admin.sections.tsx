import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Save, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { toast } from "sonner";
import { useAdminLang } from "@/i18n/admin-lang";

type Section = {
  id: string;
  page_key: string;
  section_key: string;
  layout_variant: string;
  order_index: number;
  is_visible: boolean;
  content: Record<string, any>;
};

const PAGE_KEYS = [
  { key: "home",     ar: "الرئيسية",   en: "Home" },
  { key: "projects", ar: "المشاريع",   en: "Projects" },
  { key: "insights", ar: "المقالات",   en: "Insights" },
  { key: "packages", ar: "الحزم",      en: "Packages" },
  { key: "contact",  ar: "التواصل",    en: "Contact" },
  { key: "about",    ar: "من أنا",     en: "About" },
  { key: "header",   ar: "الهيدر",     en: "Header" },
  { key: "footer",   ar: "الفوتر",     en: "Footer" },
];

const SECTION_PRESETS: Record<string, { key: string; label_ar: string; label_en: string; content: Record<string, any> }[]> = {
  home: [
    { key: "hero",       label_ar: "البطل",       label_en: "Hero",       content: { title_ar: "", title_en: "", subtitle_ar: "", subtitle_en: "", image_url: "", cta_primary_ar: "", cta_primary_en: "", cta_primary_url: "" } },
    { key: "about",      label_ar: "عن يوسف",     label_en: "About",      content: { title_ar: "", title_en: "", body_ar: "", body_en: "", image_url: "" } },
    { key: "stats",      label_ar: "الأرقام",     label_en: "Stats",      content: { items: [{ value: "", label_ar: "", label_en: "" }] } },
    { key: "featured",   label_ar: "خدمات مميزة", label_en: "Featured",   content: { title_ar: "", title_en: "", subtitle_ar: "", subtitle_en: "" } },
    { key: "cta",        label_ar: "دعوة إجراء",  label_en: "CTA",        content: { title_ar: "", title_en: "", cta_ar: "", cta_en: "", url: "" } },
  ],
  projects: [
    { key: "intro",      label_ar: "المقدمة",     label_en: "Intro",      content: { title_ar: "", title_en: "", subtitle_ar: "", subtitle_en: "" } },
  ],
  insights: [
    { key: "intro",      label_ar: "المقدمة",     label_en: "Intro",      content: { title_ar: "", title_en: "", subtitle_ar: "", subtitle_en: "" } },
  ],
  packages: [
    { key: "intro",      label_ar: "المقدمة",     label_en: "Intro",      content: { title_ar: "", title_en: "", subtitle_ar: "", subtitle_en: "" } },
  ],
  contact: [
    { key: "intro",      label_ar: "المقدمة",     label_en: "Intro",      content: { title_ar: "", title_en: "", subtitle_ar: "", subtitle_en: "" } },
    { key: "info",       label_ar: "معلومات",     label_en: "Info",       content: { email: "", phone: "", whatsapp: "", address_ar: "", address_en: "" } },
  ],
  about: [
    { key: "bio",        label_ar: "السيرة",      label_en: "Bio",        content: { title_ar: "", title_en: "", body_ar: "", body_en: "" } },
  ],
  header: [
    { key: "brand",      label_ar: "الهوية",      label_en: "Brand",      content: { tagline_ar: "", tagline_en: "", cta_ar: "", cta_en: "", cta_url: "" } },
  ],
  footer: [
    { key: "brand",      label_ar: "الهوية",      label_en: "Brand",      content: { tagline_ar: "", tagline_en: "" } },
    { key: "newsletter", label_ar: "النشرة",      label_en: "Newsletter", content: { title_ar: "", title_en: "", desc_ar: "", desc_en: "", cta_ar: "", cta_en: "" } },
    { key: "bottom",     label_ar: "أسفل الفوتر", label_en: "Bottom",     content: { copyright_ar: "", copyright_en: "" } },
  ],
};

function SectionsPage() {
  const { lang, dir, t } = useAdminLang();
  const [pageKey, setPageKey] = useState<string>("home");
  const [rows, setRows] = useState<Section[] | null>(null);
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const load = async () => {
    const { data, error } = await supabase
      .from("site_sections")
      .select("*")
      .eq("page_key", pageKey)
      .order("order_index", { ascending: true });
    if (error) { toast.error(error.message); return; }
    setRows((data ?? []) as Section[]);
    setDirty({});
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [pageKey]);

  const patch = (id: string, patch: Partial<Section>) => {
    setRows((rs) => (rs ?? []).map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setDirty((d) => ({ ...d, [id]: true }));
  };
  const patchContent = (id: string, key: string, value: any) => {
    setRows((rs) => (rs ?? []).map((r) => (r.id === id ? { ...r, content: { ...r.content, [key]: value } } : r)));
    setDirty((d) => ({ ...d, [id]: true }));
  };

  const saveOne = async (r: Section) => {
    const { error } = await supabase
      .from("site_sections")
      .update({
        layout_variant: r.layout_variant,
        order_index: r.order_index,
        is_visible: r.is_visible,
        content: r.content,
      })
      .eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    toast.success(lang === "ar" ? "تم الحفظ" : "Saved");
    setDirty((d) => { const n = { ...d }; delete n[r.id]; return n; });
  };

  const addPreset = async (preset: { key: string; content: Record<string, any> }) => {
    const nextOrder = (rows ?? []).reduce((m, r) => Math.max(m, r.order_index), 0) + 10;
    const { data, error } = await supabase
      .from("site_sections")
      .insert({
        page_key: pageKey,
        section_key: preset.key,
        content: preset.content,
        order_index: nextOrder,
        is_visible: true,
      })
      .select("*")
      .maybeSingle();
    if (error) { toast.error(error.message); return; }
    if (data) {
      setRows((rs) => [...(rs ?? []), data as Section]);
      setOpen((o) => ({ ...o, [(data as Section).id]: true }));
      toast.success(lang === "ar" ? "تمت الإضافة" : "Added");
    }
  };

  const addCustom = async () => {
    const key = prompt(lang === "ar" ? "معرف السكشن (بالإنجليزية):" : "Section key (English):");
    if (!key) return;
    const slug = key.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    await addPreset({ key: slug, content: { title_ar: "", title_en: "" } });
  };

  const remove = async (id: string) => {
    if (!confirm(lang === "ar" ? "حذف هذا السكشن؟" : "Delete this section?")) return;
    const { error } = await supabase.from("site_sections").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setRows((rs) => (rs ?? []).filter((r) => r.id !== id));
    toast.success(lang === "ar" ? "تم الحذف" : "Deleted");
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const list = rows ?? [];
    const j = idx + dir;
    if (j < 0 || j >= list.length) return;
    const a = list[idx]; const b = list[j];
    await supabase.from("site_sections").update({ order_index: b.order_index }).eq("id", a.id);
    await supabase.from("site_sections").update({ order_index: a.order_index }).eq("id", b.id);
    load();
  };

  const availablePresets = useMemo(() => {
    const used = new Set((rows ?? []).map((r) => r.section_key));
    return (SECTION_PRESETS[pageKey] ?? []).filter((p) => !used.has(p.key));
  }, [rows, pageKey]);

  return (
    <div dir={dir} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {lang === "ar" ? "أقسام الصفحات" : "Page Sections"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "ar"
              ? "تحكم كامل في محتوى كل سكشن على الموقع (النصوص، الصور، الأزرار)."
              : "Full control over every section on the site (text, images, CTAs)."}
          </p>
        </div>
        <select
          value={pageKey}
          onChange={(e) => setPageKey(e.target.value)}
          className="h-10 rounded-md border border-border/70 bg-background px-3 text-sm"
        >
          {PAGE_KEYS.map((p) => (
            <option key={p.key} value={p.key}>{lang === "ar" ? p.ar : p.en}</option>
          ))}
        </select>
      </div>

      {rows === null ? (
        <div className="text-sm text-muted-foreground">{lang === "ar" ? "جاري التحميل…" : "Loading…"}</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
          {lang === "ar" ? "لا توجد أقسام. أضِف من الأسفل." : "No sections. Add one below."}
        </div>
      ) : (
        <ol className="grid gap-3">
          {rows.map((r, i) => {
            const isOpen = open[r.id] ?? false;
            return (
              <li key={r.id} className="rounded-xl border border-border/70 bg-background">
                <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setOpen((s) => ({ ...s, [r.id]: !isOpen }))}
                    className="flex flex-1 items-center gap-2 text-start text-sm font-medium"
                  >
                    <span className="text-xs text-muted-foreground">#{i + 1}</span>
                    <span>{r.section_key}</span>
                    {!r.is_visible && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        {lang === "ar" ? "مخفي" : "hidden"}
                      </span>
                    )}
                    {dirty[r.id] && (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-600">
                        {lang === "ar" ? "غير محفوظ" : "unsaved"}
                      </span>
                    )}
                    <span className="ms-auto text-muted-foreground">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  </button>
                  <IconBtn onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-3.5 w-3.5" /></IconBtn>
                  <IconBtn onClick={() => move(i, 1)} disabled={i === rows.length - 1}><ArrowDown className="h-3.5 w-3.5" /></IconBtn>
                  <IconBtn onClick={() => patch(r.id, { is_visible: !r.is_visible })}>
                    {r.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </IconBtn>
                  <IconBtn onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></IconBtn>
                </div>
                {isOpen && (
                  <div className="grid gap-3 p-4 md:grid-cols-2">
                    {Object.keys(r.content ?? {}).length === 0 && (
                      <div className="md:col-span-2 text-xs text-muted-foreground">
                        {lang === "ar" ? "لا توجد حقول. استخدم زر «حقل جديد»." : "No fields yet. Use \"New field\"."}
                      </div>
                    )}
                    {Object.entries(r.content ?? {}).map(([k, v]) => (
                      <FieldEditor
                        key={k}
                        name={k}
                        value={v}
                        onChange={(nv) => patchContent(r.id, k, nv)}
                        onRemove={() => {
                          const nc = { ...r.content };
                          delete nc[k];
                          patch(r.id, { content: nc });
                        }}
                      />
                    ))}
                    <div className="md:col-span-2 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const name = prompt(lang === "ar" ? "اسم الحقل:" : "Field name:");
                          if (!name) return;
                          patchContent(r.id, name.trim(), "");
                        }}
                      >
                        <Plus className="me-1 h-4 w-4" /> {lang === "ar" ? "حقل جديد" : "New field"}
                      </Button>
                      <div className="ms-auto flex items-center gap-2">
                        <Label className="text-xs">{lang === "ar" ? "ظاهر" : "Visible"}</Label>
                        <Switch checked={r.is_visible} onCheckedChange={(v) => patch(r.id, { is_visible: v })} />
                        <Button size="sm" onClick={() => saveOne(r)} disabled={!dirty[r.id]}>
                          <Save className="me-1 h-4 w-4" /> {lang === "ar" ? "حفظ" : "Save"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4">
        <div className="mb-2 text-xs font-semibold text-muted-foreground">
          {lang === "ar" ? "أقسام جاهزة لهذه الصفحة:" : "Preset sections for this page:"}
        </div>
        <div className="flex flex-wrap gap-2">
          {availablePresets.length === 0 && (
            <span className="text-xs text-muted-foreground">
              {lang === "ar" ? "أُضيفت كل الأقسام الجاهزة." : "All presets added."}
            </span>
          )}
          {availablePresets.map((p) => (
            <Button key={p.key} size="sm" variant="outline" onClick={() => addPreset(p)}>
              <Plus className="me-1 h-4 w-4" /> {lang === "ar" ? p.label_ar : p.label_en}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={addCustom}>
            <Plus className="me-1 h-4 w-4" /> {lang === "ar" ? "سكشن مخصص" : "Custom section"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-border/60 bg-background p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function FieldEditor({
  name, value, onChange, onRemove,
}: { name: string; value: any; onChange: (v: any) => void; onRemove: () => void }) {
  const isArabic = name.endsWith("_ar");
  const isEnglish = name.endsWith("_en");
  const isLong = typeof value === "string" && value.length > 80;
  const isArray = Array.isArray(value);

  if (isArray) {
    return (
      <div className="md:col-span-2 grid gap-2 rounded-lg border border-border/60 p-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">{name}</Label>
          <button onClick={onRemove} type="button" className="text-xs text-destructive">×</button>
        </div>
        <Textarea
          rows={4}
          value={JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try { onChange(JSON.parse(e.target.value)); } catch { /* keep typing */ }
          }}
          dir="ltr"
          className="font-mono text-xs"
        />
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{name}</Label>
        <button onClick={onRemove} type="button" className="text-xs text-destructive">×</button>
      </div>
      {isLong ? (
        <Textarea
          rows={3}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          dir={isArabic ? "rtl" : isEnglish ? "ltr" : undefined}
        />
      ) : (
        <Input
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          dir={isArabic ? "rtl" : isEnglish ? "ltr" : undefined}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute("/admin/sections")({
  component: SectionsPage,
});
