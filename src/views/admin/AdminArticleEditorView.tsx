import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type {
  ArticleStatus,
  FaqItemRow,
  InsightArticleRow,
  InsightCategoryRow,
} from "@/lib/insights-types";

interface Props {
  articleId?: string; // undefined => new
}

interface FormState {
  slug: string;
  category_id: string;
  status: ArticleStatus;
  published_at: string; // datetime-local string
  featured: boolean;
  title_ar: string;
  title_en: string;
  excerpt_ar: string;
  excerpt_en: string;
  content_ar: string;
  content_en: string;
  seo_title_ar: string;
  seo_title_en: string;
  seo_description_ar: string;
  seo_description_en: string;
  cover_url: string;
  featured_image_url: string;
  author_name: string;
  author_avatar_url: string;
  reading_minutes: number;
  tags: string; // comma
  keywords: string; // comma
  related_slugs: string; // comma
  faq: FaqItemRow[];
}

const emptyForm: FormState = {
  slug: "", category_id: "", status: "draft", published_at: "", featured: false,
  title_ar: "", title_en: "", excerpt_ar: "", excerpt_en: "",
  content_ar: "", content_en: "",
  seo_title_ar: "", seo_title_en: "", seo_description_ar: "", seo_description_en: "",
  cover_url: "", featured_image_url: "",
  author_name: "Youssef Rehab", author_avatar_url: "",
  reading_minutes: 5, tags: "", keywords: "", related_slugs: "",
  faq: [],
};

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

function fromLocalInput(s: string): string | null {
  if (!s) return null;
  return new Date(s).toISOString();
}

