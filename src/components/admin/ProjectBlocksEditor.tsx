import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowUp, ArrowDown, Trash2, Plus, Upload, X, Copy, ChevronDown, ChevronUp,
  Type, Heading as HeadingIcon, Image as ImageIcon, Images, Quote,
  Palette, PlayCircle, BarChart3, MessageSquare, Minus, Columns2, GripVertical,
  SplitSquareHorizontal, Eye, EyeOff, Star, Link as LinkIcon, Layout, ImageDown,
  Info, PackageCheck, TypeOutline, Code2, ArrowRight,
} from "lucide-react";
import {
  BLOCK_LABELS,
  newBlock,
  type BlockType,
  type ProjectBlock,
} from "@/lib/project-blocks";
import { BLOCK_TEMPLATES, buildTemplate, type TemplateId } from "@/lib/project-block-templates";


const ICONS: Record<BlockType, React.ComponentType<{ className?: string }>> = {
  hero: Layout,
  cover: ImageDown,
  approach: Star,
  meta: Info,
  deliverables: PackageCheck,
  typography: TypeOutline,
  links: LinkIcon,
  testimonial: Quote,
  embed: Code2,
  "next-project": ArrowRight,
  heading: HeadingIcon,
  text: Type,
  image: ImageIcon,
  "two-col-image": Columns2,
  gallery: Images,
  quote: Quote,
  palette: Palette,
  video: PlayCircle,
  stats: BarChart3,
  callout: MessageSquare,
  spacer: Minus,
  "before-after": SplitSquareHorizontal,
};

const ALL_TYPES: BlockType[] = [
  "hero", "cover", "approach", "meta", "deliverables", "typography", "links",
  "heading", "text", "image", "two-col-image", "gallery", "before-after",
  "quote", "palette", "video", "embed", "stats", "testimonial", "callout",
  "spacer", "next-project",
];

