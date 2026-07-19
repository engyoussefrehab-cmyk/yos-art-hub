import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Trash2,
  Save,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  FolderTree,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";


type FAQ = { q_ar?: string; q_en?: string; a_ar?: string; a_en?: string };

type Category = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  icon: string | null;
  cover_image_url: string | null;
  hero_image_url: string | null;
  intro_ar: string | null;
  intro_en: string | null;
  content_ar: string | null;
  content_en: string | null;
  cta_label_ar: string | null;
  cta_label_en: string | null;
  cta_href: string | null;
  faq: FAQ[];
  seo_title_ar: string | null;
  seo_title_en: string | null;
  seo_description_ar: string | null;
  seo_description_en: string | null;
  seo_keywords: string[] | null;
  og_image_url: string | null;
  is_hidden: boolean;
  sort_order: number;
  project_count?: number;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function CategoriesPage() {
  const [rows, setRows] = useState<Category[] | null>(null);
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState({
    slug: "",
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: "",
  });
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const load = async () => {
    const [cats, projs] = await Promise.all([
      supabase
        .from("project_categories")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase.from("portfolio_projects").select("category_id, category_slug"),
    ]);
    const counts = new Map<string, number>();
    (projs.data ?? []).forEach((r: any) => {
      const key = r.category_id ?? r.category_slug;
      if (!key) return;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    setRows(
      ((cats.data ?? []) as Category[]).map((c) => ({
        ...c,
        project_count: (counts.get(c.id) ?? 0) + (counts.get(c.slug) ?? 0),
      })),
    );
  };
  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!draft.name_ar && !draft.name_en)
      return toast.error("أدخل اسم التصنيف");
    setBusy(true);
    const slug = draft.slug || slugify(draft.name_en || draft.name_ar);
    const nextOrder = (rows?.length ?? 0) + 1;
    const { error } = await supabase.from("project_categories").insert({
      slug,
      name_ar: draft.name_ar || draft.name_en,
      name_en: draft.name_en || draft.name_ar,
      description_ar: draft.description_ar || null,
      description_en: draft.description_en || null,
      sort_order: nextOrder,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("تمت الإضافة");
    setDraft({
      slug: "",
      name_ar: "",
      name_en: "",
      description_ar: "",
      description_en: "",
    });
    load();
  };

  const update = async (c: Category) => {
    const { error } = await supabase
      .from("project_categories")
      .update({
        slug: c.slug,
        name_ar: c.name_ar,
        name_en: c.name_en,
        description_ar: c.description_ar,
        description_en: c.description_en,
        icon: c.icon,
        cover_image_url: c.cover_image_url,
        hero_image_url: c.hero_image_url,
        intro_ar: c.intro_ar,
        intro_en: c.intro_en,
        content_ar: c.content_ar,
        content_en: c.content_en,
        cta_label_ar: c.cta_label_ar,
        cta_label_en: c.cta_label_en,
        cta_href: c.cta_href,
        faq: c.faq ?? [],
        seo_title_ar: c.seo_title_ar,
        seo_title_en: c.seo_title_en,
        seo_description_ar: c.seo_description_ar,
        seo_description_en: c.seo_description_en,
        seo_keywords: c.seo_keywords,
        og_image_url: c.og_image_url,
        is_hidden: c.is_hidden,
      })
      .eq("id", c.id);
    if (error) toast.error(error.message);
    else {
      toast.success("تم الحفظ");
      setEditing(null);
      load();
    }
  };

  const toggleHidden = async (c: Category) => {
    const { error } = await supabase
      .from("project_categories")
      .update({ is_hidden: !c.is_hidden })
      .eq("id", c.id);
    if (error) toast.error(error.message);
    else load();
  };

  const move = async (c: Category, dir: -1 | 1) => {
    if (!rows) return;
    const idx = rows.findIndex((r) => r.id === c.id);
    const swap = rows[idx + dir];
    if (!swap) return;
    await Promise.all([
      supabase
        .from("project_categories")
        .update({ sort_order: swap.sort_order })
        .eq("id", c.id),
      supabase
        .from("project_categories")
        .update({ sort_order: c.sort_order })
        .eq("id", swap.id),
    ]);
    load();
  };

  const del = async (c: Category) => {
    if ((c.project_count ?? 0) > 0)
      return toast.error(
        `لا يمكن الحذف: ${c.project_count} مشروع مرتبط بهذا التصنيف.`,
      );
    if (!confirm(`حذف التصنيف "${c.name_ar || c.name_en}"؟`)) return;
    const { error } = await supabase
      .from("project_categories")
      .delete()
      .eq("id", c.id);
    if (error) toast.error(error.message);
    else {
      toast.success("تم الحذف");
      load();
    }
  };

  const filtered = (rows ?? []).filter(
    (r) =>
      !q ||
      `${r.name_ar} ${r.name_en} ${r.slug}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <FolderTree className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            تصنيفات المشاريع
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            نظّم مشاريعك في تخصصات (هوية بصرية، سوشيال ميديا، تغليف…) وتحكم في
            ترتيب عرضها وظهورها.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-border/70 bg-card p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Plus className="h-4 w-4" /> إضافة تصنيف جديد
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-1.5">
            <Label className="text-xs">الاسم بالعربية</Label>
            <Input
              value={draft.name_ar}
              onChange={(e) => setDraft({ ...draft, name_ar: e.target.value })}
              placeholder="مثال: الهوية البصرية"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Name in English</Label>
            <Input
              value={draft.name_en}
              onChange={(e) => setDraft({ ...draft, name_en: e.target.value })}
              placeholder="e.g. Brand Identity"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">الوصف بالعربية</Label>
            <Textarea
              rows={2}
              value={draft.description_ar}
              onChange={(e) =>
                setDraft({ ...draft, description_ar: e.target.value })
              }
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Description in English</Label>
            <Textarea
              rows={2}
              value={draft.description_en}
              onChange={(e) =>
                setDraft({ ...draft, description_en: e.target.value })
              }
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Slug (اختياري)</Label>
            <Input
              value={draft.slug}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              placeholder="سيولد تلقائياً"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={create} disabled={busy} className="w-full">
              {busy ? "جاري…" : "إضافة التصنيف"}
            </Button>
          </div>
        </div>
      </section>

      <Input
        placeholder="بحث في التصنيفات…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-xs"
      />

      {rows === null ? (
        <div className="text-sm text-muted-foreground">جاري التحميل…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
          لا توجد تصنيفات بعد. أضف أول تصنيف من الأعلى.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <CategoryCard
              key={c.id}
              category={c}
              open={editing === c.id}
              onToggle={() => setEditing(editing === c.id ? null : c.id)}
              onSave={update}
              onDelete={del}
              onToggleHidden={toggleHidden}
              onMoveUp={() => move(c, -1)}
              onMoveDown={() => move(c, 1)}
              isFirst={i === 0}
              isLast={i === filtered.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryCard({
  category,
  open,
  onToggle,
  onSave,
  onDelete,
  onToggleHidden,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  category: Category;
  open: boolean;
  onToggle: () => void;
  onSave: (c: Category) => void;
  onDelete: (c: Category) => void;
  onToggleHidden: (c: Category) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [c, setC] = useState(category);
  useEffect(() => setC(category), [category]);
  const dirty = JSON.stringify(c) !== JSON.stringify(category);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="flex items-center gap-3 p-4">
        <div className="flex flex-col gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            disabled={isFirst}
            onClick={onMoveUp}
            title="تحريك للأعلى"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            disabled={isLast}
            onClick={onMoveDown}
            title="تحريك للأسفل"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
        </div>
        <button
          onClick={onToggle}
          className="flex flex-1 items-center gap-3 text-right"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{category.name_ar}</span>
              <span className="text-xs text-muted-foreground">
                · {category.name_en}
              </span>
              {category.is_hidden && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  مخفي
                </span>
              )}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              /{category.slug} · {category.project_count ?? 0} مشروع
            </div>
          </div>
        </button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onToggleHidden(category)}
          title={category.is_hidden ? "إظهار" : "إخفاء"}
        >
          {category.is_hidden ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(category)}
          title="حذف"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      {open && (
        <div className="grid gap-3 border-t border-border/60 bg-muted/20 p-5 md:grid-cols-2">
          <div className="grid gap-1.5">
            <Label className="text-xs">الاسم بالعربية</Label>
            <Input
              value={c.name_ar}
              onChange={(e) => setC({ ...c, name_ar: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Name in English</Label>
            <Input
              value={c.name_en}
              onChange={(e) => setC({ ...c, name_en: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label className="text-xs">Slug</Label>
            <Input
              value={c.slug}
              onChange={(e) => setC({ ...c, slug: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">الوصف بالعربية</Label>
            <Textarea
              rows={3}
              value={c.description_ar ?? ""}
              onChange={(e) =>
                setC({ ...c, description_ar: e.target.value || null })
              }
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Description in English</Label>
            <Textarea
              rows={3}
              value={c.description_en ?? ""}
              onChange={(e) =>
                setC({ ...c, description_en: e.target.value || null })
              }
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">أيقونة (اسم Lucide، اختياري)</Label>
            <Input
              value={c.icon ?? ""}
              onChange={(e) => setC({ ...c, icon: e.target.value || null })}
              placeholder="مثال: Palette"
            />
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label className="text-xs">صورة غلاف السكشن</Label>
            <CategoryCoverField
              url={c.cover_image_url ?? ""}
              onChange={(v) => setC({ ...c, cover_image_url: v || null })}
            />
          </div>

          <div className="flex items-center gap-2 md:col-span-2">
            <Switch
              checked={!c.is_hidden}
              onCheckedChange={(v) => setC({ ...c, is_hidden: !v })}
            />
            <Label className="text-sm">ظاهر في الموقع</Label>
          </div>
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button variant="ghost" onClick={onToggle}>
              إلغاء
            </Button>
            <Button onClick={() => onSave(c)} disabled={!dirty}>
              <Save className="me-2 h-4 w-4" /> حفظ التغييرات
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryCoverField({ url, onChange }: { url: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const handle = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("الملف ليس صورة");
    if (file.size > 8 * 1024 * 1024) return toast.error("الحد الأقصى 8MB");
    setBusy(true);
    try {
      const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
      const path = `categories/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("portfolio-covers")
        .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
      if (error) throw error;
      onChange(`/api/public/portfolio/cover/${path}`);
      toast.success("تم رفع الصورة");
    } catch (e: any) {
      toast.error(e.message ?? "فشل الرفع");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="grid gap-2">
      {url ? (
        <div className="relative overflow-hidden rounded-lg border border-border/60">
          <img src={url} alt="cover" className="max-h-48 w-full object-cover" loading="lazy" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute end-2 top-2 rounded-full bg-black/60 p-1.5 text-white"
            title="حذف الصورة"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 p-6 text-sm text-muted-foreground hover:bg-muted/30">
          <Upload className="h-4 w-4" />
          <span>{busy ? "جاري الرفع…" : "اضغط لرفع صورة السكشن"}</span>
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => {
              handle(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      )}
      <Input
        value={url}
        onChange={(e) => onChange(e.target.value)}
        placeholder="أو الصق رابطًا للصورة"
        dir="ltr"
      />
    </div>
  );
}

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});

