import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

type Tag = {
  id: string;
  slug: string;
  label_ar: string;
  label_en: string;
  article_count?: number;
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

function TagsPage() {
  const [rows, setRows] = useState<Tag[] | null>(null);
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState({ slug: "", label_ar: "", label_en: "" });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [tags, articleTags, projectTags] = await Promise.all([
      supabase.from("tags").select("*").order("label_ar"),
      supabase.from("article_tags").select("tag_id"),
      supabase.from("project_tags").select("tag_id"),
    ]);
    const aCount = new Map<string, number>();
    const pCount = new Map<string, number>();
    (articleTags.data ?? []).forEach((r: any) => aCount.set(r.tag_id, (aCount.get(r.tag_id) ?? 0) + 1));
    (projectTags.data ?? []).forEach((r: any) => pCount.set(r.tag_id, (pCount.get(r.tag_id) ?? 0) + 1));
    setRows(
      ((tags.data ?? []) as Tag[]).map((t) => ({
        ...t,
        article_count: aCount.get(t.id) ?? 0,
        project_count: pCount.get(t.id) ?? 0,
      })),
    );
  };
  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!draft.label_ar && !draft.label_en) return toast.error("أدخل اسم الوسم");
    setBusy(true);
    const slug = draft.slug || slugify(draft.label_en || draft.label_ar);
    const { error } = await supabase.from("tags").insert({
      slug,
      label_ar: draft.label_ar || draft.label_en,
      label_en: draft.label_en || draft.label_ar,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("تمت الإضافة");
    setDraft({ slug: "", label_ar: "", label_en: "" });
    load();
  };

  const update = async (t: Tag) => {
    const { error } = await supabase
      .from("tags")
      .update({ slug: t.slug, label_ar: t.label_ar, label_en: t.label_en })
      .eq("id", t.id);
    if (error) toast.error(error.message);
    else toast.success("تم الحفظ");
  };

  const del = async (t: Tag) => {
    const used = (t.article_count ?? 0) + (t.project_count ?? 0);
    if (used > 0)
      return toast.error(`لا يمكن الحذف: مستخدم في ${used} محتوى.`);
    if (!confirm(`حذف الوسم "${t.label_ar || t.label_en}"؟`)) return;
    const { error } = await supabase.from("tags").delete().eq("id", t.id);
    if (error) toast.error(error.message);
    else {
      toast.success("تم الحذف");
      load();
    }
  };

  const filtered = (rows ?? []).filter(
    (r) => !q || `${r.label_ar} ${r.label_en} ${r.slug}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">الوسوم</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          مكتبة وسوم مشتركة بين المقالات والمشاريع.
        </p>
      </div>

      <section className="rounded-2xl border border-border/70 bg-card p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Plus className="h-4 w-4" /> إضافة وسم جديد
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="grid gap-1.5">
            <Label className="text-xs">بالعربية</Label>
            <Input value={draft.label_ar} onChange={(e) => setDraft({ ...draft, label_ar: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">English</Label>
            <Input value={draft.label_en} onChange={(e) => setDraft({ ...draft, label_en: e.target.value })} />
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
              {busy ? "جاري…" : "إضافة"}
            </Button>
          </div>
        </div>
      </section>

      <Input placeholder="بحث في الوسوم…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />

      {rows === null ? (
        <div className="text-sm text-muted-foreground">جاري التحميل…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
          لا توجد وسوم.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="p-3 text-right">بالعربية</th>
                <th className="p-3 text-right">English</th>
                <th className="p-3 text-right">Slug</th>
                <th className="p-3 text-right">الاستخدام</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <TagRow key={t.id} tag={t} onSave={update} onDelete={del} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TagRow({
  tag,
  onSave,
  onDelete,
}: {
  tag: Tag;
  onSave: (t: Tag) => void;
  onDelete: (t: Tag) => void;
}) {
  const [t, setT] = useState(tag);
  const dirty = t.slug !== tag.slug || t.label_ar !== tag.label_ar || t.label_en !== tag.label_en;
  return (
    <tr className="border-t border-border/60 hover:bg-muted/20">
      <td className="p-2">
        <Input value={t.label_ar} onChange={(e) => setT({ ...t, label_ar: e.target.value })} />
      </td>
      <td className="p-2">
        <Input value={t.label_en} onChange={(e) => setT({ ...t, label_en: e.target.value })} />
      </td>
      <td className="p-2">
        <Input value={t.slug} onChange={(e) => setT({ ...t, slug: e.target.value })} />
      </td>
      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
        {tag.article_count} مقال · {tag.project_count} مشروع
      </td>
      <td className="p-2">
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" disabled={!dirty} onClick={() => onSave(t)}>
            <Save className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onDelete(tag)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export const Route = createFileRoute("/admin/tags")({
  component: TagsPage,
});
