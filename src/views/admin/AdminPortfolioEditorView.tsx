import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Project = {
  id?: string;
  slug: string;
  name_ar: string;
  name_en: string;
  client: string | null;
  industry: string | null;
  category_slug: string | null;
  short_description_ar: string | null;
  short_description_en: string | null;
  challenge_ar: string | null;
  solution_ar: string | null;
  results_ar: string | null;
  og_image_url: string | null;
  featured: boolean;
  status: string;
  sort_order: number;
};

const empty: Project = {
  slug: "",
  name_ar: "",
  name_en: "",
  client: "",
  industry: "",
  category_slug: "",
  short_description_ar: "",
  short_description_en: "",
  challenge_ar: "",
  solution_ar: "",
  results_ar: "",
  og_image_url: "",
  featured: false,
  status: "draft",
  sort_order: 0,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);
}

export function AdminPortfolioEditorView({ id }: { id?: string }) {
  const navigate = useNavigate();
  const [p, setP] = useState<Project>(empty);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.from("portfolio_projects").select("*").eq("id", id).maybeSingle();
      if (error) toast.error(error.message);
      if (data) setP(data as any);
      setLoading(false);
    })();
  }, [id]);

  const set = <K extends keyof Project>(k: K, v: Project[K]) => setP((s) => ({ ...s, [k]: v }));

  const save = async (publish?: boolean) => {
    if (!p.name_ar && !p.name_en) return toast.error("اسم المشروع مطلوب");
    if (!p.slug) set("slug", slugify(p.name_en || p.name_ar));
    setSaving(true);
    const payload: any = {
      ...p,
      slug: p.slug || slugify(p.name_en || p.name_ar),
      status: publish ? "published" : p.status,
      published_at: publish ? new Date().toISOString() : undefined,
    };
    if (payload.published_at === undefined) delete payload.published_at;
    const q = id
      ? supabase.from("portfolio_projects").update(payload).eq("id", id).select().maybeSingle()
      : supabase.from("portfolio_projects").insert(payload).select().maybeSingle();
    const { data, error } = await q;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(publish ? "تم النشر" : "تم الحفظ");
    if (!id && data?.id) navigate({ to: "/admin/portfolio/$id", params: { id: data.id } });
  };

  if (loading) return <div className="text-sm text-muted-foreground">جاري التحميل…</div>;

  return (
    <div dir="rtl" className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{id ? "تعديل مشروع" : "مشروع جديد"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">أدخل تفاصيل المشروع ثم احفظ كمسودة أو انشره مباشرة.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => save(false)} disabled={saving}>حفظ مسودة</Button>
          <Button onClick={() => save(true)} disabled={saving}>{p.status === "published" ? "تحديث المنشور" : "نشر"}</Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-border/70 bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2"><Label>الاسم (عربي)</Label><Input value={p.name_ar} onChange={(e) => set("name_ar", e.target.value)} /></div>
          <div className="grid gap-2"><Label>الاسم (إنجليزي)</Label><Input value={p.name_en} onChange={(e) => set("name_en", e.target.value)} /></div>
          <div className="grid gap-2"><Label>Slug</Label><Input value={p.slug} onChange={(e) => set("slug", slugify(e.target.value))} placeholder="auto من الاسم الإنجليزي" /></div>
          <div className="grid gap-2"><Label>التصنيف (branding, packaging, …)</Label><Input value={p.category_slug ?? ""} onChange={(e) => set("category_slug", e.target.value)} /></div>
          <div className="grid gap-2"><Label>العميل</Label><Input value={p.client ?? ""} onChange={(e) => set("client", e.target.value)} /></div>
          <div className="grid gap-2"><Label>القطاع</Label><Input value={p.industry ?? ""} onChange={(e) => set("industry", e.target.value)} /></div>
        </div>
        <div className="grid gap-2"><Label>وصف مختصر (عربي)</Label><Textarea rows={2} value={p.short_description_ar ?? ""} onChange={(e) => set("short_description_ar", e.target.value)} /></div>
        <div className="grid gap-2"><Label>وصف مختصر (إنجليزي)</Label><Textarea rows={2} value={p.short_description_en ?? ""} onChange={(e) => set("short_description_en", e.target.value)} /></div>
        <div className="grid gap-2"><Label>التحدي</Label><Textarea rows={3} value={p.challenge_ar ?? ""} onChange={(e) => set("challenge_ar", e.target.value)} /></div>
        <div className="grid gap-2"><Label>الحل</Label><Textarea rows={3} value={p.solution_ar ?? ""} onChange={(e) => set("solution_ar", e.target.value)} /></div>
        <div className="grid gap-2"><Label>النتائج</Label><Textarea rows={3} value={p.results_ar ?? ""} onChange={(e) => set("results_ar", e.target.value)} /></div>
        <div className="grid gap-2"><Label>رابط صورة الغلاف / OG</Label><Input value={p.og_image_url ?? ""} onChange={(e) => set("og_image_url", e.target.value)} placeholder="https://…" /></div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.featured} onChange={(e) => set("featured", e.target.checked)} /> مميز</label>
          <div className="flex items-center gap-2 text-sm"><Label className="mb-0">ترتيب</Label><Input type="number" value={p.sort_order} onChange={(e) => set("sort_order", Number(e.target.value) || 0)} className="w-24" /></div>
          <div className="text-xs text-muted-foreground">الحالة: {p.status === "published" ? "منشور" : "مسودة"}</div>
        </div>
      </div>
    </div>
  );
}
