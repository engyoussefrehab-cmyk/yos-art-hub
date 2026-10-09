import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ImagePlus, Images, Loader2, Plus, Sparkles, Trash2, X } from "lucide-react";
import { translateArToEn, useAi } from "./translate";
import { useAdmin } from "./store";
import { prepareUpload } from "./images";
import { listMedia } from "./github";
import type { Field } from "./schema";

/* ------------------------------ primitives ------------------------------ */

export const inputCls =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 transition";

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <div className="text-[13px] font-semibold text-foreground">{children}</div>
      {hint && <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{hint}</div>}
    </div>
  );
}

function AutoTextarea({ value, onChange, dir, rows = 3, mono, padEnd }: { value: string; onChange: (v: string) => void; dir?: string; rows?: number; mono?: boolean; padEnd?: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight + 2, 640)}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      dir={dir}
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} resize-y leading-relaxed ${padEnd ? "pe-11" : ""} ${mono ? "font-mono text-[13px]" : ""}`}
    />
  );
}

function LangTag({ lang }: { lang: "ar" | "en" }) {
  return (
    <span className="pointer-events-none absolute end-2.5 top-2 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground ring-1 ring-border">
      {lang === "ar" ? "ع" : "EN"}
    </span>
  );
}

export function TextInput({ value, onChange, multiline, dir, lang, mono }: { value: string; onChange: (v: string) => void; multiline?: boolean; dir?: string; lang?: "ar" | "en"; mono?: boolean }) {
  const d = dir ?? (lang === "en" ? "ltr" : lang === "ar" ? "rtl" : undefined);
  return (
    // wrapper takes the field's own direction so the language tag sits at the end of the text, never over it
    <div className="relative" dir={d}>
      {multiline ? (
        <AutoTextarea value={value} onChange={onChange} dir={d} mono={mono} padEnd={!!lang} />
      ) : (
        <input dir={d} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} ${lang ? "pe-11" : ""}`} />
      )}
      {lang && <LangTag lang={lang} />}
    </div>
  );
}

/**
 * Arabic and English side by side. When AI translation is on, typing Arabic
 * fills the English automatically (1s after you stop typing). Typing in the
 * English box yourself locks it until you press «ترجم».
 */