export function AdminArticleEditorView({ articleId }: Props) {
  const navigate = useNavigate();
  const isNew = !articleId;
  const [categories, setCategories] = useState<InsightCategoryRow[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!isNew);

  useEffect(() => {
    (async () => {
      const { data: cats } = await supabase.from("insight_categories").select("*").order("sort_order");
      setCategories((cats ?? []) as InsightCategoryRow[]);
      if (!isNew && articleId) {
        const { data, error } = await supabase.from("insight_articles").select("*").eq("id", articleId).maybeSingle();
        if (error) setErr(error.message);
        else if (!data) setErr("المقال غير موجود.");
        else {
          const r = data as unknown as InsightArticleRow;
          setForm({
            slug: r.slug,
            category_id: r.category_id,
            status: r.status,
            published_at: toLocalInput(r.published_at),
            featured: r.featured,
            title_ar: r.title_ar, title_en: r.title_en,
            excerpt_ar: r.excerpt_ar, excerpt_en: r.excerpt_en,
            content_ar: r.content_ar, content_en: r.content_en,
            seo_title_ar: r.seo_title_ar, seo_title_en: r.seo_title_en,
            seo_description_ar: r.seo_description_ar, seo_description_en: r.seo_description_en,
            cover_url: r.cover_url ?? "", featured_image_url: r.featured_image_url ?? "",
            author_name: r.author_name, author_avatar_url: r.author_avatar_url ?? "",
            reading_minutes: r.reading_minutes,
            tags: (r.tags ?? []).join(", "),
            keywords: (r.keywords ?? []).join(", "),
            related_slugs: (r.related_slugs ?? []).join(", "),
            faq: r.faq ?? [],
          });
        }
        setLoading(false);
      } else if (cats && cats.length > 0) {
        setForm((f) => ({ ...f, category_id: (cats[0] as InsightCategoryRow).id }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const autoSlug = useMemo(() => slugify(form.title_ar || form.title_en), [form.title_ar, form.title_en]);
  useEffect(() => {
    if (isNew && !slugTouched && autoSlug) update("slug", autoSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSlug, slugTouched, isNew]);

  const uploadCover = async (file: File) => {
    setUploading(true); setErr(null);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `covers/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("insights-covers").upload(path, file, {
        cacheControl: "31536000", upsert: false, contentType: file.type,
      });
      if (error) throw error;
      // Use the public proxy route (works for private bucket).
      update("cover_url", `/api/public/insights/cover/${path}`);
      setMsg("تم رفع الغلاف.");
    } catch (e: any) {
      setErr(e.message ?? "فشل الرفع.");
    } finally {
      setUploading(false);
    }
  };

  const save = async (opts?: { publishNow?: boolean }) => {
    setSaving(true); setErr(null); setMsg(null);
    try {
      const payload = {
        slug: form.slug || autoSlug,
        category_id: form.category_id,
        status: opts?.publishNow ? "published" : form.status,
        published_at: opts?.publishNow
          ? new Date().toISOString()
          : (form.status === "draft" ? null : fromLocalInput(form.published_at)),
        featured: form.featured,
        title_ar: form.title_ar, title_en: form.title_en,
        excerpt_ar: form.excerpt_ar, excerpt_en: form.excerpt_en,
        content_ar: form.content_ar, content_en: form.content_en,
        seo_title_ar: form.seo_title_ar, seo_title_en: form.seo_title_en,
        seo_description_ar: form.seo_description_ar, seo_description_en: form.seo_description_en,
        cover_url: form.cover_url || null,
        featured_image_url: form.featured_image_url || null,
        author_name: form.author_name || "Youssef Rehab",
        author_avatar_url: form.author_avatar_url || null,
        reading_minutes: Number(form.reading_minutes) || 5,
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        keywords: form.keywords.split(",").map((s) => s.trim()).filter(Boolean),
        related_slugs: form.related_slugs.split(",").map((s) => s.trim()).filter(Boolean),
        faq: form.faq,
      };
      if (!payload.title_ar || !payload.slug || !payload.category_id) {
        throw new Error("العنوان بالعربية، الرابط، والتصنيف حقول مطلوبة.");
      }
      if (payload.status === "scheduled" && !payload.published_at) {
        throw new Error("حدّد تاريخ ووقت النشر للمقال المجدول.");
      }
      if (payload.status === "published" && !payload.published_at) {
        payload.published_at = new Date().toISOString();
      }
      if (isNew) {
        const { data, error } = await supabase.from("insight_articles").insert(payload as any).select("id").single();
        if (error) throw error;
        navigate({ to: "/admin/insights/$id", params: { id: data.id } });
        setMsg("تم إنشاء المقال.");
      } else {
        const { error } = await supabase.from("insight_articles").update(payload as any).eq("id", articleId!);
        if (error) throw error;
        setMsg("تم الحفظ.");
        setForm((f) => ({
          ...f,
          status: payload.status as ArticleStatus,
          published_at: toLocalInput(payload.published_at),
        }));
      }
    } catch (e: any) {
      setErr(e.message ?? "فشل الحفظ.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="py-16 text-center text-muted-foreground">جاري التحميل…</p>;

  return (
    <div className="pb-20">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            onClick={() => navigate({ to: "/admin/insights" })}
            className="text-xs text-muted-foreground hover:text-accent"
          >← عودة للمقالات</button>
          <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">
            {isNew ? "مقال جديد" : "تعديل مقال"}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => save()} disabled={saving}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent disabled:opacity-60"
          >{saving ? "…" : "حفظ"}</button>
          <button
            onClick={() => save({ publishNow: true })} disabled={saving}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
          >نشر الآن</button>
        </div>
      </div>

      {err && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{err}</p>}
      {msg && <p className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">{msg}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-6">
          <Section title="المحتوى">
            <Field label="العنوان (عربي) *">
              <input value={form.title_ar} onChange={(e) => update("title_ar", e.target.value)} className={inpCls} />
            </Field>
            <Field label="العنوان (إنجليزي)">
              <input value={form.title_en} onChange={(e) => update("title_en", e.target.value)} className={inpCls} dir="ltr" />
            </Field>
            <Field label={`الرابط (Slug) * — /${form.category_id ? categories.find(c => c.id === form.category_id)?.slug : "..."}/…`}>
              <input
                value={form.slug} onChange={(e) => { setSlugTouched(true); update("slug", slugify(e.target.value)); }}
                className={inpCls} dir="ltr"
              />
            </Field>
            <Field label="المُلخّص (عربي)">
              <textarea rows={3} value={form.excerpt_ar} onChange={(e) => update("excerpt_ar", e.target.value)} className={inpCls} />
            </Field>
            <Field label="المُلخّص (إنجليزي)">
              <textarea rows={3} value={form.excerpt_en} onChange={(e) => update("excerpt_en", e.target.value)} className={inpCls} dir="ltr" />
            </Field>
            <Field label="المحتوى (عربي)">
              <RichTextEditor
                value={form.content_ar}
                onChange={(html) => update("content_ar", html)}
                dir="rtl"
                placeholder="ابدأ الكتابة… استخدم شريط الأدوات للعناوين والقوائم والصور."
                onImageUpload={uploadInline}
              />
            </Field>
            <Field label="المحتوى (إنجليزي)">
              <RichTextEditor
                value={form.content_en}
                onChange={(html) => update("content_en", html)}
                dir="ltr"
                placeholder="Start writing… use the toolbar for headings, lists, and images."
                onImageUpload={uploadInline}
              />
            </Field>
          </Section>

          <Section title="أسئلة شائعة (FAQ)">
            <div className="space-y-4">
              {form.faq.map((f, i) => (
                <div key={i} className="rounded-xl border border-border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">سؤال {i + 1}</span>
                    <button
                      onClick={() => update("faq", form.faq.filter((_, j) => j !== i))}
                      className="text-xs text-red-500 hover:underline"
                    >حذف</button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input placeholder="السؤال (عربي)" value={f.q_ar} onChange={(e) => update("faq", form.faq.map((x, j) => j === i ? { ...x, q_ar: e.target.value } : x))} className={inpCls} />
                    <input placeholder="Question (EN)" dir="ltr" value={f.q_en} onChange={(e) => update("faq", form.faq.map((x, j) => j === i ? { ...x, q_en: e.target.value } : x))} className={inpCls} />
                    <textarea placeholder="الإجابة (عربي)" rows={2} value={f.a_ar} onChange={(e) => update("faq", form.faq.map((x, j) => j === i ? { ...x, a_ar: e.target.value } : x))} className={inpCls} />
                    <textarea placeholder="Answer (EN)" dir="ltr" rows={2} value={f.a_en} onChange={(e) => update("faq", form.faq.map((x, j) => j === i ? { ...x, a_en: e.target.value } : x))} className={inpCls} />
                  </div>
                </div>
              ))}
              <button
                onClick={() => update("faq", [...form.faq, { q_ar: "", q_en: "", a_ar: "", a_en: "" }])}
                className="rounded-full border border-dashed border-border px-4 py-2 text-xs hover:border-accent hover:text-accent"
              >+ إضافة سؤال</button>
            </div>
          </Section>

          <Section title="SEO">
            <Field label="عنوان SEO (عربي)"><input value={form.seo_title_ar} onChange={(e) => update("seo_title_ar", e.target.value)} className={inpCls} /></Field>
            <Field label="عنوان SEO (إنجليزي)"><input value={form.seo_title_en} onChange={(e) => update("seo_title_en", e.target.value)} className={inpCls} dir="ltr" /></Field>
            <Field label="وصف SEO (عربي)"><textarea rows={2} value={form.seo_description_ar} onChange={(e) => update("seo_description_ar", e.target.value)} className={inpCls} /></Field>
            <Field label="وصف SEO (إنجليزي)"><textarea rows={2} value={form.seo_description_en} onChange={(e) => update("seo_description_en", e.target.value)} className={inpCls} dir="ltr" /></Field>
            <Field label="Keywords (مفصولة بفاصلة)"><input value={form.keywords} onChange={(e) => update("keywords", e.target.value)} className={inpCls} /></Field>
          </Section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Section title="النشر">
            <Field label="الحالة">
              <select value={form.status} onChange={(e) => update("status", e.target.value as ArticleStatus)} className={inpCls}>
                <option value="draft">مسودّة</option>
                <option value="scheduled">مجدولة</option>
                <option value="published">منشورة</option>
              </select>
            </Field>
            <Field label="تاريخ ووقت النشر">
              <input type="datetime-local" value={form.published_at} onChange={(e) => update("published_at", e.target.value)} className={inpCls} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} />
              مقال مميّز (Featured)
            </label>
          </Section>

          <Section title="التصنيف">
            <Field label="التصنيف *">
              <select value={form.category_id} onChange={(e) => update("category_id", e.target.value)} className={inpCls}>
                <option value="">— اختر —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.label_ar} / {c.label_en}</option>)}
              </select>
            </Field>
            <Field label="Tags (مفصولة بفاصلة)">
              <input value={form.tags} onChange={(e) => update("tags", e.target.value)} className={inpCls} />
            </Field>
          </Section>

          <Section title="صورة الغلاف">
            {form.cover_url && (
              <div className="mb-3 overflow-hidden rounded-xl border border-border">
                <img src={form.cover_url} alt="Cover preview" className="h-40 w-full object-cover" />
              </div>
            )}
            <input
              type="file" accept="image/*"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); }}
              disabled={uploading}
              className="w-full text-xs"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">{uploading ? "جاري الرفع…" : "أو الصق رابطًا مباشرًا:"}</p>
            <input
              value={form.cover_url} onChange={(e) => update("cover_url", e.target.value)}
              placeholder="https://…" dir="ltr" className={`${inpCls} mt-1 text-xs`}
            />
          </Section>

          <Section title="المؤلف">
            <Field label="الاسم"><input value={form.author_name} onChange={(e) => update("author_name", e.target.value)} className={inpCls} /></Field>
            <Field label="رابط صورة المؤلف"><input value={form.author_avatar_url} onChange={(e) => update("author_avatar_url", e.target.value)} className={inpCls} dir="ltr" /></Field>
          </Section>

          <Section title="مشاركة اجتماعية (OG / Twitter)">
            <SocialPreview
              titleAr={form.seo_title_ar || form.title_ar}
              titleEn={form.seo_title_en || form.title_en}
              descAr={form.seo_description_ar || form.excerpt_ar}
              descEn={form.seo_description_en || form.excerpt_en}
              cover={form.cover_url}
              slug={form.slug}
              categorySlug={categories.find((c) => c.id === form.category_id)?.slug}
              status={form.status}
            />
          </Section>

          <Section title="متعلّقات">
            <Field label="مدة القراءة (دقيقة)">
              <input type="number" min={1} value={form.reading_minutes} onChange={(e) => update("reading_minutes", Number(e.target.value))} className={inpCls} />
            </Field>
            <Field label="مقالات ذات صلة (روابط slugs مفصولة بفاصلة)">
              <input value={form.related_slugs} onChange={(e) => update("related_slugs", e.target.value)} className={inpCls} dir="ltr" />
            </Field>
          </Section>
        </aside>
      </div>
    </div>
  );
}

const inpCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold text-foreground">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

interface SocialPreviewProps {
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  cover: string;
  slug: string;
  categorySlug?: string;
  status: ArticleStatus;
}

const SITE_ORIGIN = "https://yrstudio.art";

function SocialPreview({ titleAr, titleEn, descAr, descEn, cover, slug, categorySlug, status }: SocialPreviewProps) {
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const title = locale === "ar" ? (titleAr || titleEn) : (titleEn || titleAr);
  const desc = locale === "ar" ? (descAr || descEn) : (descEn || descAr);
  const path = categorySlug && slug
    ? `${locale === "ar" ? "" : "/en"}/insights/${categorySlug}/${slug}`
    : `${locale === "ar" ? "" : "/en"}/insights`;
  const fullUrl = `${SITE_ORIGIN}${path}`;
  const host = "yrstudio.art";
  const canValidate = status === "published" && categorySlug && slug;
  const enc = encodeURIComponent(fullUrl);
  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-lg bg-muted p-1 text-[11px]">
        <button
          type="button"
          onClick={() => setLocale("ar")}
          className={`flex-1 rounded-md px-2 py-1 transition-colors ${locale === "ar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        >عربي</button>
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={`flex-1 rounded-md px-2 py-1 transition-colors ${locale === "en" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        >English</button>
      </div>

      {/* Facebook / OG-style card */}
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        {cover ? (
          <img src={cover} alt="" className="h-32 w-full object-cover" />
        ) : (
          <div className="flex h-32 w-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
            بدون صورة غلاف
          </div>
        )}
        <div className="p-3" dir={locale === "ar" ? "rtl" : "ltr"}>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{host}</div>
          <div className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">
            {title || (locale === "ar" ? "بدون عنوان" : "Untitled")}
          </div>
          <div className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
            {desc || (locale === "ar" ? "بدون وصف" : "No description")}
          </div>
        </div>
      </div>

      {/* Twitter-style card */}
      <div className="flex gap-3 overflow-hidden rounded-xl border border-border bg-background p-2">
        {cover ? (
          <img src={cover} alt="" className="h-16 w-16 flex-shrink-0 rounded-md object-cover" />
        ) : (
          <div className="h-16 w-16 flex-shrink-0 rounded-md bg-muted" />
        )}
        <div className="min-w-0 flex-1" dir={locale === "ar" ? "rtl" : "ltr"}>
          <div className="line-clamp-1 text-[11px] font-medium text-foreground">
            {title || (locale === "ar" ? "بدون عنوان" : "Untitled")}
          </div>
          <div className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">{desc}</div>
          <div className="mt-1 text-[10px] text-muted-foreground">🔗 {host}</div>
        </div>
      </div>

      <p className="text-[10px] leading-relaxed text-muted-foreground">
        اختبر البطاقة بعد النشر عبر الأدوات الرسمية (تفتح في تبويب جديد):
      </p>
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <a
          href={canValidate ? `https://developers.facebook.com/tools/debug/?q=${enc}` : undefined}
          target="_blank" rel="noopener noreferrer"
          aria-disabled={!canValidate}
          className={`rounded-lg border border-border px-2 py-1.5 text-center transition-colors ${canValidate ? "hover:border-accent hover:text-accent" : "pointer-events-none opacity-50"}`}
        >Facebook Debugger</a>
        <a
          href={canValidate ? `https://www.linkedin.com/post-inspector/inspect/${enc}` : undefined}
          target="_blank" rel="noopener noreferrer"
          aria-disabled={!canValidate}
          className={`rounded-lg border border-border px-2 py-1.5 text-center transition-colors ${canValidate ? "hover:border-accent hover:text-accent" : "pointer-events-none opacity-50"}`}
        >LinkedIn Inspector</a>
        <a
          href={canValidate ? `https://search.google.com/test/rich-results?url=${enc}` : undefined}
          target="_blank" rel="noopener noreferrer"
          aria-disabled={!canValidate}
          className={`rounded-lg border border-border px-2 py-1.5 text-center transition-colors ${canValidate ? "hover:border-accent hover:text-accent" : "pointer-events-none opacity-50"}`}
        >Rich Results Test</a>
        <a
          href={canValidate ? `https://validator.schema.org/#url=${enc}` : undefined}
          target="_blank" rel="noopener noreferrer"
          aria-disabled={!canValidate}
          className={`rounded-lg border border-border px-2 py-1.5 text-center transition-colors ${canValidate ? "hover:border-accent hover:text-accent" : "pointer-events-none opacity-50"}`}
        >Schema Validator</a>
      </div>
      {!canValidate && (
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          انشر المقال أولًا لتفعيل روابط أدوات الاختبار.
        </p>
      )}
      {canValidate && (
        <p className="text-[10px] text-muted-foreground" dir="ltr">
          {fullUrl}
        </p>
      )}
    </div>
  );
}