export function ProjectBlocksEditor({
  blocks,
  onChange,
  uploadImage,
}: {
  blocks: ProjectBlock[];
  onChange: (next: ProjectBlock[]) => void;
  uploadImage: (file: File) => Promise<string>;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= blocks.length || to >= blocks.length) return;
    const arr = [...blocks];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onChange(arr);
  };
  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); setOverId(null); return; }
    const from = blocks.findIndex((b) => b.id === dragId);
    const to = blocks.findIndex((b) => b.id === targetId);
    reorder(from, to);
    setDragId(null);
    setOverId(null);
  };

  const update = (id: string, patch: Partial<ProjectBlock>) =>
    onChange(blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as ProjectBlock) : b)));
  const remove = (id: string) => onChange(blocks.filter((b) => b.id !== id));
  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= blocks.length) return;
    const arr = [...blocks];
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    onChange(arr);
  };
  const duplicate = (idx: number) => {
    const src = blocks[idx];
    const copy = { ...src, id: crypto.randomUUID() } as ProjectBlock;
    const arr = [...blocks];
    arr.splice(idx + 1, 0, copy);
    onChange(arr);
  };
  const add = (type: BlockType) => {
    const b = newBlock(type);
    onChange([...blocks, b]);
    setOpen((s) => ({ ...s, [b.id]: true }));
  };
  const insertTemplate = (id: TemplateId) => {
    const tpl = buildTemplate(id);
    onChange([...blocks, ...tpl]);
    setOpen((s) => {
      const next = { ...s };
      for (const b of tpl) next[b.id] = false;
      return next;
    });
  };


  return (
    <div className="grid gap-4">
      {blocks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">
          لم تُضف أي بلوكات بعد. اختر نوع البلوك من الأسفل لبدء بناء صفحة المشروع.
        </div>
      ) : (
        <ol className="grid gap-3">
          {blocks.map((b, i) => {
            const Icon = ICONS[b.type];
            const isOpen = open[b.id] ?? false;
            const isHidden = b.enabled === false;
            return (
              <li
                key={b.id}
                onDragOver={(e) => { e.preventDefault(); if (dragId && dragId !== b.id) setOverId(b.id); }}
                onDragLeave={() => { if (overId === b.id) setOverId(null); }}
                onDrop={(e) => { e.preventDefault(); onDrop(b.id); }}
                className={`rounded-xl border bg-background transition-colors ${
                  overId === b.id ? "border-accent ring-2 ring-accent/30" : "border-border/70"
                } ${dragId === b.id ? "opacity-50" : ""} ${isHidden ? "opacity-60" : ""}`}
              >
                <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => { setDragId(b.id); e.dataTransfer.effectAllowed = "move"; }}
                    onDragEnd={() => { setDragId(null); setOverId(null); }}
                    title="اسحب لإعادة الترتيب"
                    className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen((s) => ({ ...s, [b.id]: !isOpen }))}
                    className="flex flex-1 items-center gap-2 text-start text-sm font-medium"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">#{i + 1}</span>
                    <span className={isHidden ? "line-through" : ""}>{BLOCK_LABELS[b.type].ar}</span>
                    {isHidden && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        مخفي
                      </span>
                    )}
                    <span className="ms-auto text-muted-foreground">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  </button>
                  <div className="flex gap-1">
                    <IconBtn
                      title={isHidden ? "إظهار البلوك" : "إخفاء البلوك"}
                      onClick={() => update(b.id, { enabled: isHidden ? true : false } as any)}
                    >
                      {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </IconBtn>
                    <IconBtn title="لأعلى" onClick={() => move(i, -1)} disabled={i === 0}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn title="لأسفل" onClick={() => move(i, 1)} disabled={i === blocks.length - 1}>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn title="نسخ" onClick={() => duplicate(i)}>
                      <Copy className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn title="حذف" onClick={() => remove(b.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </IconBtn>
                  </div>
                </div>
                {isOpen && (
                  <div className="p-4">
                    <BlockEditor block={b} onChange={(patch) => update(b.id, patch)} uploadImage={uploadImage} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
      <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4">
        <div className="mb-2 text-xs font-semibold text-muted-foreground">قوالب جاهزة:</div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {BLOCK_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => insertTemplate(tpl.id)}
              className="group rounded-lg border border-border/60 bg-background p-3 text-start transition-colors hover:border-accent/60 hover:bg-accent/5"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Plus className="h-3.5 w-3.5 text-accent" />
                {tpl.label_ar}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{tpl.desc_ar}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4">
        <div className="mb-2 text-xs font-semibold text-muted-foreground">إضافة بلوك:</div>
        <div className="flex flex-wrap gap-2">
          {ALL_TYPES.map((t) => {
            const Icon = ICONS[t];
            return (
              <Button key={t} type="button" size="sm" variant="outline" onClick={() => add(t)}>
                <Icon className="ms-1 h-4 w-4" /> {BLOCK_LABELS[t].ar}
              </Button>
            );
          })}
        </div>
      </div>

    </div>
  );
}

function IconBtn({
  children, onClick, disabled, title,
}: { children: React.ReactNode; onClick: () => void; disabled?: boolean; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="rounded-md border border-border/60 bg-background p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function BlockEditor({
  block: b,
  onChange,
  uploadImage,
}: {
  block: ProjectBlock;
  onChange: (patch: Partial<ProjectBlock>) => void;
  uploadImage: (file: File) => Promise<string>;
}) {
  switch (b.type) {
    case "heading":
      return (
        <div className="grid gap-3 md:grid-cols-2">
          <FieldText label="العنوان (عربي)" value={b.text_ar} onChange={(v) => onChange({ text_ar: v } as any)} />
          <FieldText label="Heading (English)" value={b.text_en} onChange={(v) => onChange({ text_en: v } as any)} dir="ltr" />
          <FieldSelect
            label="المستوى"
            value={String(b.level ?? 2)}
            onChange={(v) => onChange({ level: (Number(v) as 2 | 3) } as any)}
            options={[["2", "H2 — كبير"], ["3", "H3 — متوسط"]]}
          />
          <FieldSelect
            label="المحاذاة"
            value={b.align ?? "start"}
            onChange={(v) => onChange({ align: v as any } as any)}
            options={[["start", "بداية السطر"], ["center", "منتصف"]]}
          />
        </div>
      );
    case "text":
      return (
        <div className="grid gap-3 md:grid-cols-2">
          <FieldTextarea label="النص (عربي)" value={b.content_ar} onChange={(v) => onChange({ content_ar: v } as any)} rows={5} />
          <FieldTextarea label="Text (English)" value={b.content_en} onChange={(v) => onChange({ content_en: v } as any)} rows={5} dir="ltr" />
          <FieldSelect
            label="المحاذاة"
            value={b.align ?? "start"}
            onChange={(v) => onChange({ align: v as any } as any)}
            options={[["start", "بداية"], ["center", "منتصف"]]}
          />
        </div>
      );
    case "image":
      return (
        <div className="grid gap-3">
          <ImageField
            label="رابط الصورة"
            url={b.url}
            uploadImage={uploadImage}
            onChange={(v) => onChange({ url: v } as any)}
          />
          <div className="grid gap-3 md:grid-cols-3">
            <FieldSelect
              label="العرض"
              value={b.width ?? "wide"}
              onChange={(v) => onChange({ width: v as any } as any)}
              options={[["full", "شاشة كاملة"], ["wide", "عريض"], ["narrow", "ضيق"]]}
            />
            <FieldText label="تسمية (عربي)" value={b.caption_ar} onChange={(v) => onChange({ caption_ar: v } as any)} />
            <FieldText label="Caption (English)" value={b.caption_en} onChange={(v) => onChange({ caption_en: v } as any)} dir="ltr" />
          </div>
        </div>
      );
    case "two-col-image":
      return (
        <div className="grid gap-3 md:grid-cols-2">
          <ImageField label="الصورة اليمنى" url={b.url_left} uploadImage={uploadImage} onChange={(v) => onChange({ url_left: v } as any)} />
          <ImageField label="الصورة اليسرى" url={b.url_right} uploadImage={uploadImage} onChange={(v) => onChange({ url_right: v } as any)} />
        </div>
      );
    case "gallery": {
      const urls = b.urls ?? [];
      const remove = (i: number) => onChange({ urls: urls.filter((_, idx) => idx !== i) } as any);
      const upload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const newUrls: string[] = [];
        for (const f of Array.from(files)) {
          try { newUrls.push(await uploadImage(f)); } catch {}
        }
        onChange({ urls: [...urls, ...newUrls] } as any);
      };
      return (
        <div className="grid gap-3">
          <FieldSelect
            label="عدد الأعمدة"
            value={String(b.columns ?? 3)}
            onChange={(v) => onChange({ columns: Number(v) as any } as any)}
            options={[["2", "عمودان"], ["3", "3 أعمدة"], ["4", "4 أعمدة"]]}
          />
          {urls.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {urls.map((u, i) => (
                <div key={i} className="relative overflow-hidden rounded-md border border-border/60">
                  <img src={u} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="absolute end-1 top-1 rounded-full bg-black/70 p-1 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="cursor-pointer">
            <Button asChild size="sm" variant="outline">
              <span><Upload className="ms-1 h-4 w-4" /> رفع صور</span>
            </Button>
            <input type="file" hidden multiple accept="image/*" onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
          </label>
        </div>
      );
    }
    case "quote":
      return (
        <div className="grid gap-3 md:grid-cols-2">
          <FieldTextarea label="الاقتباس (عربي)" value={b.text_ar} onChange={(v) => onChange({ text_ar: v } as any)} rows={3} />
          <FieldTextarea label="Quote (English)" value={b.text_en} onChange={(v) => onChange({ text_en: v } as any)} rows={3} dir="ltr" />
          <FieldText label="القائل" value={b.author} onChange={(v) => onChange({ author: v } as any)} />
        </div>
      );
    case "palette": {
      const colors = b.colors ?? [];
      const upd = (i: number, patch: Partial<{ name: string; hex: string }>) =>
        onChange({ colors: colors.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) } as any);
      return (
        <div className="grid gap-3">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="color" value={c.hex} onChange={(e) => upd(i, { hex: e.target.value })} className="h-10 w-10 rounded border border-border/60" />
              <Input value={c.name ?? ""} onChange={(e) => upd(i, { name: e.target.value })} placeholder="اسم اللون" />
              <Input value={c.hex} onChange={(e) => upd(i, { hex: e.target.value })} placeholder="#000000" dir="ltr" />
              <Button type="button" size="icon" variant="ghost" onClick={() => onChange({ colors: colors.filter((_, idx) => idx !== i) } as any)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={() => onChange({ colors: [...colors, { name: "", hex: "#000000" }] } as any)}>
            <Plus className="ms-1 h-4 w-4" /> لون جديد
          </Button>
        </div>
      );
    }
    case "video":
      return (
        <div className="grid gap-3 md:grid-cols-2">
          <FieldText label="رابط الفيديو (YouTube/Vimeo/mp4)" value={b.url} onChange={(v) => onChange({ url: v } as any)} dir="ltr" />
          <FieldText label="تسمية (عربي)" value={b.caption_ar} onChange={(v) => onChange({ caption_ar: v } as any)} />
          <FieldText label="Caption (English)" value={b.caption_en} onChange={(v) => onChange({ caption_en: v } as any)} dir="ltr" />
        </div>
      );
    case "stats": {
      const items = b.items ?? [];
      const upd = (i: number, patch: Partial<{ value: string; label_ar: string; label_en: string }>) =>
        onChange({ items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) } as any);
      return (
        <div className="grid gap-3">
          {items.map((it, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-border/60 p-3 md:grid-cols-4">
              <Input value={it.value} onChange={(e) => upd(i, { value: e.target.value })} placeholder="120+" />
              <Input value={it.label_ar ?? ""} onChange={(e) => upd(i, { label_ar: e.target.value })} placeholder="التسمية (عربي)" />
              <Input value={it.label_en ?? ""} onChange={(e) => upd(i, { label_en: e.target.value })} placeholder="Label (English)" dir="ltr" />
              <Button type="button" size="icon" variant="ghost" onClick={() => onChange({ items: items.filter((_, idx) => idx !== i) } as any)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={() => onChange({ items: [...items, { value: "", label_ar: "", label_en: "" }] } as any)}>
            <Plus className="ms-1 h-4 w-4" /> إحصائية جديدة
          </Button>
        </div>
      );
    }
    case "callout":
      return (
        <div className="grid gap-3">
          <FieldSelect
            label="الطابع"
            value={b.tone ?? "accent"}
            onChange={(v) => onChange({ tone: v as any } as any)}
            options={[["accent", "بارز"], ["info", "معلومة"], ["success", "إيجابي"]]}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <FieldTextarea label="النص (عربي)" value={b.text_ar} onChange={(v) => onChange({ text_ar: v } as any)} rows={3} />
            <FieldTextarea label="Text (English)" value={b.text_en} onChange={(v) => onChange({ text_en: v } as any)} rows={3} dir="ltr" />
          </div>
        </div>
      );
    case "spacer":
      return (
        <FieldSelect
          label="حجم الفراغ"
          value={b.size ?? "md"}
          onChange={(v) => onChange({ size: v as any } as any)}
          options={[["sm", "صغير"], ["md", "متوسط"], ["lg", "كبير"]]}
        />
      );
    case "before-after":
      return (
        <div className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <ImageField
              label="الصورة (قبل)"
              url={b.before_url}
              uploadImage={uploadImage}
              onChange={(v) => onChange({ before_url: v } as any)}
            />
            <ImageField
              label="الصورة (بعد)"
              url={b.after_url}
              uploadImage={uploadImage}
              onChange={(v) => onChange({ after_url: v } as any)}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <FieldText label="تسمية (قبل) — عربي" value={b.label_before_ar} onChange={(v) => onChange({ label_before_ar: v } as any)} />
            <FieldText label="Label (Before) — English" value={b.label_before_en} onChange={(v) => onChange({ label_before_en: v } as any)} dir="ltr" />
            <FieldText label="تسمية (بعد) — عربي" value={b.label_after_ar} onChange={(v) => onChange({ label_after_ar: v } as any)} />
            <FieldText label="Label (After) — English" value={b.label_after_en} onChange={(v) => onChange({ label_after_en: v } as any)} dir="ltr" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <FieldSelect
              label="اتجاه المقارنة"
              value={b.orientation ?? "horizontal"}
              onChange={(v) => onChange({ orientation: v as any } as any)}
              options={[["horizontal", "أفقي (يمين ↔ يسار)"], ["vertical", "رأسي (أعلى ↕ أسفل)"]]}
            />
            <FieldText label="تعليق (عربي)" value={b.caption_ar} onChange={(v) => onChange({ caption_ar: v } as any)} />
            <FieldText label="Caption (English)" value={b.caption_en} onChange={(v) => onChange({ caption_en: v } as any)} dir="ltr" />
          </div>
          <p className="text-xs text-muted-foreground">
            نصيحة: استخدم صورتين بنفس الأبعاد للحصول على أفضل مقارنة بصرية.
          </p>
        </div>
      );
    case "hero":
      return (
        <div className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <FieldText label="Kicker (عربي)" value={b.kicker_ar} onChange={(v) => onChange({ kicker_ar: v } as any)} />
            <FieldText label="Kicker (English)" value={b.kicker_en} onChange={(v) => onChange({ kicker_en: v } as any)} dir="ltr" />
            <FieldText label="العنوان (عربي)" value={b.title_ar} onChange={(v) => onChange({ title_ar: v } as any)} />
            <FieldText label="Title (English)" value={b.title_en} onChange={(v) => onChange({ title_en: v } as any)} dir="ltr" />
            <FieldTextarea label="نبذة قصيرة (عربي)" value={b.subtitle_ar} onChange={(v) => onChange({ subtitle_ar: v } as any)} rows={2} />
            <FieldTextarea label="Subtitle (English)" value={b.subtitle_en} onChange={(v) => onChange({ subtitle_en: v } as any)} rows={2} dir="ltr" />
            <FieldTextarea label="الوصف (عربي)" value={b.description_ar} onChange={(v) => onChange({ description_ar: v } as any)} rows={4} />
            <FieldTextarea label="Description (English)" value={b.description_en} onChange={(v) => onChange({ description_en: v } as any)} rows={4} dir="ltr" />
          </div>
          <div className="rounded-lg border border-border/60 p-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={b.show_meta_card !== false}
                onChange={(e) => onChange({ show_meta_card: e.target.checked } as any)}
              />
              إظهار بطاقة التخصص / النوع بجوار العنوان
            </label>
            {b.show_meta_card !== false && (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <FieldText label="تسمية التخصص (عربي)" value={b.specialty_label_ar} onChange={(v) => onChange({ specialty_label_ar: v } as any)} />
                <FieldText label="Specialty label (English)" value={b.specialty_label_en} onChange={(v) => onChange({ specialty_label_en: v } as any)} dir="ltr" />
                <FieldText label="قيمة التخصص (عربي)" value={b.specialty_value_ar} onChange={(v) => onChange({ specialty_value_ar: v } as any)} />
                <FieldText label="Specialty value (English)" value={b.specialty_value_en} onChange={(v) => onChange({ specialty_value_en: v } as any)} dir="ltr" />
                <FieldText label="تسمية النوع (عربي)" value={b.type_label_ar} onChange={(v) => onChange({ type_label_ar: v } as any)} />
                <FieldText label="Type label (English)" value={b.type_label_en} onChange={(v) => onChange({ type_label_en: v } as any)} dir="ltr" />
                <FieldText label="قيمة النوع (عربي)" value={b.type_value_ar} onChange={(v) => onChange({ type_value_ar: v } as any)} />
                <FieldText label="Type value (English)" value={b.type_value_en} onChange={(v) => onChange({ type_value_en: v } as any)} dir="ltr" />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            إذا تُركت الحقول فارغة سيستخدم النظام اسم المشروع ونبذته من بيانات المشروع الرئيسية.
          </p>
        </div>
      );
    case "cover":
      return (
        <div className="grid gap-3">
          <ImageField label="صورة الغلاف" url={b.url} uploadImage={uploadImage} onChange={(v) => onChange({ url: v } as any)} />
          <div className="grid gap-3 md:grid-cols-2">
            <FieldText label="النص البديل (عربي)" value={b.alt_ar} onChange={(v) => onChange({ alt_ar: v } as any)} />
            <FieldText label="Alt text (English)" value={b.alt_en} onChange={(v) => onChange({ alt_en: v } as any)} dir="ltr" />
          </div>
        </div>
      );
    case "approach": {
      const itemsAr = b.items_ar ?? [];
      const itemsEn = b.items_en ?? [];
      const setAr = (i: number, v: string) => onChange({ items_ar: itemsAr.map((x, idx) => idx === i ? v : x) } as any);
      const setEn = (i: number, v: string) => onChange({ items_en: itemsEn.map((x, idx) => idx === i ? v : x) } as any);
      const addRow = () => onChange({ items_ar: [...itemsAr, ""], items_en: [...itemsEn, ""] } as any);
      const rmRow = (i: number) => onChange({
        items_ar: itemsAr.filter((_, idx) => idx !== i),
        items_en: itemsEn.filter((_, idx) => idx !== i),
      } as any);
      const len = Math.max(itemsAr.length, itemsEn.length);
      return (
        <div className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <FieldText label="Kicker (عربي)" value={b.kicker_ar} onChange={(v) => onChange({ kicker_ar: v } as any)} />
            <FieldText label="Kicker (English)" value={b.kicker_en} onChange={(v) => onChange({ kicker_en: v } as any)} dir="ltr" />
            <FieldText label="العنوان (عربي)" value={b.title_ar} onChange={(v) => onChange({ title_ar: v } as any)} />
            <FieldText label="Title (English)" value={b.title_en} onChange={(v) => onChange({ title_en: v } as any)} dir="ltr" />
          </div>
          <div className="grid gap-2">
            <Label>نقاط المنهجية</Label>
            {Array.from({ length: len }).map((_, i) => (
              <div key={i} className="grid gap-2 rounded-lg border border-border/60 p-2 md:grid-cols-[1fr_1fr_auto]">
                <Input value={itemsAr[i] ?? ""} onChange={(e) => setAr(i, e.target.value)} placeholder={`نقطة ${i + 1} (عربي)`} />
                <Input value={itemsEn[i] ?? ""} onChange={(e) => setEn(i, e.target.value)} placeholder={`Point ${i + 1} (English)`} dir="ltr" />
                <Button type="button" size="icon" variant="ghost" onClick={() => rmRow(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={addRow}>
              <Plus className="ms-1 h-4 w-4" /> نقطة جديدة
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <FieldText label="تسمية القيمة (عربي)" value={b.value_label_ar} onChange={(v) => onChange({ value_label_ar: v } as any)} />
            <FieldText label="Value label (English)" value={b.value_label_en} onChange={(v) => onChange({ value_label_en: v } as any)} dir="ltr" />
            <FieldTextarea label="نص القيمة (عربي)" value={b.value_ar} onChange={(v) => onChange({ value_ar: v } as any)} rows={3} />
            <FieldTextarea label="Value text (English)" value={b.value_en} onChange={(v) => onChange({ value_en: v } as any)} rows={3} dir="ltr" />
          </div>
        </div>
      );
    }
    case "meta": {
      const items = b.items ?? [];
      const upd = (i: number, patch: Partial<{ label_ar: string; label_en: string; value_ar: string; value_en: string }>) =>
        onChange({ items: items.map((it, idx) => idx === i ? { ...it, ...patch } : it) } as any);
      return (
        <div className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <FieldText label="عنوان القسم (عربي)" value={b.title_ar} onChange={(v) => onChange({ title_ar: v } as any)} />
            <FieldText label="Section title (English)" value={b.title_en} onChange={(v) => onChange({ title_en: v } as any)} dir="ltr" />
          </div>
          {items.map((it, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-border/60 p-2 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
              <Input value={it.label_ar ?? ""} onChange={(e) => upd(i, { label_ar: e.target.value })} placeholder="التسمية (عربي)" />
              <Input value={it.label_en ?? ""} onChange={(e) => upd(i, { label_en: e.target.value })} placeholder="Label (English)" dir="ltr" />
              <Input value={it.value_ar ?? ""} onChange={(e) => upd(i, { value_ar: e.target.value })} placeholder="القيمة (عربي)" />
              <Input value={it.value_en ?? ""} onChange={(e) => upd(i, { value_en: e.target.value })} placeholder="Value (English)" dir="ltr" />
              <Button type="button" size="icon" variant="ghost" onClick={() => onChange({ items: items.filter((_, idx) => idx !== i) } as any)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={() => onChange({ items: [...items, { label_ar: "", label_en: "", value_ar: "", value_en: "" }] } as any)}>
            <Plus className="ms-1 h-4 w-4" /> صف جديد
          </Button>
        </div>
      );
    }
    case "deliverables": {
      const items = b.items ?? [];
      const upd = (i: number, patch: Partial<{ label_ar: string; label_en: string }>) =>
        onChange({ items: items.map((it, idx) => idx === i ? { ...it, ...patch } : it) } as any);
      return (
        <div className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <FieldText label="عنوان القسم (عربي)" value={b.title_ar} onChange={(v) => onChange({ title_ar: v } as any)} />
            <FieldText label="Section title (English)" value={b.title_en} onChange={(v) => onChange({ title_en: v } as any)} dir="ltr" />
          </div>
          {items.map((it, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-border/60 p-2 md:grid-cols-[1fr_1fr_auto]">
              <Input value={it.label_ar ?? ""} onChange={(e) => upd(i, { label_ar: e.target.value })} placeholder="مثال: دليل الهوية" />
              <Input value={it.label_en ?? ""} onChange={(e) => upd(i, { label_en: e.target.value })} placeholder="e.g. Brand Guidelines" dir="ltr" />
              <Button type="button" size="icon" variant="ghost" onClick={() => onChange({ items: items.filter((_, idx) => idx !== i) } as any)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={() => onChange({ items: [...items, { label_ar: "", label_en: "" }] } as any)}>
            <Plus className="ms-1 h-4 w-4" /> مخرج جديد
          </Button>
        </div>
      );
    }
    case "typography":
      return (
        <div className="grid gap-3 md:grid-cols-2">
          <FieldText label="عنوان القسم (عربي)" value={b.title_ar} onChange={(v) => onChange({ title_ar: v } as any)} />
          <FieldText label="Section title (English)" value={b.title_en} onChange={(v) => onChange({ title_en: v } as any)} dir="ltr" />
          <FieldText label="خط العناوين" value={b.heading_font} onChange={(v) => onChange({ heading_font: v } as any)} dir="ltr" />
          <FieldText label="خط المتن" value={b.body_font} onChange={(v) => onChange({ body_font: v } as any)} dir="ltr" />
          <FieldTextarea label="عيّنة (عربي)" value={b.sample_ar} onChange={(v) => onChange({ sample_ar: v } as any)} rows={2} />
          <FieldTextarea label="Sample (English)" value={b.sample_en} onChange={(v) => onChange({ sample_en: v } as any)} rows={2} dir="ltr" />
        </div>
      );
    case "links": {
      const items = b.items ?? [];
      const upd = (i: number, patch: Partial<{ label_ar: string; label_en: string; url: string; kind: "live" | "behance" | "figma" | "custom" }>) =>
        onChange({ items: items.map((it, idx) => idx === i ? { ...it, ...patch } : it) } as any);
      return (
        <div className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <FieldText label="عنوان القسم (عربي)" value={b.title_ar} onChange={(v) => onChange({ title_ar: v } as any)} />
            <FieldText label="Section title (English)" value={b.title_en} onChange={(v) => onChange({ title_en: v } as any)} dir="ltr" />
          </div>
          {items.map((it, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-border/60 p-2 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
              <select
                value={it.kind ?? "custom"}
                onChange={(e) => upd(i, { kind: e.target.value as any })}
                className="h-10 rounded-md border border-border/70 bg-background px-2 text-sm"
              >
                <option value="live">مباشر</option>
                <option value="behance">Behance</option>
                <option value="figma">Figma</option>
                <option value="custom">مخصص</option>
              </select>
              <Input value={it.label_ar ?? ""} onChange={(e) => upd(i, { label_ar: e.target.value })} placeholder="النص (عربي)" />
              <Input value={it.label_en ?? ""} onChange={(e) => upd(i, { label_en: e.target.value })} placeholder="Label (English)" dir="ltr" />
              <Input value={it.url} onChange={(e) => upd(i, { url: e.target.value })} placeholder="https://…" dir="ltr" />
              <Button type="button" size="icon" variant="ghost" onClick={() => onChange({ items: items.filter((_, idx) => idx !== i) } as any)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={() => onChange({ items: [...items, { url: "", kind: "custom", label_ar: "", label_en: "" }] } as any)}>
            <Plus className="ms-1 h-4 w-4" /> رابط جديد
          </Button>
        </div>
      );
    }
    case "testimonial":
      return (
        <div className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <FieldTextarea label="الاقتباس (عربي)" value={b.quote_ar} onChange={(v) => onChange({ quote_ar: v } as any)} rows={3} />
            <FieldTextarea label="Quote (English)" value={b.quote_en} onChange={(v) => onChange({ quote_en: v } as any)} rows={3} dir="ltr" />
            <FieldText label="اسم القائل" value={b.author_name} onChange={(v) => onChange({ author_name: v } as any)} />
            <FieldText label="التقييم (1-5)" value={String(b.rating ?? 5)} onChange={(v) => onChange({ rating: Math.max(0, Math.min(5, Number(v) || 0)) } as any)} dir="ltr" />
            <FieldText label="المسمى الوظيفي (عربي)" value={b.author_role_ar} onChange={(v) => onChange({ author_role_ar: v } as any)} />
            <FieldText label="Role (English)" value={b.author_role_en} onChange={(v) => onChange({ author_role_en: v } as any)} dir="ltr" />
          </div>
          <ImageField label="صورة القائل" url={b.author_avatar_url ?? ""} uploadImage={uploadImage} onChange={(v) => onChange({ author_avatar_url: v } as any)} />
        </div>
      );
    case "embed":
      return (
        <div className="grid gap-3 md:grid-cols-2">
          <FieldText label="رابط التضمين (iframe URL)" value={b.url} onChange={(v) => onChange({ url: v } as any)} dir="ltr" />
          <FieldSelect
            label="نسبة العرض"
            value={b.aspect ?? "16/9"}
            onChange={(v) => onChange({ aspect: v as any } as any)}
            options={[["16/9", "16:9"], ["4/3", "4:3"], ["1/1", "1:1"], ["9/16", "9:16 (رأسي)"]]}
          />
          <FieldText label="تعليق (عربي)" value={b.caption_ar} onChange={(v) => onChange({ caption_ar: v } as any)} />
          <FieldText label="Caption (English)" value={b.caption_en} onChange={(v) => onChange({ caption_en: v } as any)} dir="ltr" />
        </div>
      );
    case "next-project":
      return (
        <div className="grid gap-3 md:grid-cols-2">
          <FieldText label="التسمية (عربي)" value={b.label_ar} onChange={(v) => onChange({ label_ar: v } as any)} />
          <FieldText label="Label (English)" value={b.label_en} onChange={(v) => onChange({ label_en: v } as any)} dir="ltr" />
          <FieldText label="نص الزر (عربي)" value={b.cta_ar} onChange={(v) => onChange({ cta_ar: v } as any)} />
          <FieldText label="Button (English)" value={b.cta_en} onChange={(v) => onChange({ cta_en: v } as any)} dir="ltr" />
          <FieldText label="زر كل المشاريع (عربي)" value={b.all_label_ar} onChange={(v) => onChange({ all_label_ar: v } as any)} />
          <FieldText label="All-projects button (English)" value={b.all_label_en} onChange={(v) => onChange({ all_label_en: v } as any)} dir="ltr" />
        </div>
      );
  }
}

function FieldText({
  label, value, onChange, dir,
}: { label: string; value?: string; onChange: (v: string) => void; dir?: "ltr" | "rtl" }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} dir={dir} />
    </div>
  );
}

function FieldTextarea({
  label, value, onChange, rows, dir,
}: { label: string; value?: string; onChange: (v: string) => void; rows?: number; dir?: "ltr" | "rtl" }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={rows} dir={dir} />
    </div>
  );
}

function FieldSelect({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-md border border-border/70 bg-background px-3 text-sm"
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function ImageField({
  label, url, onChange, uploadImage,
}: { label: string; url: string; onChange: (v: string) => void; uploadImage: (f: File) => Promise<string> }) {
  const [busy, setBusy] = useState(false);
  const handle = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try { onChange(await uploadImage(file)); } finally { setBusy(false); }
  };
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {url ? (
        <div className="relative overflow-hidden rounded-lg border border-border/60">
          <img src={url} alt="" className="max-h-56 w-full object-cover" loading="lazy" />
          <button type="button" onClick={() => onChange("")} className="absolute end-2 top-2 rounded-full bg-black/60 p-1.5 text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 p-6 text-sm text-muted-foreground hover:bg-muted/30">
          <Upload className="h-4 w-4" />
          <span>{busy ? "جاري الرفع…" : "اضغط للرفع"}</span>
          <input type="file" hidden accept="image/*" onChange={(e) => { handle(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
      )}
      <Input value={url} onChange={(e) => onChange(e.target.value)} placeholder="أو الصق رابطًا" dir="ltr" />
    </div>
  );
}
