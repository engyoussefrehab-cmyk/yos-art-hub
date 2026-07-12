import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Page = {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  hero: any;
  blocks: any;
  seo_title_ar: string | null;
  seo_title_en: string | null;
  seo_description_ar: string | null;
  seo_description_en: string | null;
  seo_keywords: string[] | null;
  og_image_url: string | null;
  canonical_url: string | null;
  robots: string | null;
  status: string;
  published_at: string | null;
  updated_at: string;
};

const emptyPage = (): Partial<Page> => ({
  slug: "",
  title_ar: "",
  title_en: "",
  hero: { heading_ar: "", heading_en: "", subheading_ar: "", subheading_en: "", cta_label_ar: "", cta_label_en: "", cta_href: "" },
  blocks: [],
  seo_title_ar: "",
  seo_title_en: "",
  seo_description_ar: "",
  seo_description_en: "",
  seo_keywords: [],
  og_image_url: "",
  canonical_url: "",
  robots: "index,follow",
  status: "draft",
});

function PagesRoute() {
  const search = useSearch({ from: "/admin/pages" });
  const editId = (search as any).edit as string | undefined;
  return editId ? <PageEditor id={editId} /> : <PagesList />;
}

function PagesList() {
  const [rows, setRows] = useState<Page[] | null>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Page[]);
  };
  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    const slug = prompt("Slug للصفحة الجديدة (مثال: about)");
    if (!slug) return;
    const { data, error } = await supabase
      .from("pages")
      .insert({
        slug,
        title_ar: slug,
        title_en: slug,
        hero: {},
        blocks: [],
        status: "draft",
      })
      .select("id")
      .maybeSingle();
    if (error) return toast.error(error.message);
    if (data) navigate({ to: "/admin/pages", search: { edit: data.id } });
  };

  const del = async (p: Page) => {
    if (!confirm(`حذف صفحة "${p.title_ar || p.slug}"؟`)) return;
    const { error } = await supabase.from("pages").delete().eq("id", p.id);
    if (error) toast.error(error.message);
    else load();
  };

  const filtered = (rows ?? []).filter(
    (r) => !q || `${r.title_ar} ${r.title_en} ${r.slug}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">صفحات الموقع</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إدارة محتوى الصفحات الثابتة، عناوين SEO، وصور المشاركة.
          </p>
        </div>
        <Button onClick={create}>
          <Plus className="ms-1 h-4 w-4" /> صفحة جديدة
        </Button>
      </div>

      <Input placeholder="بحث…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />

      {rows === null ? (
        <div className="text-sm text-muted-foreground">جاري التحميل…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
          لا توجد صفحات بعد. أنشئ صفحة جديدة للبدء.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="p-3 text-right">الصفحة</th>
                <th className="p-3 text-right">Slug</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">آخر تحديث</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border/60 hover:bg-muted/30">
                  <td className="p-3 font-medium">{p.title_ar || p.title_en || p.slug}</td>
                  <td className="p-3 text-muted-foreground">/{p.slug}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        p.status === "published" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.status === "published" ? "منشور" : "مسودة"}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {new Date(p.updated_at).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/admin/pages" search={{ edit: p.id }}>
                          تحرير
                        </Link>
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => del(p)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PageEditor({ id }: { id: string }) {
  const [p, setP] = useState<Partial<Page> | null>(null);
  const [saving, setSaving] = useState(false);
  const [keywordsText, setKeywordsText] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("pages").select("*").eq("id", id).maybeSingle();
      if (error) toast.error(error.message);
      if (data) {
        const merged = { ...emptyPage(), ...(data as any), hero: (data as any).hero ?? {} };
        setP(merged);
        setKeywordsText(((data as any).seo_keywords ?? []).join(", "));
      }
    })();
  }, [id]);

  const hero = useMemo(() => (p?.hero ?? {}) as Record<string, string>, [p]);
  const setField = <K extends keyof Page>(k: K, v: any) => setP((x) => ({ ...(x ?? {}), [k]: v }));
  const setHero = (k: string, v: string) => setP((x) => ({ ...(x ?? {}), hero: { ...((x?.hero as any) ?? {}), [k]: v } }));

  const save = async () => {
    if (!p) return;
    setSaving(true);
    const payload = {
      slug: p.slug,
      title_ar: p.title_ar,
      title_en: p.title_en,
      hero: p.hero ?? {},
      blocks: p.blocks ?? [],
      seo_title_ar: p.seo_title_ar || null,
      seo_title_en: p.seo_title_en || null,
      seo_description_ar: p.seo_description_ar || null,
      seo_description_en: p.seo_description_en || null,
      seo_keywords: keywordsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      og_image_url: p.og_image_url || null,
      canonical_url: p.canonical_url || null,
      robots: p.robots || null,
      status: p.status,
      published_at:
        p.status === "published" && !p.published_at ? new Date().toISOString() : p.published_at,
    };
    const { error } = await supabase.from("pages").update(payload).eq("id", id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("تم الحفظ");
  };

  if (!p)
    return <div className="text-sm text-muted-foreground" dir="rtl">جاري التحميل…</div>;

  return (
    <div dir="rtl" className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild size="icon" variant="ghost">
            <Link to="/admin/pages">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {p.title_ar || p.title_en || p.slug}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">/{p.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={p.status}
            onChange={(e) => setField("status", e.target.value)}
            className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
          >
            <option value="draft">مسودة</option>
            <option value="published">منشور</option>
          </select>
          <Button onClick={save} disabled={saving}>
            <Save className="ms-1 h-4 w-4" />
            {saving ? "جاري الحفظ…" : "حفظ"}
          </Button>
        </div>
      </div>

      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="font-semibold">أساسيات الصفحة</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>العنوان (عربي)</Label>
            <Input value={p.title_ar ?? ""} onChange={(e) => setField("title_ar", e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>العنوان (English)</Label>
            <Input value={p.title_en ?? ""} onChange={(e) => setField("title_en", e.target.value)} />
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label>Slug</Label>
            <Input value={p.slug ?? ""} onChange={(e) => setField("slug", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="font-semibold">قسم Hero</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Heading (عربي)</Label>
            <Input value={hero.heading_ar ?? ""} onChange={(e) => setHero("heading_ar", e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Heading (English)</Label>
            <Input value={hero.heading_en ?? ""} onChange={(e) => setHero("heading_en", e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Subheading (عربي)</Label>
            <Textarea rows={2} value={hero.subheading_ar ?? ""} onChange={(e) => setHero("subheading_ar", e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Subheading (English)</Label>
            <Textarea rows={2} value={hero.subheading_en ?? ""} onChange={(e) => setHero("subheading_en", e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>CTA Label (عربي)</Label>
            <Input value={hero.cta_label_ar ?? ""} onChange={(e) => setHero("cta_label_ar", e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>CTA Label (English)</Label>
            <Input value={hero.cta_label_en ?? ""} onChange={(e) => setHero("cta_label_en", e.target.value)} />
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label>CTA Link</Label>
            <Input value={hero.cta_href ?? ""} onChange={(e) => setHero("cta_href", e.target.value)} placeholder="/contact" />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="font-semibold">SEO والمشاركة</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>SEO Title (عربي)</Label>
            <Input value={p.seo_title_ar ?? ""} onChange={(e) => setField("seo_title_ar", e.target.value)} />
            <span className="text-[10px] text-muted-foreground">
              {(p.seo_title_ar ?? "").length}/60
            </span>
          </div>
          <div className="grid gap-1.5">
            <Label>SEO Title (English)</Label>
            <Input value={p.seo_title_en ?? ""} onChange={(e) => setField("seo_title_en", e.target.value)} />
            <span className="text-[10px] text-muted-foreground">
              {(p.seo_title_en ?? "").length}/60
            </span>
          </div>
          <div className="grid gap-1.5">
            <Label>Meta Description (عربي)</Label>
            <Textarea rows={3} value={p.seo_description_ar ?? ""} onChange={(e) => setField("seo_description_ar", e.target.value)} />
            <span className="text-[10px] text-muted-foreground">
              {(p.seo_description_ar ?? "").length}/160
            </span>
          </div>
          <div className="grid gap-1.5">
            <Label>Meta Description (English)</Label>
            <Textarea rows={3} value={p.seo_description_en ?? ""} onChange={(e) => setField("seo_description_en", e.target.value)} />
            <span className="text-[10px] text-muted-foreground">
              {(p.seo_description_en ?? "").length}/160
            </span>
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label>الكلمات المفتاحية (مفصولة بفواصل)</Label>
            <Input value={keywordsText} onChange={(e) => setKeywordsText(e.target.value)} placeholder="تصميم هوية, براندينج, …" />
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label>صورة المشاركة (OG Image URL)</Label>
            <Input value={p.og_image_url ?? ""} onChange={(e) => setField("og_image_url", e.target.value)} placeholder="https://…" />
          </div>
          <div className="grid gap-1.5">
            <Label>Canonical URL</Label>
            <Input value={p.canonical_url ?? ""} onChange={(e) => setField("canonical_url", e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Robots</Label>
            <Input value={p.robots ?? ""} onChange={(e) => setField("robots", e.target.value)} placeholder="index,follow" />
          </div>
        </div>
      </section>
    </div>
  );
}

export const Route = createFileRoute("/admin/pages")({
  validateSearch: (search: Record<string, unknown>) => ({
    edit: typeof search.edit === "string" ? search.edit : undefined,
  }),
  component: PagesRoute,
});
