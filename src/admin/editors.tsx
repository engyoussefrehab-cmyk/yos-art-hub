import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, ChevronDown, Copy, ExternalLink, Eye, EyeOff, Loader2, Plus, Search, Trash2, Upload } from "lucide-react";
import { useAdmin } from "./store";
import { COLLECTIONS, SEO_FILE, TEXTS_FILE, TEXT_SECTIONS_FILE, type Collection, type Section } from "./schema";
import { BiInput, FieldEditor, Label, MediaPicker, TextInput, Thumb, Toggle, inputCls, type Options } from "./fields";
import { listMedia, recentCommits } from "./github";

/* -------------------------------- helpers -------------------------------- */

function getAt(obj: any, pointer?: string) {
  if (!pointer) return obj;
  return pointer.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
}
function setAt(obj: any, pointer: string | undefined, value: any) {
  if (!pointer) return value;
  const keys = pointer.split(".");
  const root = Array.isArray(obj) ? obj.slice() : { ...obj };
  let cur = root;
  keys.slice(0, -1).forEach((k) => {
    cur[k] = Array.isArray(cur[k]) ? cur[k].slice() : { ...cur[k] };
    cur = cur[k];
  });
  cur[keys[keys.length - 1]] = value;
  return root;
}

function useOptions(): Options {
  const { get } = useAdmin();
  const cats = get<any[]>("src/data/snapshot/project_categories.json") ?? [];
  const icats = get<any[]>("src/data/snapshot/insight_categories.json") ?? [];
  return useMemo(
    () => ({
      categories: cats.map((c) => ({ value: c.slug, label: c.name_ar || c.slug })),
      insightCategories: icats.map((c) => ({ value: c.id, label: c.label_ar || c.slug })),
    }),
    [cats, icats],
  );
}

