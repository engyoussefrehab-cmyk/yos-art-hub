import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, X, ArrowUp, ArrowDown, Star, ExternalLink, Trash2 } from "lucide-react";

type ProjectForm = {
  slug: string;
  name_ar: string;
  name_en: string;
  client: string;
  industry: string;
  category_slug: string;
  short_description_ar: string;
  short_description_en: string;
  challenge_ar: string;
  challenge_en: string;
  solution_ar: string;
  solution_en: string;
  results_ar: string;
  results_en: string;
  services_used: string; // comma-separated
  og_image_url: string; // cover
  gallery: string[];
  seo_title_ar: string;
  seo_title_en: string;
  seo_description_ar: string;
  seo_description_en: string;
  seo_keywords: string; // comma
  featured: boolean;
  status: "draft" | "published" | "scheduled";
  published_at: string; // datetime-local
  sort_order: number;
};

const empty: ProjectForm = {
  slug: "", name_ar: "", name_en: "",
  client: "", industry: "", category_slug: "branding",
  short_description_ar: "", short_description_en: "",
  challenge_ar: "", challenge_en: "",
  solution_ar: "", solution_en: "",
  results_ar: "", results_en: "",
  services_used: "",
  og_image_url: "", gallery: [],
  seo_title_ar: "", seo_title_en: "",
  seo_description_ar: "", seo_description_en: "",
  seo_keywords: "",
  featured: false, status: "draft", published_at: "",
  sort_order: 0,
};

