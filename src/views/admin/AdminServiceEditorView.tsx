import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type S = {
  id?: string;
  slug: string;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  features: string[];
  icon: string | null;
  cta_label_ar: string | null;
  cta_href: string | null;
  og_image_url: string | null;
  featured: boolean;
  status: string;
  sort_order: number;
};

const empty: S = {
  slug: "", title_ar: "", title_en: "",
  description_ar: "", description_en: "",
  features: [], icon: "", cta_label_ar: "", cta_href: "",
  og_image_url: "", featured: false, status: "draft", sort_order: 0,
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);

export function AdminServiceEditorView({ id }: { id?: string }) {
  const navigate = useNavigate();
  const [s, setS] = useState<S>(empty);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [featuresText, setFeaturesText] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
      if (error) toast.error(error.message);
      if (data) {
        const rec = data as any;
        const feats = Array.isArray(rec.features) ? rec.features : [];
        setS({ ...rec, features: feats });
        setFeaturesText(feats.join("\n"));
      }
      setLoading(false);
    })();
  }, [id]);

  const set = <K extends keyof S>(k: K, v: S[K]) => setS((x) => ({ ...x, [k]: v }));

  const save = async (publish?: boolean) => {
    if (!s.title_ar && !s.title_en) return toast.error("عنوان الخدمة مطلوب");
    setSaving(true);
    const features = featuresText.split("\n").map((l) => l.trim()).filter(Boolean);
    const payload: any = {
      ...s,
      slug: s.slug || slugify(s.title_en || s.title_ar),
      features,
      status: publish ? "published" : s.status,
    };
    if (publish) payload.published_at = new Date().toISOString();
    const q = id
      ? supabase.from("services").update(payload).eq("id", id).select().maybeSingle()
      : supabase.from("services").insert(payload).select().maybeSingle();
    const { data, error } = await q;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(publish ? "تم النشر" : "تم الحفظ");
    if (!id && data?.id) navigate({ to: "/admin/services/$id", params: { id: data.id } });
  };

  if (loading) return <div className="text-sm text-muted-foreground">جاري التحميل…</div>;

  return (
    <div dir="rtl" className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{id ? "تعديل خدمة" : "خدمة جديدة"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">عرّف الخدمة، مزاياها، وزر الإجراء.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => save(false)} disabled={saving}>حفظ مسودة</Button>
          <Button onClick={() => save(true)} disabled={saving}>{s.status === "published" ? "تحديث المنشور" : "نشر"}</Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-border/70 bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2"><Label>العنوان (عربي)</Label><Input value={s.title_ar} onChange={(e) => set("title_ar", e.target.value)} /></div>
          <div className="grid gap-2"><Label>العنوان (إنجليزي)</Label><Input value={s.title_en} onChange={(e) => set("title_en", e.target.value)} /></div>
          <div className="grid gap-2"><Label>Slug</Label><Input value={s.slug} onChange={(e) => set("slug", slugify(e.target.value))} /></div>
          <div className="grid gap-2"><Label>أيقونة (اسم Lucide)</Label><Input value={s.icon ?? ""} onChange={(e) => set("icon", e.target.value)} placeholder="Palette / Sparkles / …" /></div>
        </div>
        <div className="grid gap-2"><Label>الوصف (عربي)</Label><Textarea rows={3} value={s.description_ar ?? ""} onChange={(e) => set("description_ar", e.target.value)} /></div>
        <div className="grid gap-2"><Label>الوصف (إنجليزي)</Label><Textarea rows={3} value={s.description_en ?? ""} onChange={(e) => set("description_en", e.target.value)} /></div>
        <div className="grid gap-2"><Label>المزايا (كل ميزة في سطر)</Label><Textarea rows={5} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} placeholder="هوية بصرية كاملة\nدليل استخدام\nعناصر تصميم" /></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2"><Label>نص زر الإجراء</Label><Input value={s.cta_label_ar ?? ""} onChange={(e) => set("cta_label_ar", e.target.value)} /></div>
          <div className="grid gap-2"><Label>رابط زر الإجراء</Label><Input value={s.cta_href ?? ""} onChange={(e) => set("cta_href", e.target.value)} placeholder="/contact" /></div>
          <div className="grid gap-2"><Label>رابط صورة OG</Label><Input value={s.og_image_url ?? ""} onChange={(e) => set("og_image_url", e.target.value)} placeholder="https://…" /></div>
          <div className="grid gap-2"><Label>ترتيب</Label><Input type="number" value={s.sort_order} onChange={(e) => set("sort_order", Number(e.target.value) || 0)} /></div>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.featured} onChange={(e) => set("featured", e.target.checked)} /> مميزة</label>
      </div>
    </div>
  );
}