export function PageHeader({ title, description, actions, back }: { title: string; description?: string; actions?: React.ReactNode; back?: () => void }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <button type="button" onClick={back} className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowRight className="h-4 w-4" /> رجوع
          </button>
        )}
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-border bg-card p-5 shadow-[0_1px_0_rgb(0_0_0/0.02)] sm:p-6 ${className}`}>{children}</div>;
}

function SectionCard({ section, record, onChange, options }: { section: Section; record: any; onChange: (p: Record<string, any>) => void; options: Options }) {
  const [open, setOpen] = useState(!section.collapsed);
  return (
    <Card>
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-3 text-start">
        <h2 className="font-display text-base font-bold">{section.title}</h2>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-5 space-y-6">
          {section.fields.map((f) => (
            <FieldEditor key={f.key} field={f} record={record} onChange={onChange} options={options} />
          ))}
        </div>
      )}
    </Card>
  );
}

const btn = "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition";
const btnGhost = `${btn} border border-border bg-background hover:border-foreground/30`;
const btnDark = `${btn} bg-ink text-white hover:bg-ink/85`;

function ConfirmDelete({ onConfirm }: { onConfirm: () => void }) {
  const [ask, setAsk] = useState(false);
  if (!ask)
    return (
      <button type="button" onClick={() => setAsk(true)} className={`${btn} text-red-600 hover:bg-red-50`}>
        <Trash2 className="h-4 w-4" /> حذف
      </button>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 p-1 ps-3 text-sm text-red-700">
      متأكد؟
      <button type="button" onClick={onConfirm} className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">احذف</button>
      <button type="button" onClick={() => setAsk(false)} className="rounded-full px-3 py-1 text-xs font-semibold">لأ</button>
    </span>
  );
}

/* ---------------------------- collection editor -------------------------- */

export function CollectionEditor({ id, openItem, setOpenItem }: { id: string; openItem: number | null; setOpenItem: (i: number | null) => void }) {
  const col = COLLECTIONS.find((c) => c.id === id)!;
  const { get, set, isDirty } = useAdmin();
  const options = useOptions();
  const fileVal = get<any>(col.file);
  const data = getAt(fileVal, col.pointer);
  const write = (v: any) => set(col.file, setAt(fileVal, col.pointer, v));

  if (col.kind === "single") {
    const isArr = Array.isArray(data);
    const rec = isArr ? data[col.index ?? 0] : data;
    const patch = (p: Record<string, any>) => {
      const next = { ...rec, ...p };
      write(isArr ? data.map((x: any, i: number) => (i === (col.index ?? 0) ? next : x)) : next);
    };
    return (
      <div>
        <PageHeader title={col.title} description={col.description} actions={col.siteHref && <SiteLink href={col.siteHref()} />} />
        <div className="space-y-4">
          {col.sections.map((s, i) => <SectionCard key={i} section={s} record={rec} onChange={patch} options={options} />)}
        </div>
        {isDirty(col.file) && <DirtyNote />}
      </div>
    );
  }

  const list: any[] = Array.isArray(data) ? data : [];
  if (openItem !== null && list[openItem]) return <ItemEditor col={col} list={list} index={openItem} write={write} options={options} back={() => setOpenItem(null)} />;
  return <ListView col={col} list={list} write={write} open={setOpenItem} />;
}

function SiteLink({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={btnGhost}>
      <ExternalLink className="h-4 w-4" /> شوفه في الموقع
    </a>
  );
}
function DirtyNote() {
  return <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">فيه تعديلات لسه متنشرتش — دوس «نشر التعديلات» فوق لما تخلص.</div>;
}

function ListView({ col, list, write, open }: { col: Collection; list: any[]; write: (v: any[]) => void; open: (i: number) => void }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [visibility, setVisibility] = useState("all");
  const options = useOptions();
  const order = useMemo(() => {
    const idx = list.map((_, i) => i);
    if (col.sortKey) idx.sort((a, b) => (Number(list[a]?.[col.sortKey!]) || 0) - (Number(list[b]?.[col.sortKey!]) || 0));
    return idx;
  }, [list, col.sortKey]);
  const isVisible = (x: any) => !col.visibility || x[col.visibility.key] === col.visibility.on;
  const shown = order.filter((i) => {
    const x = list[i];
    if (cat && x.category_slug !== cat) return false;
    if (visibility === "visible" && !isVisible(x)) return false;
    if (visibility === "hidden" && isVisible(x)) return false;
    if (!q) return true;
    return JSON.stringify(x).toLocaleLowerCase("ar").includes(q.toLocaleLowerCase("ar"));
  });

  const move = (pos: number, d: number) => {
    const a = order[pos];
    const b = order[pos + d];
    if (b === undefined) return;
    if (col.sortKey) {
      // renumber everything in the current order, then swap the two
      const seq = order.slice();
      [seq[pos], seq[pos + d]] = [seq[pos + d], seq[pos]];
      const next = list.slice();
      seq.forEach((i, k) => (next[i] = { ...next[i], [col.sortKey!]: (k + 1) * 10 }));
      write(next);
    } else {
      const next = list.slice();
      [next[a], next[b]] = [next[b], next[a]];
      write(next);
    }
  };
  const toggleVis = (i: number) => {
    if (!col.visibility) return;
    const x = list[i];
    write(list.map((y, k) => (k === i ? { ...x, [col.visibility!.key]: isVisible(x) ? col.visibility!.off : col.visibility!.on } : y)));
  };
  const add = () => {
    const item = col.newItem!(list);
    write([...list, item]);
    open(list.length);
  };
  const duplicate = (i: number) => {
    const x = structuredClone(list[i]);
    if ("id" in x) x.id = col.newItem ? col.newItem(list).id : `${x.id}-copy`;
    if ("slug" in x) x.slug = `${x.slug}-copy`;
    if (col.visibility) x[col.visibility.key] = col.visibility.off;
    for (const k of ["name_ar", "title_ar", "name"]) if (typeof x[k] === "string") x[k] = `${x[k]} (نسخة)`;
    if (col.sortKey) x[col.sortKey] = (Number(list[i][col.sortKey]) || 0) + 1;
    write([...list, x]);
  };
  const hasImages = !!col.itemImage;

  return (
    <div>
      <PageHeader
        title={col.title}
        description={col.description}
        actions={
          <>
            {col.siteHref && <SiteLink href={col.siteHref()} />}
            {col.newItem && (
              <button type="button" onClick={add} className={`${btn} bg-accent text-accent-foreground hover:brightness-95`}>
                <Plus className="h-4 w-4" /> إضافة جديد
              </button>
            )}
          </>
        }
      />
      {(list.length > 6 || col.visibility) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {list.length > 6 && <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث في العربي والإنجليزي…" className={`${inputCls} ps-10`} />
          </div>}
          {col.id === "projects" && (
            <select value={cat} onChange={(e) => setCat(e.target.value)} className={`${inputCls} w-auto`}>
              <option value="">كل الأقسام</option>
              {options.categories.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}
          {col.visibility && <select value={visibility} onChange={(e) => setVisibility(e.target.value)} aria-label="تصفية حسب الظهور" className={`${inputCls} w-auto`}>
            <option value="all">الكل ({list.length})</option>
            <option value="visible">ظاهر ({list.filter(isVisible).length})</option>
            <option value="hidden">مخفي ({list.filter((x) => !isVisible(x)).length})</option>
          </select>}
        </div>
      )}
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        {shown.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">مفيش حاجة هنا لسه.</div>}
        {shown.map((i) => {
          const x = list[i];
          const pos = order.indexOf(i);
          const vis = isVisible(x);
          return (
            <div key={x.id ?? i} className="flex items-center gap-3 border-b border-border p-3 last:border-0 sm:gap-4 sm:p-4">
              {!q && !cat && visibility === "all" && (
                <div className="flex shrink-0 flex-col">
                  <button type="button" disabled={pos === 0} onClick={() => move(pos, -1)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted disabled:opacity-20" aria-label="لفوق"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" disabled={pos === order.length - 1} onClick={() => move(pos, 1)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted disabled:opacity-20" aria-label="لتحت"><ArrowDown className="h-4 w-4" /></button>
                </div>
              )}
              <button type="button" onClick={() => open(i)} className="flex min-w-0 flex-1 items-center gap-3 text-start sm:gap-4">
                {hasImages && <Thumb url={col.itemImage!(x)} className="h-14 w-20 shrink-0 rounded-xl border border-border sm:h-16 sm:w-24" />}
                <div className="min-w-0">
                  <div className={`truncate font-semibold ${vis ? "" : "text-muted-foreground"}`}>{col.itemTitle?.(x) || "—"}</div>
                  {col.itemSubtitle && <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{col.itemSubtitle(x)}</div>}
                </div>
              </button>
              <div className="flex shrink-0 items-center gap-1">
                {col.visibility && (
                  <button type="button" onClick={() => toggleVis(i)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${vis ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`} title={vis ? "ظاهر في الموقع — دوس للإخفاء" : "مخفي — دوس للإظهار"}>
                    {vis ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{vis ? "ظاهر" : "مخفي"}</span>
                  </button>
                )}
                {col.newItem && (
                  <button type="button" onClick={() => duplicate(i)} className="hidden rounded-full p-2 text-muted-foreground hover:bg-muted sm:inline-flex" title="نسخة"><Copy className="h-4 w-4" /></button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ItemEditor({ col, list, index, write, options, back }: { col: Collection; list: any[]; index: number; write: (v: any[]) => void; options: Options; back: () => void }) {
  const rec = list[index];
  const patch = (p: Record<string, any>) => write(list.map((x, i) => (i === index ? { ...x, ...p, ...("updated_at" in x ? { updated_at: new Date().toISOString() } : {}) } : x)));
  const vis = !col.visibility || rec[col.visibility.key] === col.visibility.on;
  useEffect(() => window.scrollTo({ top: 0 }), [index]);
  return (
    <div>
      <PageHeader
        back={back}
        title={col.itemTitle?.(rec) || "عنصر جديد"}
        actions={
          <>
            {col.visibility && (
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm">
                <Toggle checked={vis} onChange={(v) => patch({ [col.visibility!.key]: v ? col.visibility!.on : col.visibility!.off })} />
                {vis ? "ظاهر في الموقع" : "مخفي"}
              </span>
            )}
            {col.siteHref && vis && <SiteLink href={col.siteHref(rec)} />}
            <ConfirmDelete onConfirm={() => { write(list.filter((_, i) => i !== index)); back(); }} />
          </>
        }
      />
      <div className="space-y-4">
        {col.sections.map((s, i) => <SectionCard key={i} section={s} record={rec} onChange={patch} options={options} />)}
      </div>
    </div>
  );
}

/* ------------------------------- site texts ------------------------------ */

export function TextsEditor() {
  const { get, set, docs } = useAdmin();
  const dict = get<Record<string, { ar: string; en: string }>>(TEXTS_FILE) ?? {};
  const sections = get<{ title: string; keys: string[] }[]>(TEXT_SECTIONS_FILE) ?? [];
  const base = useMemo(() => JSON.parse(docs[TEXTS_FILE]?.base ?? "{}"), [docs]);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [onlyChanged, setOnlyChanged] = useState(false);
  const covered = new Set(sections.flatMap((s) => s.keys));
  const allSections = [...sections, { title: "أخرى", keys: Object.keys(dict).filter((k) => !covered.has(k)) }].filter((s) => s.keys.length);
  const query = q.trim().toLowerCase();
  const matches = (k: string) => {
    const v = dict[k];
    if (!v) return false;
    if (onlyChanged && JSON.stringify(v) === JSON.stringify(base[k])) return false;
    return !query || v.ar.toLowerCase().includes(query) || (v.en ?? "").toLowerCase().includes(query) || k.includes(query);
  };
  const list = query || onlyChanged ? allSections.map((s) => ({ ...s, keys: s.keys.filter(matches) })).filter((s) => s.keys.length) : [allSections[active]].filter(Boolean);
  const upd = (k: string, lang: "ar" | "en", v: string) => set(TEXTS_FILE, { ...dict, [k]: { ...dict[k], [lang]: v } });

  return (
    <div>
      <PageHeader title="نصوص الموقع" description="كل كلمة ظاهرة في الموقع (العناوين، الأزرار، الفورم، الفوتر…). دوّر على أي جملة شايفها في الموقع وعدّلها." />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="اكتب جزء من الجملة اللي عايز تعدّلها…" className={`${inputCls} ps-10 py-3`} />
        </div>
        <Toggle checked={onlyChanged} onChange={setOnlyChanged} label="المعدّل بس" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
        {!query && !onlyChanged && (
          <nav className="flex gap-1 overflow-x-auto pb-1 lg:sticky lg:top-24 lg:flex-col lg:self-start lg:overflow-visible">
            {allSections.map((s, i) => (
              <button key={i} type="button" onClick={() => setActive(i)} className={`shrink-0 rounded-xl px-3 py-2 text-start text-sm transition ${i === active ? "bg-ink font-semibold text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                {s.title} <span className="opacity-50">({s.keys.length})</span>
              </button>
            ))}
          </nav>
        )}
        <div className={`space-y-6 ${query || onlyChanged ? "lg:col-span-2" : ""}`}>
          {list.length === 0 && <Card className="text-center text-sm text-muted-foreground">مفيش نص بالكلام ده.</Card>}
          {list.map((s) => (
            <Card key={s.title}>
              <h2 className="mb-4 font-display text-base font-bold">{s.title}</h2>
              <div className="divide-y divide-border">
                {s.keys.map((k) => {
                  const v = dict[k];
                  const long = (v.ar?.length ?? 0) > 70 || (v.en?.length ?? 0) > 90;
                  const changed = JSON.stringify(v) !== JSON.stringify(base[k]);
                  return (
                    <div key={k} className="py-3 first:pt-0 last:pb-0">
                      {changed && <div className="mb-1 text-[11px] font-semibold text-amber-600">● معدّل</div>}
                      <BiInput context={s.title} multiline={long} ar={v.ar ?? ""} en={v.en ?? ""} onAr={(x) => upd(k, "ar", x)} onEn={(x) => upd(k, "en", x)} />
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- SEO ---------------------------------- */

const SEO_PAGES: Record<string, string> = { site: "الإعداد العام", home: "الصفحة الرئيسية", projects: "صفحة المشاريع", packages: "فئات الخدمات", contact: "تواصل", insights: "المقالات" };
const SEO_FIELDS: { key: string; label: string; multi?: boolean; image?: boolean }[] = [
  { key: "title", label: "عنوان الصفحة (بيظهر في جوجل وفي التاب)" },
  { key: "description", label: "الوصف في جوجل", multi: true },
  { key: "keywords", label: "كلمات مفتاحية (مفصولة بفاصلة)", multi: true },
  { key: "og_title", label: "العنوان لما الرابط يتبعت" },
  { key: "og_description", label: "الوصف لما الرابط يتبعت", multi: true },
  { key: "og_image", label: "صورة المشاركة", image: true },
  { key: "og_image_alt", label: "وصف صورة المشاركة" },
  { key: "twitter_title", label: "العنوان على X" },
  { key: "twitter_description", label: "الوصف على X", multi: true },
];

export function SeoEditor() {
  const { get, set } = useAdmin();
  const seo = get<Record<string, Record<string, Record<string, string>>>>(SEO_FILE) ?? {};
  const pages = Object.keys(seo);
  const [page, setPage] = useState(pages.includes("home") ? "home" : pages[0]);
  const p = seo[page] ?? {};
  const fields = SEO_FIELDS.filter((f) => p.ar?.[f.key] !== undefined || p.en?.[f.key] !== undefined);
  const upd = (lang: string, key: string, v: string) => set(SEO_FILE, { ...seo, [page]: { ...p, [lang]: { ...p[lang], [key]: v } } });
  return (
    <div>
      <PageHeader title="جوجل والمشاركة" description="العناوين والأوصاف اللي بتظهر في نتائج جوجل، وفي الكارت اللي بيطلع لما حد يبعت رابط الموقع على واتساب أو لينكدإن." />
      <div className="mb-5 flex flex-wrap gap-2">
        {pages.map((k) => (
          <button key={k} type="button" onClick={() => setPage(k)} className={`rounded-full px-4 py-2 text-sm font-semibold ${k === page ? "bg-ink text-white" : "border border-border bg-background text-muted-foreground"}`}>
            {SEO_PAGES[k] ?? k}
          </button>
        ))}
      </div>
      <Card>
        <div className="space-y-6">
          {fields.map((f) => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              {f.image ? (
                <SeoImage value={p.ar?.[f.key] ?? p.en?.[f.key] ?? ""} onChange={(v) => { upd("ar", f.key, v); if (p.en) upd("en", f.key, v); }} />
              ) : p.en ? (
                <BiInput multiline={f.multi} ar={p.ar?.[f.key] ?? ""} en={p.en?.[f.key] ?? ""} onAr={(v) => upd("ar", f.key, v)} onEn={(v) => upd("en", f.key, v)} />
              ) : (
                <TextInput multiline={f.multi} value={p.ar?.[f.key] ?? ""} onChange={(v) => upd("ar", f.key, v)} />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SeoImage({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [picker, setPicker] = useState(false);
  const abs = (u: string) => (u.startsWith("/") ? `https://yrstudio.art${u}` : u);
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Thumb url={value.replace("https://yrstudio.art", "")} className="h-24 w-44 rounded-2xl border border-border" />
      <button type="button" onClick={() => setPicker(true)} className={btnGhost}><Upload className="h-4 w-4" /> تغيير الصورة</button>
      <MediaPicker open={picker} onClose={() => setPicker(false)} onPick={(u) => u[0] && onChange(abs(u[0]))} />
    </div>
  );
}

/* ------------------------------ media library ---------------------------- */

export function MediaLibraryPage() {
  const { uploads } = useAdmin();
  const [items, setItems] = useState<{ url: string; size: number }[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  useEffect(() => {
    listMedia().then(setItems).catch(() => setItems([]));
  }, [uploads.length]);
  const total = (items ?? []).reduce((s, x) => s + x.size, 0);
  return (
    <div>
      <PageHeader
        title="مكتبة الصور"
        description="كل الصور والملفات اللي على الموقع. الصور اللي بترفعها بتتحوّل تلقائي لـ WebP بجودة عالية عشان الموقع يفضل سريع."
        actions={<button type="button" onClick={() => setPicker(true)} className={btnDark}><Upload className="h-4 w-4" /> رفع صور</button>}
      />
      {items && <div className="mb-4 text-sm text-muted-foreground">{items.length} ملف · {(total / 1e6).toFixed(1)} ميجا</div>}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {items === null && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
        {[...uploads.map((u) => ({ url: u.url, size: u.bytes, pending: true })), ...(items ?? [])].map((m: any) => (
          <button key={m.url} type="button" onClick={() => { navigator.clipboard?.writeText(m.url); setCopied(m.url); setTimeout(() => setCopied(null), 1500); }} className="group relative overflow-hidden rounded-2xl border border-border bg-card text-start" title="دوس عشان تنسخ الرابط">
            <Thumb url={m.url} className="aspect-square w-full" />
            <div className="truncate px-2 py-1.5 text-[10px] text-muted-foreground" dir="ltr">{m.url.split("/").pop()}</div>
            {m.pending && <span className="absolute start-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold">لسه متنشرش</span>}
            {copied === m.url && <span className="absolute inset-0 grid place-items-center bg-black/60 text-sm font-semibold text-white">اتنسخ الرابط</span>}
          </button>
        ))}
      </div>
      <MediaPicker open={picker} multiple onClose={() => setPicker(false)} onPick={() => {}} />
      {uploads.length > 0 && <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">الصور المرفوعة بتتنشر مع أول تعديل يستخدمها (في مشروع، أو قسم، أو أي مكان).</div>}
    </div>
  );
}

/* --------------------------------- history -------------------------------- */

export function HistoryPage() {
  const [list, setList] = useState<{ sha: string; message: string; date: string }[] | null>(null);
  useEffect(() => {
    recentCommits(25).then(setList).catch(() => setList([]));
  }, []);
  return (
    <div>
      <PageHeader title="سجل التعديلات" description="كل تعديل اتنشر على الموقع. لو حاجة باظت، قول لـ Claude «رجّع الموقع لنسخة يوم كذا» وهيرجّعها." />
      <Card className="p-0 sm:p-0">
        {list === null && <div className="p-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
        {list?.map((c) => (
          <div key={c.sha} className="flex items-center justify-between gap-4 border-b border-border px-5 py-3.5 last:border-0">
            <div className="min-w-0 truncate text-sm">{c.message}</div>
            <div className="shrink-0 text-xs text-muted-foreground" dir="ltr">{new Date(c.date).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}
