import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Upload, X, ArrowUp, ArrowDown, Star, ExternalLink, Trash2, AlertCircle,
  Plus, Palette, Tag as TagIcon, Check, Loader2,
} from "lucide-react";
import { ProjectBlocksEditor } from "@/components/admin/ProjectBlocksEditor";
import { normalizeBlocks, type ProjectBlock } from "@/lib/project-blocks";

type CategoryOpt = { id: string; slug: string; name_ar: string; name_en: string };
type TagOpt = { id: string; slug: string; label_ar: string; label_en: string };

type BrandColor = { name?: string; hex: string };
type Typography = {
  heading_ar?: string; body_ar?: string;
  heading_en?: string; body_en?: string;
};

type ProjectForm = {
  slug: string;
  name_ar: string;
  name_en: string;
  client: string;
  client_country: string;
  year: string;
  duration: string;
  role: string;
  team: string;
  industry: string;
  category_id: string;
  category_slug: string;
  short_description_ar: string;
  short_description_en: string;
  challenge_ar: string;
  challenge_en: string;
  solution_ar: string;
  solution_en: string;
  results_ar: string;
  results_en: string;
  services_used: string;
  deliverables_ar: string;
  deliverables_en: string;
  project_url: string;
  behance_url: string;
  figma_url: string;
  og_image_url: string;
  hero_image_url: string;
  thumbnail_url: string;
  gallery: string[];
  brand_colors: BrandColor[];
  typography: Typography;
  seo_title_ar: string;
  seo_title_en: string;
  seo_description_ar: string;
  seo_description_en: string;
  seo_keywords: string;
  tag_ids: string[];
  featured: boolean;
  is_pinned: boolean;
  is_confidential: boolean;
  is_archived: boolean;
  status: "draft" | "published" | "scheduled" | "archived";
  published_at: string;
  sort_order: number;
  blocks: ProjectBlock[];
};

const empty: ProjectForm = {
  slug: "", name_ar: "", name_en: "",
  client: "", client_country: "", year: "",
  duration: "", role: "", team: "",
  industry: "", category_id: "", category_slug: "",
  short_description_ar: "", short_description_en: "",
  challenge_ar: "", challenge_en: "",
  solution_ar: "", solution_en: "",
  results_ar: "", results_en: "",
  services_used: "",
  deliverables_ar: "", deliverables_en: "",
  project_url: "", behance_url: "", figma_url: "",
  og_image_url: "", hero_image_url: "", thumbnail_url: "",
  gallery: [],
  brand_colors: [],
  typography: {},
  seo_title_ar: "", seo_title_en: "",
  seo_description_ar: "", seo_description_en: "",
  seo_keywords: "",
  tag_ids: [],
  featured: false, is_pinned: false, is_confidential: false, is_archived: false,
  status: "draft", published_at: "",
  sort_order: 0,
  blocks: [],
};

const MAX_FILE_MB = 10;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const MAX_GALLERY = 30;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"];

type FieldErrors = Partial<Record<keyof ProjectForm, string>>;

function slugify(s: string) {
  return s.trim().toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch { return false; }
}

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return `صيغة "${file.name}" غير مدعومة.`;
  if (file.size > MAX_FILE_BYTES) return `الملف "${file.name}" أكبر من ${MAX_FILE_MB} ميجابايت.`;
  return null;
}