export function BiInput({ ar, en, onAr, onEn, multiline, mono, context }: { ar: string; en: string; onAr: (v: string) => void; onEn: (v: string) => void; multiline?: boolean; mono?: boolean; context?: string }) {
  const { auto, ready } = useAi();
  const [state, setState] = useState<"idle" | "working" | "done" | "error" | "locked">("idle");
  const [err, setErr] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const seq = useRef(0);
  const locked = useRef(false);
  const onEnRef = useRef(onEn);
  onEnRef.current = onEn;

  const run = async (text: string) => {
    const my = ++seq.current;
    if (!text.trim()) return;
    setState("working");
    setErr(null);
    try {
      const out = await translateArToEn(text, context);
      if (my !== seq.current || locked.current) return;
      onEnRef.current(out);
      setState("done");
    } catch (e: any) {
      if (my !== seq.current) return;
      setState("error");
      setErr(e?.status === 401 ? "مفتاح الذكاء الاصطناعي مش صحيح" : e?.message === "no-key" ? "فعّل الترجمة من الإعدادات" : "الترجمة مش متاحة دلوقتي — اكتب الإنجليزي بنفسك أو جرّب تاني");
    }
  };
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const changeAr = (v: string) => {
    onAr(v);
    if (!auto || locked.current) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => run(v), 1000);
  };
  const changeEn = (v: string) => {
    locked.current = true;
    seq.current++; // cancel any translation in flight
    if (timer.current) window.clearTimeout(timer.current);
    setState("locked");
    onEn(v);
  };
  const retranslate = () => {
    locked.current = false;
    run(ar);
  };

  return (
    <div>
      <div className="grid gap-2 md:grid-cols-2">
        <TextInput value={ar} onChange={changeAr} multiline={multiline} lang="ar" mono={mono} />
        <div className="relative">
          <TextInput value={en} onChange={changeEn} multiline={multiline} lang="en" mono={mono} />
          {state === "working" && <div className="pointer-events-none absolute inset-0 rounded-xl bg-background/60 backdrop-blur-[1px]" />}
        </div>
      </div>
      {ready && (
        <div className="mt-1 flex min-h-[18px] items-center justify-end gap-2 text-[11px] text-muted-foreground">
          {state === "working" && <span className="inline-flex items-center gap-1 text-accent"><Loader2 className="h-3 w-3 animate-spin" /> بيترجم…</span>}
          {state === "done" && <span className="inline-flex items-center gap-1 text-emerald-600"><Sparkles className="h-3 w-3" /> اتترجم تلقائي</span>}
          {state === "locked" && <span>الإنجليزي بتاعك — مش هيتغيّر تلقائي</span>}
          {state === "error" && <span className="text-red-600">{err}</span>}
          {ar.trim() && state !== "working" && (
            <button type="button" onClick={retranslate} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold text-foreground/70 hover:bg-muted hover:text-foreground">
              <Sparkles className="h-3 w-3" /> ترجم
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3 text-sm"
    >
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-accent" : "bg-border"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "start-[22px]" : "start-0.5"}`} />
      </span>
      {label && <span className="text-foreground">{label}</span>}
    </button>
  );
}

/* --------------------------------- media -------------------------------- */

function useUploader(preserveOriginal = false) {
  const { addUpload } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const upload = async (files: FileList | File[]): Promise<string[]> => {
    setBusy(true);
    setErr(null);
    const urls: string[] = [];
    try {
      for (const f of Array.from(files)) {
        const u = await prepareUpload(f, "uploads", { preserveOriginal });
        addUpload(u);
        urls.push(u.url);
      }
    } catch (e: any) {
      setErr("الصورة دي مش راضية تتحمّل — جرّب صيغة JPG أو PNG");
    } finally {
      setBusy(false);
    }
    return urls;
  };
  return { upload, busy, err };
}

export function Thumb({ url, className = "", fit = "cover" }: { url?: string | null; className?: string; fit?: "contain" | "cover" }) {
  const { previewFor } = useAdmin();
  const src = previewFor(url);
  if (!src) return <div className={`grid place-items-center bg-muted text-muted-foreground ${className}`}><Images className="h-5 w-5 opacity-50" /></div>;
  if (/\.pdf$/i.test(src)) return <div className={`grid place-items-center bg-muted text-xs font-bold ${className}`}>PDF</div>;
  return <img src={src} alt="" loading="lazy" className={`object-${fit} ${className}`} />;
}

export function MediaPicker({ open, onClose, onPick, multiple }: { open: boolean; onClose: () => void; onPick: (urls: string[]) => void; multiple?: boolean }) {
  const { uploads } = useAdmin();
  const [items, setItems] = useState<{ url: string; size: number }[] | null>(null);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const { upload, busy, err } = useUploader();
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    setSel([]);
    listMedia().then(setItems).catch(() => setItems([]));
  }, [open]);
  const all = useMemo(() => {
    const pending = uploads.map((u) => ({ url: u.url, size: u.bytes }));
    const list = [...pending, ...(items ?? [])];
    return list.filter((x) => !/\.pdf$/i.test(x.url) && x.url.toLowerCase().includes(q.toLowerCase()));
  }, [items, uploads, q]);
  if (!open) return null;
  const toggle = (u: string) => setSel((s) => (multiple ? (s.includes(u) ? s.filter((x) => x !== u) : [...s, u]) : [u]));
  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="font-display text-lg font-bold">مكتبة الصور</div>
          <input placeholder="بحث…" value={q} onChange={(e) => setQ(e.target.value)} className={`${inputCls} max-w-xs py-2`} />
          <button type="button" onClick={() => fileRef.current?.click()} className="ms-auto inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} رفع صور
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={async (e) => { if (e.target.files) { const u = await upload(e.target.files); setSel((s) => (multiple ? [...s, ...u] : u.slice(-1))); } e.target.value = ""; }} />
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-muted" aria-label="إغلاق"><X className="h-5 w-5" /></button>
        </div>
        {err && <div className="bg-red-50 px-4 py-2 text-sm text-red-700">{err}</div>}
        <div className="grid flex-1 grid-cols-3 gap-2 overflow-y-auto p-4 sm:grid-cols-5 lg:grid-cols-6">
          {items === null && <div className="col-span-full py-16 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>}
          {all.map((m) => (
            <button key={m.url} type="button" onClick={() => toggle(m.url)} className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition ${sel.includes(m.url) ? "border-accent ring-4 ring-accent/20" : "border-transparent hover:border-border"}`} title={m.url}>
              <Thumb url={m.url} className="h-full w-full" />
              {sel.includes(m.url) && <span className="absolute end-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-accent text-xs font-bold text-white">{multiple ? sel.indexOf(m.url) + 1 : "✓"}</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border p-4">
          <div className="text-sm text-muted-foreground">{sel.length ? `${sel.length} مختارة` : "اختار صورة"}</div>
          <button type="button" disabled={!sel.length} onClick={() => { onPick(sel); onClose(); }} className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-accent-foreground disabled:opacity-40">استخدام</button>
        </div>
      </div>
    </div>
  );
}

export function ImageInput({ value, onChange, fit = "cover", preserveOriginal = false }: { value: string | null; onChange: (v: string | null) => void; fit?: "contain" | "cover"; preserveOriginal?: boolean }) {
  const { upload, busy, err } = useUploader(preserveOriginal);
  const [picker, setPicker] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isData = value?.startsWith("data:");
  return (
    <div className="flex flex-wrap items-start gap-4">
      <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
        <Thumb url={value} className="h-full w-full" fit={fit} />
        {busy && <div className="absolute inset-0 grid place-items-center bg-white/70"><Loader2 className="h-5 w-5 animate-spin" /></div>}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white"><ImagePlus className="h-4 w-4" /> رفع صورة</button>
          <button type="button" onClick={() => setPicker(true)} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold"><Images className="h-4 w-4" /> من المكتبة</button>
          {value && <button type="button" onClick={() => onChange(null)} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> إزالة</button>}
        </div>
        {!isData && <input dir="ltr" value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} placeholder="/media/..." className={`${inputCls} py-1.5 text-xs text-muted-foreground`} />}
        {isData && <div className="text-xs text-muted-foreground">صورة مدمجة (نص). ارفع صورة بدلها لو عايز تغيّرها.</div>}
        {err && <div className="text-xs text-red-600">{err}</div>}
      </div>
      <input ref={fileRef} type="file" accept="image/*,.svg" hidden onChange={async (e) => { if (e.target.files?.length) { const [u] = await upload(e.target.files); if (u) onChange(u); } e.target.value = ""; }} />
      <MediaPicker open={picker} onClose={() => setPicker(false)} onPick={(u) => onChange(u[0] ?? null)} />
    </div>
  );
}

function GalleryInput({ value, onChange }: { value: any[]; onChange: (v: any[]) => void }) {
  const list = Array.isArray(value) ? value : [];
  const objMode = list.length === 0 || typeof list[0] === "object";
  const urls: string[] = list.map((g) => (typeof g === "string" ? g : g?.url)).filter(Boolean);
  const emit = (u: string[]) => onChange(objMode ? u.map((url) => ({ url })) : u);
  const { upload, busy, err } = useUploader();
  const [picker, setPicker] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= urls.length) return;
    const n = urls.slice();
    [n[i], n[j]] = [n[j], n[i]];
    emit(n);
  };
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {urls.map((u, i) => (
          <div
            key={u + i}
            draggable
            onDragStart={() => setDrag(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (drag === null || drag === i) return; const n = urls.slice(); const [x] = n.splice(drag, 1); n.splice(i, 0, x); emit(n); setDrag(null); }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-muted"
          >
            <Thumb url={u} className="aspect-[4/3] w-full" />
            <span className="absolute start-2 top-2 grid h-6 min-w-6 place-items-center rounded-full bg-black/70 px-1.5 text-[11px] font-bold text-white">{i + 1}</span>
            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2">
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} className="rounded-full bg-white/90 p-1.5" aria-label="قبل"><ArrowRight className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => move(i, 1)} className="rounded-full bg-white/90 p-1.5" aria-label="بعد"><ArrowLeft className="h-3.5 w-3.5" /></button>
              </div>
              <button type="button" onClick={() => emit(urls.filter((_, k) => k !== i))} className="rounded-full bg-white/90 p-1.5 text-red-600" aria-label="حذف"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => fileRef.current?.click()} className="grid aspect-[4/3] place-items-center rounded-2xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-accent hover:text-accent">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <span className="flex flex-col items-center gap-1"><ImagePlus className="h-5 w-5" />رفع صور</span>}
        </button>
        <button type="button" onClick={() => setPicker(true)} className="grid aspect-[4/3] place-items-center rounded-2xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-accent hover:text-accent">
          <span className="flex flex-col items-center gap-1"><Images className="h-5 w-5" />من المكتبة</span>
        </button>
      </div>
      {err && <div className="mt-2 text-xs text-red-600">{err}</div>}
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={async (e) => { if (e.target.files?.length) { const u = await upload(e.target.files); emit([...urls, ...u]); } e.target.value = ""; }} />
      <MediaPicker open={picker} multiple onClose={() => setPicker(false)} onPick={(u) => emit([...urls, ...u])} />
    </div>
  );
}

/* ------------------------------- lists ---------------------------------- */

function TagsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const list = Array.isArray(value) ? value : [];
  return <ListEditor items={list} onChange={onChange} render={(v, set) => <TextInput value={v} onChange={set} />} empty="" />;
}

function ListEditor<T>({ items, onChange, render, empty }: { items: T[]; onChange: (v: T[]) => void; render: (v: T, set: (v: T) => void) => ReactNode; empty: T }) {
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const n = items.slice();
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="min-w-0 flex-1">{render(it, (v) => onChange(items.map((x, k) => (k === i ? v : x))))}</div>
          <div className="flex shrink-0 items-center gap-0.5 pt-1.5">
            <button type="button" onClick={() => move(i, -1)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted" aria-label="لفوق"><ArrowUp className="h-4 w-4" /></button>
            <button type="button" onClick={() => move(i, 1)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted" aria-label="لتحت"><ArrowDown className="h-4 w-4" /></button>
            <button type="button" onClick={() => onChange(items.filter((_, k) => k !== i))} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" aria-label="حذف"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, structuredClone(empty)])} className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:border-accent hover:text-accent">
        <Plus className="h-3.5 w-3.5" /> إضافة
      </button>
    </div>
  );
}

function BiListInput({ value, onChange }: { value: { ar?: string[]; en?: string[] } | null; onChange: (v: any) => void }) {
  const v = value && typeof value === "object" ? value : {};
  const ar = (v.ar ?? []).join("\n");
  const en = (v.en ?? []).join("\n");
  const split = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
  return (
    <div>
      <BiInput multiline ar={ar} en={en} onAr={(s) => onChange({ ...v, ar: split(s) })} onEn={(s) => onChange({ ...v, en: split(s) })} />
      <div className="mt-1 text-xs text-muted-foreground">كل سطر = نقطة</div>
    </div>
  );
}

function ColorsInput({ value, onChange }: { value: any[]; onChange: (v: any[]) => void }) {
  const list = (Array.isArray(value) ? value : []).map((c) => (typeof c === "string" ? c : c?.hex)).filter(Boolean) as string[];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {list.map((c, i) => (
        <div key={i} className="flex items-center gap-1.5 rounded-full border border-border bg-background py-1 ps-1 pe-2">
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(c) ? c : "#000000"} onChange={(e) => onChange(list.map((x, k) => (k === i ? e.target.value : x)))} className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent p-0" />
          <input dir="ltr" value={c} onChange={(e) => onChange(list.map((x, k) => (k === i ? e.target.value : x)))} className="w-20 bg-transparent font-mono text-xs uppercase focus:outline-none" />
          <button type="button" onClick={() => onChange(list.filter((_, k) => k !== i))} className="text-muted-foreground hover:text-red-600" aria-label="حذف"><X className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...list, "#FF4848"])} className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-accent hover:text-accent"><Plus className="h-3.5 w-3.5" /> لون</button>
    </div>
  );
}

/* ------------------------------ dispatcher ------------------------------ */

export type Options = { categories: { value: string; label: string }[]; insightCategories: { value: string; label: string }[] };

export function FieldEditor({ field, record, onChange, options }: { field: Field; record: any; onChange: (patch: Record<string, any>) => void; options: Options }) {
  const r = record ?? {};
  const f = field;
  const body = (() => {
    switch (f.type) {
      case "text":
      case "textarea":
      case "html":
      case "url": {
        const multi = f.type !== "text" && f.type !== "url";
        if ("bi" in f && f.bi)
          return <BiInput context={f.label} multiline={multi} mono={f.type === "html"} ar={r[`${f.key}_ar`] ?? ""} en={r[`${f.key}_en`] ?? ""} onAr={(v) => onChange({ [`${f.key}_ar`]: v })} onEn={(v) => onChange({ [`${f.key}_en`]: v })} />;
        return <TextInput multiline={multi} dir={f.type === "url" || ("dir" in f && f.dir) ? "ltr" : undefined} value={r[f.key] == null ? "" : String(r[f.key])} onChange={(v) => onChange({ [f.key]: f.type === "url" ? v || null : v })} />;
      }
      case "number":
        return <input type="number" dir="ltr" step="any" value={r[f.key] ?? ""} onChange={(e) => onChange({ [f.key]: e.target.value === "" ? null : Number(e.target.value) })} className={`${inputCls} max-w-[180px]`} />;
      case "toggle":
        return <Toggle checked={!!r[f.key]} onChange={(v) => onChange({ [f.key]: v })} />;
      case "select": {
        const opts = typeof f.options === "string" ? options[f.options] : f.options;
        return (
          <select value={r[f.key] ?? ""} onChange={(e) => onChange({ [f.key]: e.target.value || null })} className={`${inputCls} max-w-sm`}>
            <option value="">—</option>
            {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      }
      case "image":
        return <ImageInput value={r[f.key] ?? null} fit={f.fit} preserveOriginal={f.preserveOriginal} onChange={(v) => onChange({ [f.key]: v })} />;
      case "gallery":
        return <GalleryInput value={r[f.key]} onChange={(v) => onChange({ [f.key]: v })} />;
      case "tags":
        return <TagsInput value={r[f.key]} onChange={(v) => onChange({ [f.key]: v })} />;
      case "biList":
        return <BiListInput value={r[f.key]} onChange={(v) => onChange({ [f.key]: v })} />;
      case "pairList": {
        const list = Array.isArray(r[f.key]) ? r[f.key] : [];
        return <ListEditor items={list} onChange={(v) => onChange({ [f.key]: v })} empty={{ ar: "", en: "" }} render={(v: any, set) => <BiInput ar={v?.ar ?? ""} en={v?.en ?? ""} onAr={(x) => set({ ...v, ar: x })} onEn={(x) => set({ ...v, en: x })} />} />;
      }
      case "colors":
        return <ColorsInput value={r[f.key]} onChange={(v) => onChange({ [f.key]: v })} />;
      case "group": {
        const sub = r[f.key] ?? {};
        return (
          <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/40 p-4">
            {f.fields.map((sf) => (
              <FieldEditor key={sf.key} field={sf} record={sub} options={options} onChange={(patch) => onChange({ [f.key]: { ...sub, ...patch } })} />
            ))}
          </div>
        );
      }
    }
  })();
  return (
    <div>
      {f.label && <Label hint={"hint" in f ? f.hint : undefined}>{f.label}</Label>}
      {body}
    </div>
  );
}