const CATEGORIES = [
  { slug: "branding", label: "الهوية البصرية" },
  { slug: "logos", label: "الشعارات" },
  { slug: "profiles", label: "ملفات الشركات" },
  { slug: "social", label: "سوشيال ميديا" },
  { slug: "packaging", label: "التغليف" },
];

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
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.from("portfolio_projects").select("*").eq("id", id).maybeSingle();
      if (error) { toast.error(error.message); setLoading(false); return; }
      if (data) {
        const r = data as any;
        const gallery: string[] = Array.isArray(r.gallery)
          ? r.gallery.map((g: any) => (typeof g === "string" ? g : g?.url)).filter(Boolean)
          : [];
        setF({
          slug: r.slug ?? "",
          name_ar: r.name_ar ?? "", name_en: r.name_en ?? "",
          client: r.client ?? "", industry: r.industry ?? "",
          category_slug: r.category_slug ?? "branding",
          short_description_ar: r.short_description_ar ?? "",
          short_description_en: r.short_description_en ?? "",
          challenge_ar: r.challenge_ar ?? "", challenge_en: r.challenge_en ?? "",
          solution_ar: r.solution_ar ?? "", solution_en: r.solution_en ?? "",
          results_ar: r.results_ar ?? "", results_en: r.results_en ?? "",
          services_used: (r.services_used ?? []).join(", "),
          og_image_url: r.og_image_url ?? "",
          gallery,
          seo_title_ar: r.seo_title_ar ?? "", seo_title_en: r.seo_title_en ?? "",
          seo_description_ar: r.seo_description_ar ?? "", seo_description_en: r.seo_description_en ?? "",
          seo_keywords: (r.seo_keywords ?? []).join(", "),
          featured: !!r.featured,
          status: (r.status ?? "draft") as any,
          published_at: toLocalInput(r.published_at),
          sort_order: r.sort_order ?? 0,
        });
      }
      setLoading(false);
    })();
  }, [id]);

  const set = <K extends keyof ProjectForm>(k: K, v: ProjectForm[K]) => setF((s) => ({ ...s, [k]: v }));

  const autoSlug = useMemo(() => slugify(f.name_en || f.name_ar), [f.name_en, f.name_ar]);
  useEffect(() => {
    if (isNew && !slugTouched && autoSlug) set("slug", autoSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSlug, slugTouched, isNew]);

  const onCoverFile = async (file: File) => {
    setUploadingCover(true);
    try {
      const url = await uploadToPortfolio(file);
      set("og_image_url", url);
      toast.success("تم رفع الغلاف");
    } catch (e: any) { toast.error(e.message ?? "فشل الرفع"); }
    finally { setUploadingCover(false); }
  };

  const onGalleryFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadToPortfolio(file);
        urls.push(url);
      }
      set("gallery", [...f.gallery, ...urls]);
      toast.success(`تم رفع ${urls.length} صورة`);
    } catch (e: any) { toast.error(e.message ?? "فشل الرفع"); }
    finally { setUploadingGallery(false); }
  };

  const moveGallery = (idx: number, dir: -1 | 1) => {
    const arr = [...f.gallery];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    set("gallery", arr);
  };
  const removeGallery = (idx: number) => set("gallery", f.gallery.filter((_, i) => i !== idx));
  const setAsCover = (url: string) => { set("og_image_url", url); toast.success("تم تعيين الغلاف"); };

  const save = async (opts?: { publishNow?: boolean }) => {
    if (!f.name_ar && !f.name_en) return toast.error("اسم المشروع مطلوب");
    const slug = f.slug || autoSlug;
    if (!slug) return toast.error("الرابط (slug) مطلوب");

    setSaving(true);
    const payload: any = {
      slug,
      name_ar: f.name_ar || f.name_en,
      name_en: f.name_en || f.name_ar,
      client: f.client || null,
      industry: f.industry || null,
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
      og_image_url: f.og_image_url || null,
      gallery: f.gallery,
      seo_title_ar: f.seo_title_ar || null,
      seo_title_en: f.seo_title_en || null,
      seo_description_ar: f.seo_description_ar || null,
      seo_description_en: f.seo_description_en || null,
      seo_keywords: f.seo_keywords.split(",").map((s) => s.trim()).filter(Boolean),
      featured: f.featured,
      sort_order: Number(f.sort_order) || 0,
      status: opts?.publishNow ? "published" : f.status,
    };
    if (opts?.publishNow) {
      payload.published_at = new Date().toISOString();
    } else if (f.status === "scheduled" && f.published_at) {
      payload.published_at = new Date(f.published_at).toISOString();
    } else if (f.status === "published" && f.published_at) {
      payload.published_at = new Date(f.published_at).toISOString();
    } else if (f.status === "draft") {
      payload.published_at = null;
    }

    const q = id
      ? supabase.from("portfolio_projects").update(payload).eq("id", id).select("id").maybeSingle()
      : supabase.from("portfolio_projects").insert(payload).select("id").maybeSingle();
    const { data, error } = await q;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(opts?.publishNow ? "تم النشر" : "تم الحفظ");
    navigate({ to: "/admin/portfolio" });
  };

  if (loading) return <div className="text-sm text-muted-foreground">جاري التحميل…</div>;

  const previewUrl = f.slug && f.category_slug ? `/projects/${f.category_slug}/${f.slug}` : null;

  return (
    <div dir="rtl" className="max-w-5xl space-y-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{id ? "تعديل مشروع" : "مشروع جديد"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">أدخل تفاصيل المشروع، ارفع الصور، واختر حالة النشر.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {previewUrl && f.status === "published" && (
            <Button asChild variant="ghost" size="sm">
              <a href={previewUrl} target="_blank" rel="noreferrer"><ExternalLink className="ms-1 h-4 w-4" /> معاينة</a>
            </Button>
          )}
          <Button variant="outline" onClick={() => save()} disabled={saving}>حفظ</Button>
          <Button onClick={() => save({ publishNow: true })} disabled={saving}>
            {f.status === "published" ? "تحديث النشر" : "نشر الآن"}
          </Button>
        </div>
      </div>

      {/* Basic info */}
      <section className="grid gap-4 rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground">المعلومات الأساسية</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2"><Label>اسم المشروع (عربي) *</Label>
            <Input value={f.name_ar} onChange={(e) => set("name_ar", e.target.value)} /></div>
          <div className="grid gap-2"><Label>اسم المشروع (إنجليزي)</Label>
            <Input value={f.name_en} onChange={(e) => set("name_en", e.target.value)} dir="ltr" /></div>
          <div className="grid gap-2"><Label>الرابط (Slug)</Label>
            <Input value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }}
              placeholder="auto من الاسم الإنجليزي" dir="ltr" /></div>
          <div className="grid gap-2"><Label>التصنيف</Label>
            <select value={f.category_slug} onChange={(e) => set("category_slug", e.target.value)}
              className="h-10 rounded-md border border-border/70 bg-background px-3 text-sm">
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select></div>
          <div className="grid gap-2"><Label>العميل</Label>
            <Input value={f.client} onChange={(e) => set("client", e.target.value)} /></div>
          <div className="grid gap-2"><Label>القطاع / الصناعة</Label>
            <Input value={f.industry} onChange={(e) => set("industry", e.target.value)} /></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2"><Label>وصف مختصر (عربي)</Label>
            <Textarea rows={2} value={f.short_description_ar} onChange={(e) => set("short_description_ar", e.target.value)} /></div>
          <div className="grid gap-2"><Label>وصف مختصر (إنجليزي)</Label>
            <Textarea rows={2} value={f.short_description_en} onChange={(e) => set("short_description_en", e.target.value)} dir="ltr" /></div>
        </div>
        <div className="grid gap-2"><Label>الخدمات المستخدمة (مفصولة بفواصل)</Label>
          <Input value={f.services_used} onChange={(e) => set("services_used", e.target.value)}
            placeholder="هوية بصرية, شعار, دليل استخدام" /></div>
      </section>

      {/* Cover */}
      <section className="grid gap-4 rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground">صورة الغلاف</h2>
        {f.og_image_url ? (
          <div className="relative overflow-hidden rounded-lg border border-border/60">
            <img src={f.og_image_url} alt="الغلاف" className="max-h-72 w-full object-cover" />
            <button type="button" onClick={() => set("og_image_url", "")}
              className="absolute end-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 p-8 text-sm text-muted-foreground hover:bg-muted/30">
            <Upload className="h-4 w-4" />
            <span>{uploadingCover ? "جاري الرفع…" : "اضغط لرفع صورة الغلاف"}</span>
            <input type="file" accept="image/*" hidden
              onChange={(e) => { const file = e.target.files?.[0]; if (file) onCoverFile(file); }} />
          </label>
        )}
        <Input value={f.og_image_url} onChange={(e) => set("og_image_url", e.target.value)}
          placeholder="أو الصق رابط الصورة يدويًا" dir="ltr" />
      </section>

      {/* Gallery */}
      <section className="grid gap-4 rounded-2xl border border-border/70 bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">معرض الصور ({f.gallery.length})</h2>
          <label className="cursor-pointer">
            <Button asChild variant="outline" size="sm" disabled={uploadingGallery}>
              <span><Upload className="ms-1 h-4 w-4" /> {uploadingGallery ? "جاري الرفع…" : "إضافة صور"}</span>
            </Button>
            <input type="file" accept="image/*" multiple hidden
              onChange={(e) => onGalleryFiles(e.target.files)} />
          </label>
        </div>
        {f.gallery.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">
            لم تضف صورًا بعد. الصور تظهر بالترتيب داخل صفحة المشروع.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {f.gallery.map((url, i) => (
              <div key={i} className="group relative overflow-hidden rounded-lg border border-border/60">
                <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveGallery(i, -1)} className="rounded bg-white/90 p-1 text-black hover:bg-white" title="لأعلى"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => moveGallery(i, 1)} className="rounded bg-white/90 p-1 text-black hover:bg-white" title="لأسفل"><ArrowDown className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setAsCover(url)} className="rounded bg-white/90 p-1 text-black hover:bg-white" title="تعيين كغلاف"><Star className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => removeGallery(i)} className="rounded bg-destructive p-1 text-white hover:bg-destructive/90" title="حذف"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <span className="absolute start-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">#{i + 1}</span>
              </div>
            ))}
          </div>
        )}
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
            <Textarea rows={5} value={f.solution_ar} onChange={(e) => set("solution_ar", e.target.value)}
              placeholder="• استراتيجية العلامة\n• نظام لوني\n• دليل استخدام" /></div>
          <div className="grid gap-2"><Label>الحل (إنجليزي)</Label>
            <Textarea rows={5} value={f.solution_en} onChange={(e) => set("solution_en", e.target.value)} dir="ltr" /></div>
          <div className="grid gap-2"><Label>النتائج (عربي)</Label>
            <Textarea rows={3} value={f.results_ar} onChange={(e) => set("results_ar", e.target.value)} /></div>
          <div className="grid gap-2"><Label>النتائج (إنجليزي)</Label>
            <Textarea rows={3} value={f.results_en} onChange={(e) => set("results_en", e.target.value)} dir="ltr" /></div>
        </div>
      </section>

      {/* SEO */}
      <section className="grid gap-4 rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground">SEO</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>عنوان SEO (عربي) <span className="text-xs text-muted-foreground">— {f.seo_title_ar.length}/60</span></Label>
            <Input value={f.seo_title_ar} onChange={(e) => set("seo_title_ar", e.target.value)} maxLength={80} />
          </div>
          <div className="grid gap-2">
            <Label>عنوان SEO (إنجليزي) <span className="text-xs text-muted-foreground">— {f.seo_title_en.length}/60</span></Label>
            <Input value={f.seo_title_en} onChange={(e) => set("seo_title_en", e.target.value)} maxLength={80} dir="ltr" />
          </div>
          <div className="grid gap-2">
            <Label>وصف SEO (عربي) <span className="text-xs text-muted-foreground">— {f.seo_description_ar.length}/160</span></Label>
            <Textarea rows={2} value={f.seo_description_ar} onChange={(e) => set("seo_description_ar", e.target.value)} maxLength={200} />
          </div>
          <div className="grid gap-2">
            <Label>وصف SEO (إنجليزي) <span className="text-xs text-muted-foreground">— {f.seo_description_en.length}/160</span></Label>
            <Textarea rows={2} value={f.seo_description_en} onChange={(e) => set("seo_description_en", e.target.value)} maxLength={200} dir="ltr" />
          </div>
        </div>
        <div className="grid gap-2"><Label>كلمات مفتاحية (مفصولة بفواصل)</Label>
          <Input value={f.seo_keywords} onChange={(e) => set("seo_keywords", e.target.value)}
            placeholder="هوية بصرية, تصميم شعار, يوسف رحاب" /></div>
      </section>

      {/* Publishing */}
      <section className="grid gap-4 rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground">النشر</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2"><Label>الحالة</Label>
            <select value={f.status} onChange={(e) => set("status", e.target.value as any)}
              className="h-10 rounded-md border border-border/70 bg-background px-3 text-sm">
              <option value="draft">مسودة</option>
              <option value="scheduled">مجدول</option>
              <option value="published">منشور</option>
            </select></div>
          <div className="grid gap-2"><Label>تاريخ النشر</Label>
            <Input type="datetime-local" value={f.published_at} onChange={(e) => set("published_at", e.target.value)} /></div>
          <div className="grid gap-2"><Label>ترتيب العرض</Label>
            <Input type="number" value={f.sort_order} onChange={(e) => set("sort_order", Number(e.target.value) || 0)} /></div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} />
          مشروع مميز (يظهر في الواجهة الرئيسية)
        </label>
      </section>
    </div>
  );
}