async function uploadToPortfolio(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `projects/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("portfolio-covers").upload(path, file, {
    cacheControl: "31536000", upsert: false, contentType: file.type,
  });
  if (error) throw error;
  return `/api/public/portfolio/cover/${path}`;
}

export function AdminPortfolioEditorView({ id }: { id?: string }) {
  const navigate = useNavigate();
  const isNew = !id;
  const [f, setF] = useState<ProjectForm>(empty);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryProgress, setGalleryProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [categories, setCategories] = useState<CategoryOpt[]>([]);
  const [tags, setTags] = useState<TagOpt[]>([]);

  useEffect(() => {
    (async () => {
      const [cats, tg] = await Promise.all([
        supabase.from("project_categories").select("id, slug, name_ar, name_en").order("sort_order"),
        supabase.from("tags").select("id, slug, label_ar, label_en").order("label_ar"),
      ]);
      setCategories((cats.data ?? []) as CategoryOpt[]);
      setTags((tg.data ?? []) as TagOpt[]);
    })();
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [{ data, error }, ptRes] = await Promise.all([
        supabase.from("portfolio_projects").select("*").eq("id", id).maybeSingle(),
        supabase.from("project_tags").select("tag_id").eq("project_id", id),
      ]);
      if (error) { toast.error(error.message); setLoading(false); return; }
      if (data) {
        const r = data as any;
        const gallery: string[] = Array.isArray(r.gallery)
          ? r.gallery.map((g: any) => (typeof g === "string" ? g : g?.url)).filter(Boolean)
          : [];
        const brand_colors: BrandColor[] = Array.isArray(r.brand_colors)
          ? r.brand_colors.filter((c: any) => c && c.hex).map((c: any) => ({ name: c.name ?? "", hex: c.hex }))
          : [];
        const typography: Typography =
          r.typography && typeof r.typography === "object" && !Array.isArray(r.typography) ? r.typography : {};
        const deliverables: any = r.deliverables ?? {};
        setF({
          slug: r.slug ?? "",
          name_ar: r.name_ar ?? "", name_en: r.name_en ?? "",
          client: r.client ?? "", client_country: r.client_country ?? "",
          year: r.year ? String(r.year) : "",
          duration: r.duration ?? "", role: r.role ?? "", team: r.team ?? "",
          industry: r.industry ?? "",
          category_id: r.category_id ?? "",
          category_slug: r.category_slug ?? "",
          short_description_ar: r.short_description_ar ?? "",
          short_description_en: r.short_description_en ?? "",
          challenge_ar: r.challenge_ar ?? "", challenge_en: r.challenge_en ?? "",
          solution_ar: r.solution_ar ?? "", solution_en: r.solution_en ?? "",
          results_ar: r.results_ar ?? "", results_en: r.results_en ?? "",
          services_used: (r.services_used ?? []).join(", "),
          deliverables_ar: Array.isArray(deliverables.ar) ? deliverables.ar.join("\n") : (deliverables.ar ?? ""),
          deliverables_en: Array.isArray(deliverables.en) ? deliverables.en.join("\n") : (deliverables.en ?? ""),
          project_url: r.project_url ?? "",
          behance_url: r.behance_url ?? "",
          figma_url: r.figma_url ?? "",
          og_image_url: r.og_image_url ?? "",
          hero_image_url: r.hero_image_url ?? "",
          thumbnail_url: r.thumbnail_url ?? "",
          gallery,
          brand_colors,
          typography,
          seo_title_ar: r.seo_title_ar ?? "", seo_title_en: r.seo_title_en ?? "",
          seo_description_ar: r.seo_description_ar ?? "", seo_description_en: r.seo_description_en ?? "",
          seo_keywords: (r.seo_keywords ?? []).join(", "),
          tag_ids: (ptRes.data ?? []).map((x: any) => x.tag_id),
          featured: !!r.featured,
          is_pinned: !!r.is_pinned,
          is_confidential: !!r.is_confidential,
          is_archived: !!r.is_archived,
          status: (r.status ?? "draft") as any,
          published_at: toLocalInput(r.published_at),
          sort_order: r.sort_order ?? 0,
          blocks: normalizeBlocks(r.layout_blocks),
        });
      }
      setLoading(false);
    })();
  }, [id]);

  const set = <K extends keyof ProjectForm>(k: K, v: ProjectForm[K]) => {
    setF((s) => ({ ...s, [k]: v }));
    setErrors((prev) => { if (!prev[k]) return prev; const n = { ...prev }; delete n[k]; return n; });
  };

  const autoSlug = useMemo(() => slugify(f.name_en || f.name_ar), [f.name_en, f.name_ar]);
  useEffect(() => {
    if (!slugTouched && autoSlug) setF((s) => ({ ...s, slug: autoSlug }));
  }, [autoSlug, slugTouched]);

  // Keep category_slug in sync when category_id changes
  useEffect(() => {
    if (!f.category_id) return;
    const cat = categories.find((c) => c.id === f.category_id);
    if (cat && cat.slug !== f.category_slug) setF((s) => ({ ...s, category_slug: cat.slug }));
  }, [f.category_id, categories]);

  const uploadSingle = async (
    file: File,
    field: "og_image_url" | "hero_image_url" | "thumbnail_url",
    setBusy: (b: boolean) => void,
    label: string,
  ) => {
    const err = validateFile(file);
    if (err) return toast.error(err);
    setBusy(true);
    try {
      const url = await uploadToPortfolio(file);
      set(field, url);
      toast.success(`تم رفع ${label}`);
    } catch (e: any) { toast.error(e.message ?? "فشل الرفع"); }
    finally { setBusy(false); }
  };

  const onGalleryFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    const remaining = MAX_GALLERY - f.gallery.length;
    if (remaining <= 0) return toast.error(`الحد الأقصى ${MAX_GALLERY} صورة.`);
    const toUpload = list.slice(0, remaining);
    if (list.length > remaining)
      toast.warning(`تم تجاهل ${list.length - remaining} صورة.`);
    for (const file of toUpload) { const err = validateFile(file); if (err) return toast.error(err); }
    setUploadingGallery(true);
    setGalleryProgress({ done: 0, total: toUpload.length });
    try {
      const urls: string[] = [];
      for (let i = 0; i < toUpload.length; i++) {
        const url = await uploadToPortfolio(toUpload[i]);
        urls.push(url);
        setGalleryProgress({ done: i + 1, total: toUpload.length });
      }
      setF((s) => ({ ...s, gallery: [...s.gallery, ...urls] }));
      toast.success(`تم رفع ${urls.length} صورة`);
    } catch (e: any) { toast.error(e.message ?? "فشل الرفع"); }
    finally { setUploadingGallery(false); setGalleryProgress(null); }
  };

  const moveGallery = (idx: number, dir: -1 | 1) => {
    setF((s) => {
      const arr = [...s.gallery]; const j = idx + dir;
      if (j < 0 || j >= arr.length) return s;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return { ...s, gallery: arr };
    });
  };
  const removeGallery = (idx: number) =>
    setF((s) => ({ ...s, gallery: s.gallery.filter((_, i) => i !== idx) }));
  const setAsCover = (url: string) => { set("og_image_url", url); toast.success("تم تعيين الغلاف"); };

  // Brand colors
  const addColor = () =>
    setF((s) => ({ ...s, brand_colors: [...s.brand_colors, { name: "", hex: "#000000" }] }));
  const updateColor = (i: number, patch: Partial<BrandColor>) =>
    setF((s) => ({ ...s, brand_colors: s.brand_colors.map((c, idx) => idx === i ? { ...c, ...patch } : c) }));
  const removeColor = (i: number) =>
    setF((s) => ({ ...s, brand_colors: s.brand_colors.filter((_, idx) => idx !== i) }));

  const toggleTag = (id: string) =>
    setF((s) => ({
      ...s,
      tag_ids: s.tag_ids.includes(id) ? s.tag_ids.filter((t) => t !== id) : [...s.tag_ids, id],
    }));

  const validate = (opts?: { publishing?: boolean }): FieldErrors => {
    const e: FieldErrors = {};
    if (!f.name_ar.trim() && !f.name_en.trim()) e.name_ar = "اسم المشروع مطلوب";
    const slug = (f.slug || autoSlug).trim();
    if (!slug) e.slug = "الرابط (Slug) مطلوب";
    else if (!/^[\p{L}\p{N}-]+$/u.test(slug)) e.slug = "الرابط يحتوي رموزًا غير مسموحة";
    if (f.project_url && !isValidUrl(f.project_url)) e.project_url = "رابط غير صحيح";
    if (f.behance_url && !isValidUrl(f.behance_url)) e.behance_url = "رابط Behance غير صحيح";
    if (f.figma_url && !isValidUrl(f.figma_url)) e.figma_url = "رابط Figma غير صحيح";
    if (f.year && !/^\d{4}$/.test(f.year)) e.year = "أدخل سنة من 4 أرقام";
    const publishing = opts?.publishing || f.status === "published" || f.status === "scheduled";
    if (publishing) {
      if (!f.og_image_url && !f.hero_image_url) e.og_image_url = "أضف صورة غلاف أو صورة رئيسية قبل النشر";
      if (!f.category_id) e.category_id = "اختر تصنيف المشروع قبل النشر";
      const seoTitle = f.seo_title_ar || f.seo_title_en;
      if (!seoTitle.trim()) e.seo_title_ar = "عنوان SEO مطلوب قبل النشر";
      const seoDesc = f.seo_description_ar || f.seo_description_en;
      if (!seoDesc.trim()) e.seo_description_ar = "وصف SEO مطلوب قبل النشر";
      else if (seoDesc.trim().length < 50) e.seo_description_ar = "وصف SEO قصير جدًا (50 حرفًا فأكثر)";
      if (f.status === "scheduled" && !f.published_at) e.published_at = "حدّد تاريخ النشر";
    }
    return e;
  };

  const save = async (opts?: { publishNow?: boolean; draft?: boolean }) => {
    const publishing = !!opts?.publishNow;
    const draft = !!opts?.draft;
    const eObj = validate({ publishing });
    setErrors(eObj);
    if (Object.keys(eObj).length > 0) { toast.error("راجع الحقول المطلوبة"); return; }
    const slug = f.slug || autoSlug;

    setSaving(true);
    const nextStatus: ProjectForm["status"] = f.is_archived
      ? "archived"
      : publishing ? "published" : draft ? "draft" : f.status;
    const payload: any = {
      slug,
      name_ar: f.name_ar || f.name_en,
      name_en: f.name_en || f.name_ar,
      client: f.client || null,
      client_country: f.client_country || null,
      year: f.year ? Number(f.year) : null,
      duration: f.duration || null,
      role: f.role || null,
      team: f.team || null,
      industry: f.industry || null,
      category_id: f.category_id || null,
      category_slug: f.category_slug || null,
      short_description_ar: f.short_description_ar || null,
      short_description_en: f.short_description_en || null,
      challenge_ar: f.challenge_ar || null,
      challenge_en: f.challenge_en || null,
      solution_ar: f.solution_ar || null,
      solution_en: f.solution_en || null,
      results_ar: f.results_ar || null,
      results_en: f.results_en || null,
      services_used: f.services_used.split(",").map((s) => s.trim()).filter(Boolean),
      deliverables: {
        ar: f.deliverables_ar.split("\n").map((s) => s.trim()).filter(Boolean),
        en: f.deliverables_en.split("\n").map((s) => s.trim()).filter(Boolean),
      },
      project_url: f.project_url || null,
      behance_url: f.behance_url || null,
      figma_url: f.figma_url || null,
      og_image_url: f.og_image_url || null,
      hero_image_url: f.hero_image_url || null,
      thumbnail_url: f.thumbnail_url || null,
      gallery: f.gallery,
      brand_colors: f.brand_colors.filter((c) => c.hex),
      typography: f.typography,
      seo_title_ar: f.seo_title_ar || null,
      seo_title_en: f.seo_title_en || null,
      seo_description_ar: f.seo_description_ar || null,
      seo_description_en: f.seo_description_en || null,
      seo_keywords: f.seo_keywords.split(",").map((s) => s.trim()).filter(Boolean),
      featured: f.featured,
      is_pinned: f.is_pinned,
      is_confidential: f.is_confidential,
      is_archived: f.is_archived,
      sort_order: Number(f.sort_order) || 0,
      status: nextStatus,
      layout_blocks: f.blocks,
    };
    if (publishing) payload.published_at = new Date().toISOString();
    else if (nextStatus === "scheduled" && f.published_at) payload.published_at = new Date(f.published_at).toISOString();
    else if (nextStatus === "published" && f.published_at) payload.published_at = new Date(f.published_at).toISOString();
    else if (nextStatus === "draft") payload.published_at = null;

    const q = id
      ? supabase.from("portfolio_projects").update(payload).eq("id", id).select("id").maybeSingle()
      : supabase.from("portfolio_projects").insert(payload).select("id").maybeSingle();
    const { data: saved, error } = await q;
    if (error) {
      setSaving(false);
      if (error.code === "23505" || /duplicate/i.test(error.message)) {
        setErrors({ slug: "الرابط مستخدم بالفعل — اختر رابطًا مختلفًا" });
        toast.error("الرابط مستخدم بالفعل");
      } else toast.error(error.message);
      return;
    }
    const projectId = (saved as any)?.id ?? id;
    // Sync tags junction
    if (projectId) {
      await supabase.from("project_tags").delete().eq("project_id", projectId);
      if (f.tag_ids.length > 0) {
        await supabase.from("project_tags").insert(
          f.tag_ids.map((tag_id) => ({ project_id: projectId, tag_id })),
        );
      }
    }
    setSaving(false);
    toast.success(publishing ? "تم النشر" : draft ? "تم حفظ المسودة" : "تم الحفظ");
    navigate({ to: "/admin/portfolio" });
  };

  if (loading) return <div className="text-sm text-muted-foreground">جاري التحميل…</div>;

  const previewUrl = f.slug && f.category_slug ? `/projects/${f.category_slug}/${f.slug}` : null;
  const errorSummary = Object.values(errors).filter(Boolean) as string[];
  const fieldErr = (k: keyof ProjectForm) =>
    errors[k] ? (
      <p className="flex items-center gap-1 text-xs text-destructive">
        <AlertCircle className="h-3 w-3" />{errors[k]}
      </p>
    ) : null;
  const inputErrCls = (k: keyof ProjectForm) =>
    errors[k] ? "border-destructive focus-visible:ring-destructive/30" : "";

  return (
    <div dir="rtl" className="max-w-5xl space-y-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{id ? "تعديل مشروع" : "مشروع جديد"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            محرر موسّع: تصنيف، بلد، سنة، وسائط، ألوان، طباعة، ووسوم.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {previewUrl && f.status === "published" && (
            <Button asChild variant="ghost" size="sm">
              <a href={previewUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="ms-1 h-4 w-4" /> معاينة
              </a>
            </Button>
          )}
          <Button variant="outline" onClick={() => save({ draft: true })} disabled={saving}>حفظ كمسودة</Button>
          <Button variant="outline" onClick={() => save()} disabled={saving}>{id ? "تحديث" : "حفظ"}</Button>
          <Button onClick={() => save({ publishNow: true })} disabled={saving}>
            {f.status === "published" ? "تحديث النشر" : "نشر الآن"}
          </Button>
        </div>
      </div>

      {errorSummary.length > 0 && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="mb-2 flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4" /> يوجد {errorSummary.length} خطأ في النموذج:
          </div>
          <ul className="list-disc space-y-1 pe-5">
            {errorSummary.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}

      {/* Basic info */}
      <section className="grid gap-4 rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground">المعلومات الأساسية</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>اسم المشروع (عربي) *</Label>
            <Input value={f.name_ar} onChange={(e) => set("name_ar", e.target.value)} className={inputErrCls("name_ar")} />
            {fieldErr("name_ar")}
          </div>
          <div className="grid gap-2">
            <Label>اسم المشروع (إنجليزي)</Label>
            <Input value={f.name_en} onChange={(e) => set("name_en", e.target.value)} dir="ltr" />
          </div>
          <div className="grid gap-2">
            <Label>الرابط (Slug) *</Label>
            <Input value={f.slug}
              onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }}
              placeholder="يُنشأ تلقائيًا" dir="ltr" className={inputErrCls("slug")} />
            {slugTouched && (
              <button type="button" onClick={() => { setSlugTouched(false); set("slug", autoSlug); }}
                className="w-fit text-xs text-primary hover:underline">إعادة التوليد من الاسم</button>
            )}
            {fieldErr("slug")}
          </div>
          <div className="grid gap-2">
            <Label>التصنيف *</Label>
            <select value={f.category_id} onChange={(e) => set("category_id", e.target.value)}
              className={`h-10 rounded-md border border-border/70 bg-background px-3 text-sm ${inputErrCls("category_id")}`}>
              <option value="">— اختر تصنيفًا —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name_ar} · {c.name_en}</option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-muted-foreground">
                لا توجد تصنيفات بعد. أضف من <a href="/admin/categories" className="text-primary underline">إدارة التصنيفات</a>.
              </p>
            )}
            {fieldErr("category_id")}
          </div>
        </div>
      </section>

      {/* Client & meta */}
      <section className="grid gap-4 rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground">تفاصيل العميل والمشروع</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2"><Label>العميل</Label>
            <Input value={f.client} onChange={(e) => set("client", e.target.value)} /></div>
          <div className="grid gap-2"><Label>البلد</Label>
            <Input value={f.client_country} onChange={(e) => set("client_country", e.target.value)}
              placeholder="السعودية / الإمارات / مصر…" /></div>
          <div className="grid gap-2"><Label>القطاع / الصناعة</Label>
            <Input value={f.industry} onChange={(e) => set("industry", e.target.value)} /></div>
          <div className="grid gap-2"><Label>السنة</Label>
            <Input value={f.year} onChange={(e) => set("year", e.target.value.replace(/[^0-9]/g, ""))}
              maxLength={4} placeholder="2025" dir="ltr" className={inputErrCls("year")} />
            {fieldErr("year")}</div>
          <div className="grid gap-2"><Label>المدة</Label>
            <Input value={f.duration} onChange={(e) => set("duration", e.target.value)}
              placeholder="مثل: 6 أسابيع" /></div>
          <div className="grid gap-2"><Label>الدور</Label>
            <Input value={f.role} onChange={(e) => set("role", e.target.value)}
              placeholder="مدير إبداعي / مصمم رئيسي" /></div>
          <div className="grid gap-2 md:col-span-3"><Label>الفريق</Label>
            <Input value={f.team} onChange={(e) => set("team", e.target.value)}
              placeholder="أسماء الفريق أو الشركاء" /></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2"><Label>وصف مختصر (عربي)</Label>
            <Textarea rows={2} value={f.short_description_ar}
              onChange={(e) => set("short_description_ar", e.target.value)} /></div>
          <div className="grid gap-2"><Label>وصف مختصر (إنجليزي)</Label>
            <Textarea rows={2} value={f.short_description_en}
              onChange={(e) => set("short_description_en", e.target.value)} dir="ltr" /></div>
        </div>
        <div className="grid gap-2"><Label>الخدمات المستخدمة (مفصولة بفواصل)</Label>
          <Input value={f.services_used} onChange={(e) => set("services_used", e.target.value)}
            placeholder="هوية بصرية, شعار, دليل استخدام" /></div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2"><Label>رابط المشروع الخارجي</Label>
            <Input value={f.project_url} onChange={(e) => set("project_url", e.target.value)}
              placeholder="https://…" dir="ltr" className={inputErrCls("project_url")} />
            {fieldErr("project_url")}</div>
          <div className="grid gap-2"><Label>Behance</Label>
            <Input value={f.behance_url} onChange={(e) => set("behance_url", e.target.value)}
              placeholder="https://behance.net/…" dir="ltr" className={inputErrCls("behance_url")} />
            {fieldErr("behance_url")}</div>
          <div className="grid gap-2"><Label>Figma</Label>
            <Input value={f.figma_url} onChange={(e) => set("figma_url", e.target.value)}
              placeholder="https://figma.com/…" dir="ltr" className={inputErrCls("figma_url")} />
            {fieldErr("figma_url")}</div>
        </div>
      </section>

      {/* Media: cover, hero, thumbnail */}
      <section className="grid gap-6 rounded-2xl border border-border/70 bg-card p-6">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground">الوسائط الأساسية</h2>
          <p className="mt-1 text-xs text-muted-foreground">حد أقصى {MAX_FILE_MB}MB — JPG/PNG/WEBP/AVIF/SVG.</p>
        </div>
        <MediaSlot
          label="صورة الغلاف (Cover / OG)"
          url={f.og_image_url}
          uploading={uploadingCover}
          err={errors.og_image_url}
          onUpload={(file) => uploadSingle(file, "og_image_url", setUploadingCover, "الغلاف")}
          onClear={() => set("og_image_url", "")}
          onUrl={(v) => set("og_image_url", v)}
        />
        <MediaSlot
          label="الصورة الرئيسية داخل الصفحة (Hero)"
          url={f.hero_image_url}
          uploading={uploadingHero}
          onUpload={(file) => uploadSingle(file, "hero_image_url", setUploadingHero, "صورة Hero")}
          onClear={() => set("hero_image_url", "")}
          onUrl={(v) => set("hero_image_url", v)}
        />
        <MediaSlot
          label="مصغّرة القوائم (Thumbnail)"
          url={f.thumbnail_url}
          uploading={uploadingThumb}
          onUpload={(file) => uploadSingle(file, "thumbnail_url", setUploadingThumb, "المصغّرة")}
          onClear={() => set("thumbnail_url", "")}
          onUrl={(v) => set("thumbnail_url", v)}
        />
      </section>

      {/* Gallery */}
      <section className="grid gap-4 rounded-2xl border border-border/70 bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            معرض الصور ({f.gallery.length}/{MAX_GALLERY})
          </h2>
          <label className="cursor-pointer">
            <Button asChild variant="outline" size="sm" disabled={uploadingGallery || f.gallery.length >= MAX_GALLERY}>
              <span>
                <Upload className="ms-1 h-4 w-4" />
                {uploadingGallery
                  ? (galleryProgress ? `${galleryProgress.done}/${galleryProgress.total}` : "جاري الرفع…")
                  : "إضافة صور"}
              </span>
            </Button>
            <input type="file" accept="image/*" multiple hidden
              disabled={uploadingGallery || f.gallery.length >= MAX_GALLERY}
              onChange={(e) => { onGalleryFiles(e.target.files); e.target.value = ""; }} />
          </label>
        </div>
        {f.gallery.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">
            لم تضف صورًا بعد.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {f.gallery.map((url, i) => (
              <div key={`${url}-${i}`} className="group relative overflow-hidden rounded-lg border border-border/60">
                <img src={url} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveGallery(i, -1)} disabled={i === 0}
                      className="rounded bg-white/90 p-1 text-black hover:bg-white disabled:opacity-40" title="لأعلى">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => moveGallery(i, 1)} disabled={i === f.gallery.length - 1}
                      className="rounded bg-white/90 p-1 text-black hover:bg-white disabled:opacity-40" title="لأسفل">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setAsCover(url)}
                      className="rounded bg-white/90 p-1 text-black hover:bg-white" title="تعيين كغلاف">
                      <Star className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => removeGallery(i)}
                      className="rounded bg-destructive p-1 text-white hover:bg-destructive/90" title="حذف">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <span className="absolute start-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">#{i + 1}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modular page builder */}
      <section className="grid gap-4 rounded-2xl border border-border/70 bg-card p-6">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground">صفحة المشروع — بناء البلوكات</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            رتّب محتوى صفحة المشروع بلوكًا بلوك: عناوين، نصوص، صور، معارض، اقتباسات، ألوان، فيديو، إحصائيات، وأكثر.
          </p>
        </div>
        <ProjectBlocksEditor
          blocks={f.blocks}
          onChange={(next) => set("blocks", next)}
          uploadImage={uploadToPortfolio}
        />
      </section>

      {/* Story */}
      <section className="grid gap-4 rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground">قصة المشروع</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2"><Label>التحدي (عربي)</Label>
            <Textarea rows={4} value={f.challenge_ar} onChange={(e) => set("challenge_ar", e.target.value)} /></div>
          <div className="grid gap-2"><Label>التحدي (إنجليزي)</Label>
            <Textarea rows={4} value={f.challenge_en} onChange={(e) => set("challenge_en", e.target.value)} dir="ltr" /></div>
          <div className="grid gap-2"><Label>الحل (عربي) — كل سطر نقطة</Label>
            <Textarea rows={5} value={f.solution_ar} onChange={(e) => set("solution_ar", e.target.value)} /></div>
          <div className="grid gap-2"><Label>الحل (إنجليزي)</Label>
            <Textarea rows={5} value={f.solution_en} onChange={(e) => set("solution_en", e.target.value)} dir="ltr" /></div>
          <div className="grid gap-2"><Label>النتائج (عربي)</Label>
            <Textarea rows={3} value={f.results_ar} onChange={(e) => set("results_ar", e.target.value)} /></div>
          <div className="grid gap-2"><Label>النتائج (إنجليزي)</Label>
            <Textarea rows={3} value={f.results_en} onChange={(e) => set("results_en", e.target.value)} dir="ltr" /></div>
          <div className="grid gap-2"><Label>المُخرجات (عربي) — كل سطر مخرج</Label>
            <Textarea rows={4} value={f.deliverables_ar} onChange={(e) => set("deliverables_ar", e.target.value)}
              placeholder={"دليل هوية بصرية\nنظام لوني\nقوالب سوشيال ميديا"} /></div>
          <div className="grid gap-2"><Label>Deliverables (English) — one per line</Label>
            <Textarea rows={4} value={f.deliverables_en} onChange={(e) => set("deliverables_en", e.target.value)}
              dir="ltr" /></div>
        </div>
      </section>

      {/* Brand system: colors + typography */}
      <section className="grid gap-5 rounded-2xl border border-border/70 bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Palette className="h-4 w-4" /> نظام العلامة
          </h2>
          <Button size="sm" variant="outline" onClick={addColor}>
            <Plus className="ms-1 h-4 w-4" /> لون جديد
          </Button>
        </div>
        {f.brand_colors.length === 0 ? (
          <p className="text-xs text-muted-foreground">لا ألوان محفوظة. اضغط "لون جديد" لإضافة أول لون.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {f.brand_colors.map((c, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                <input type="color" value={c.hex}
                  onChange={(e) => updateColor(i, { hex: e.target.value })}
                  className="h-10 w-10 cursor-pointer rounded border border-border/60 bg-transparent" />
                <div className="grid flex-1 grid-cols-2 gap-2">
                  <Input value={c.name ?? ""} onChange={(e) => updateColor(i, { name: e.target.value })}
                    placeholder="الاسم" />
                  <Input value={c.hex} onChange={(e) => updateColor(i, { hex: e.target.value })}
                    dir="ltr" placeholder="#000000" />
                </div>
                <Button size="icon" variant="ghost" onClick={() => removeColor(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2"><Label>خط العناوين (عربي)</Label>
            <Input value={f.typography.heading_ar ?? ""}
              onChange={(e) => set("typography", { ...f.typography, heading_ar: e.target.value })}
              placeholder="مثال: Cairo" /></div>
          <div className="grid gap-2"><Label>Heading font (English)</Label>
            <Input value={f.typography.heading_en ?? ""}
              onChange={(e) => set("typography", { ...f.typography, heading_en: e.target.value })}
              dir="ltr" /></div>
          <div className="grid gap-2"><Label>خط المتن (عربي)</Label>
            <Input value={f.typography.body_ar ?? ""}
              onChange={(e) => set("typography", { ...f.typography, body_ar: e.target.value })} /></div>
          <div className="grid gap-2"><Label>Body font (English)</Label>
            <Input value={f.typography.body_en ?? ""}
              onChange={(e) => set("typography", { ...f.typography, body_en: e.target.value })}
              dir="ltr" /></div>
        </div>
      </section>

      {/* Tags */}
      <section className="grid gap-3 rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <TagIcon className="h-4 w-4" /> الوسوم ({f.tag_ids.length})
        </h2>
        {tags.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            لا توجد وسوم. أضف من <a href="/admin/tags" className="text-primary underline">إدارة الوسوم</a>.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => {
              const active = f.tag_ids.includes(t.id);
              return (
                <button key={t.id} type="button" onClick={() => toggleTag(t.id)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/70 bg-background hover:bg-muted"
                  }`}>
                  {t.label_ar || t.label_en}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* SEO */}
      <section className="grid gap-4 rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground">SEO</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>عنوان SEO (عربي) <span className="text-xs text-muted-foreground">— {f.seo_title_ar.length}/60</span></Label>
            <Input value={f.seo_title_ar} onChange={(e) => set("seo_title_ar", e.target.value)}
              maxLength={80} className={inputErrCls("seo_title_ar")} />
            {fieldErr("seo_title_ar")}
          </div>
          <div className="grid gap-2">
            <Label>SEO title (English) <span className="text-xs text-muted-foreground">— {f.seo_title_en.length}/60</span></Label>
            <Input value={f.seo_title_en} onChange={(e) => set("seo_title_en", e.target.value)} maxLength={80} dir="ltr" />
          </div>
          <div className="grid gap-2">
            <Label>وصف SEO (عربي) <span className="text-xs text-muted-foreground">— {f.seo_description_ar.length}/160</span></Label>
            <Textarea rows={2} value={f.seo_description_ar}
              onChange={(e) => set("seo_description_ar", e.target.value)} maxLength={200}
              className={inputErrCls("seo_description_ar")} />
            {fieldErr("seo_description_ar")}
          </div>
          <div className="grid gap-2">
            <Label>SEO description (English) <span className="text-xs text-muted-foreground">— {f.seo_description_en.length}/160</span></Label>
            <Textarea rows={2} value={f.seo_description_en}
              onChange={(e) => set("seo_description_en", e.target.value)} maxLength={200} dir="ltr" />
          </div>
        </div>
        <div className="grid gap-2"><Label>كلمات مفتاحية (مفصولة بفواصل)</Label>
          <Input value={f.seo_keywords} onChange={(e) => set("seo_keywords", e.target.value)}
            placeholder="هوية بصرية, تصميم شعار" /></div>
      </section>

      {/* Publishing */}
      <section className="grid gap-4 rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground">النشر والحالة</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2"><Label>الحالة</Label>
            <select value={f.status} onChange={(e) => set("status", e.target.value as any)}
              className="h-10 rounded-md border border-border/70 bg-background px-3 text-sm">
              <option value="draft">مسودة</option>
              <option value="scheduled">مجدول</option>
              <option value="published">منشور</option>
              <option value="archived">مؤرشف</option>
            </select></div>
          <div className="grid gap-2"><Label>تاريخ النشر</Label>
            <Input type="datetime-local" value={f.published_at}
              onChange={(e) => set("published_at", e.target.value)}
              className={inputErrCls("published_at")} />
            {fieldErr("published_at")}</div>
          <div className="grid gap-2"><Label>ترتيب العرض</Label>
            <Input type="number" value={f.sort_order}
              onChange={(e) => set("sort_order", Number(e.target.value) || 0)} /></div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
            <Switch checked={f.featured} onCheckedChange={(v) => set("featured", v)} />
            <div><div className="text-sm font-medium">مميز</div>
              <div className="text-xs text-muted-foreground">يظهر في قسم "أحدث المشاريع".</div></div>
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
            <Switch checked={f.is_pinned} onCheckedChange={(v) => set("is_pinned", v)} />
            <div><div className="text-sm font-medium">مثبّت في الأعلى</div>
              <div className="text-xs text-muted-foreground">يبقى في أعلى قائمة تصنيفه.</div></div>
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
            <Switch checked={f.is_confidential} onCheckedChange={(v) => set("is_confidential", v)} />
            <div><div className="text-sm font-medium">سرّي (NDA)</div>
              <div className="text-xs text-muted-foreground">يخفي اسم العميل عن الزوار.</div></div>
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
            <Switch checked={f.is_archived} onCheckedChange={(v) => set("is_archived", v)} />
            <div><div className="text-sm font-medium">أرشفة</div>
              <div className="text-xs text-muted-foreground">يخفيه من الواجهة العامة.</div></div>
          </label>
        </div>
      </section>
    </div>
  );
}

function MediaSlot({
  label, url, uploading, err, onUpload, onClear, onUrl,
}: {
  label: string;
  url: string;
  uploading: boolean;
  err?: string;
  onUpload: (file: File) => void;
  onClear: () => void;
  onUrl: (v: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {url ? (
        <div className="relative overflow-hidden rounded-lg border border-border/60">
          <img src={url} alt={label} className="max-h-64 w-full object-cover" loading="lazy" />
          <button type="button" onClick={onClear}
            className="absolute end-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-sm hover:bg-muted/30 ${
          err ? "border-destructive/60 text-destructive" : "border-border/70 text-muted-foreground"
        }`}>
          <Upload className="h-4 w-4" />
          <span>{uploading ? "جاري الرفع…" : "اضغط للرفع"}</span>
          <input type="file" accept="image/*" hidden disabled={uploading}
            onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(file); e.target.value = ""; }} />
        </label>
      )}
      {err && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />{err}
        </p>
      )}
      <Input value={url} onChange={(e) => onUrl(e.target.value)}
        placeholder="أو الصق الرابط يدويًا" dir="ltr" />
    </div>
  );
}
