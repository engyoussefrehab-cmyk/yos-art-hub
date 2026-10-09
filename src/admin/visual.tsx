import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Monitor, MousePointerClick, Navigation, RefreshCw, Smartphone, X } from "lucide-react";
import { useAdmin } from "./store";
import { COLLECTIONS, TEXTS_FILE, type Collection, type Field } from "./schema";
import { BiInput, FieldEditor, type Options } from "./fields";

/* ------------------------------------------------------------------------
 * Visual editor: the real site in a frame. Hover shows what can be edited,
 * click opens it in the side panel, and every keystroke updates the preview.
 * ---------------------------------------------------------------------- */

type Target =
  | { kind: "dict"; key: string; keys?: string[] }
  | { kind: "field"; col: string; index: number | null; field: Field; itemTitle: string }
  | { kind: "image"; col: string; index: number | null; field: Field; itemTitle: string };

// whitespace-insensitive, and ignores decorative arrows/ticks around a label
const norm = (s: string) => s.replace(/\s+/g, " ").trim().replace(/^[←→↗↖↙↘✓✔•·\-–—\s]+|[←→↗↖↙↘✓✔•·\-–—\s]+$/g, "");
const TEXT_TYPES = new Set(["text", "textarea", "html", "url"]);

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
function flatFields(fields: Field[]): Field[] {
  return fields.flatMap((f) => (f.type === "group" ? [] : [f]));
}
function urlPath(u: string) {
  try {
    return decodeURI(new URL(u, "https://yrstudio.art").pathname);
  } catch {
    return u;
  }
}

function useIndex() {
  const { docs, get } = useAdmin();
  return useMemo(() => {
    const text = new Map<string, Target[]>();
    const images = new Map<string, Target[]>();
    const add = (m: Map<string, Target[]>, k: string, t: Target) => {
      if (!k) return;
      const arr = m.get(k) ?? [];
      if (!arr.some((x) => JSON.stringify(x) === JSON.stringify(t))) arr.push(t);
      m.set(k, arr);
    };
    const dict = get<Record<string, { ar: string; en: string }>>(TEXTS_FILE) ?? {};
    for (const [key, v] of Object.entries(dict)) {
      for (const s of [v.ar, v.en]) if (s) add(text, norm(s), { kind: "dict", key });
    }
    for (const col of COLLECTIONS) {
      const data = getAt(get(col.file), col.pointer);
      const rows: [any, number | null][] =
        col.kind === "list" ? (Array.isArray(data) ? data.map((r: any, i: number) => [r, i] as [any, number]) : []) : [[Array.isArray(data) ? data[col.index ?? 0] : data, Array.isArray(data) ? (col.index ?? 0) : null]];
      for (const [rec, index] of rows) {
        if (!rec) continue;
        const itemTitle = col.itemTitle?.(rec) || col.title;
        for (const f of flatFields(col.sections.flatMap((s) => s.fields))) {
          if (TEXT_TYPES.has(f.type)) {
            const keys = "bi" in f && f.bi ? [`${f.key}_ar`, `${f.key}_en`] : [f.key];
            for (const k of keys) {
              const v = rec[k];
              if (typeof v !== "string" || !v.trim()) continue;
              const t: Target = { kind: "field", col: col.id, index, field: f, itemTitle };
              add(text, norm(v), t);
              // bullet lists and multi-line texts are shown line by line on the site
              for (const line of v.split("\n")) add(text, norm(line.replace(/^[•\-\s]+/, "")), t);
            }
          } else if (f.type === "tags" && Array.isArray(rec[f.key])) {
            for (const v of rec[f.key]) if (typeof v === "string") add(text, norm(v), { kind: "field", col: col.id, index, field: f, itemTitle });
          } else if (f.type === "biList" && rec[f.key]) {
            for (const v of [...(rec[f.key].ar ?? []), ...(rec[f.key].en ?? [])]) add(text, norm(v), { kind: "field", col: col.id, index, field: f, itemTitle });
          } else if (f.type === "pairList" && Array.isArray(rec[f.key])) {
            for (const v of rec[f.key]) for (const s of [v?.ar, v?.en]) if (s) add(text, norm(s), { kind: "field", col: col.id, index, field: f, itemTitle });
          } else if (f.type === "image" && typeof rec[f.key] === "string") {
            add(images, urlPath(rec[f.key]), { kind: "image", col: col.id, index, field: f, itemTitle });
          } else if (f.type === "gallery" && Array.isArray(rec[f.key])) {
            for (const g of rec[f.key]) {
              const u = typeof g === "string" ? g : g?.url;
              if (u) add(images, urlPath(u), { kind: "image", col: col.id, index, field: f, itemTitle });
            }
          }
        }
      }
    }
    return { text, images };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docs]);
}


/** Same sentence used in several places → one editor that changes them all. */
function groupTargets(ts: Target[]): Target[] {
  const dicts = ts.filter((t) => t.kind === "dict") as { kind: "dict"; key: string }[];
  const rest = ts.filter((t) => t.kind !== "dict");
  return dicts.length ? [{ kind: "dict", key: dicts[0].key, keys: dicts.map((d) => d.key) }, ...rest] : rest;
}

const PAGES = [
  { path: "/", label: "الرئيسية" },
  { path: "/projects/", label: "المشاريع" },
  { path: "/packages/", label: "فئات الخدمات" },
  { path: "/contact/", label: "تواصل" },
  { path: "/insights/", label: "المقالات" },
  { path: "/en/", label: "English — Home" },
];

const STYLE = `
[data-yr-hover]{outline:2px dashed #FF4848!important;outline-offset:4px!important;cursor:pointer!important;border-radius:4px}
[data-yr-sel]{outline:3px solid #FF4848!important;outline-offset:4px!important;border-radius:4px;box-shadow:0 0 0 8px rgba(255,72,72,.12)!important}
img[data-yr-hover],img[data-yr-sel]{outline-offset:-3px!important}
`;

export function VisualEditor({ openInCollection }: { openInCollection: (colId: string, index: number | null) => void }) {
  const { get, set, isDirty, previewFor } = useAdmin();
  const index = useIndex();
  const frame = useRef<HTMLIFrameElement>(null);
  const [path, setPath] = useState(() => {
    try {
      return sessionStorage.getItem("yr_visual_path") || "/";
    } catch {
      return "/";
    }
  });
  const [device, setDevice] = useState<"desktop" | "mobile">(() => (typeof window !== "undefined" && window.innerWidth < 900 ? "mobile" : "desktop"));
  const [mode, setMode] = useState<"edit" | "browse">("edit");
  const [sel, setSel] = useState<{ targets: Target[]; text: string; el: Element | null; isImage: boolean } | null>(null);
  const [tab, setTab] = useState(0);
  const [frameKey, setFrameKey] = useState(0);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const indexRef = useRef(index);
  indexRef.current = index;

  const options: Options = useMemo(() => {
    const cats = get<any[]>("src/data/snapshot/project_categories.json") ?? [];
    const icats = get<any[]>("src/data/snapshot/insight_categories.json") ?? [];
    return { categories: cats.map((c) => ({ value: c.slug, label: c.name_ar })), insightCategories: icats.map((c) => ({ value: c.id, label: c.label_ar })) };
  }, [get]);

  const resolve = useCallback((start: Element | null, point?: { x: number; y: number; doc: Document }) => {
    // 1) the exact text under the pointer (handles buttons with icons, mixed spans…)
    if (point) {
      const d: any = point.doc;
      const range = d.caretRangeFromPoint?.(point.x, point.y);
      const node: Node | null = range?.startContainer ?? d.caretPositionFromPoint?.(point.x, point.y)?.offsetNode ?? null;
      if (node && node.nodeType === 3) {
        const txt = norm(node.nodeValue ?? "");
        const t = txt && indexRef.current.text.get(txt);
        if (t && t.length && node.parentElement) return { el: node.parentElement as Element, targets: t, text: txt, isImage: false };
      }
    }
    // 2) walk up from the element
    let el: Element | null = start;
    for (let depth = 0; el && depth < 6; depth++, el = el.parentElement) {
      if (el.tagName === "IMG") {
        const src = (el as HTMLImageElement).currentSrc || (el as HTMLImageElement).src;
        const t = indexRef.current.images.get(urlPath(src));
        if (t?.length) return { el, targets: t, text: urlPath(src), isImage: true };
        continue;
      }
      const txt = norm((el as HTMLElement).innerText ?? "");
      if (!txt || txt.length > 900) continue;
      const t = indexRef.current.text.get(txt);
      if (t?.length) return { el, targets: t, text: txt, isImage: false };
      // a single text child that matches (e.g. <a>label<svg/></a>)
      for (const n of Array.from(el.childNodes)) {
        if (n.nodeType !== 3) continue;
        const nt = norm(n.nodeValue ?? "");
        const tt = nt && indexRef.current.text.get(nt);
        if (tt && tt.length) return { el, targets: tt, text: nt, isImage: false };
      }
    }
    return null;
  }, []);

  // wire up the frame on every page load
  const onLoad = useCallback(() => {
    const win = frame.current?.contentWindow;
    const doc = frame.current?.contentDocument;
    if (!doc || !win) return;
    try {
      const p = win.location.pathname;
      setPath(p);
      sessionStorage.setItem("yr_visual_path", p);
    } catch {
      /* ignore */
    }
    const st = doc.createElement("style");
    st.textContent = STYLE;
    doc.head.appendChild(st);
    let hovered: Element | null = null;
    const clearHover = () => {
      hovered?.removeAttribute("data-yr-hover");
      hovered = null;
    };
    doc.addEventListener("mouseover", (e) => {
      if (modeRef.current !== "edit") return clearHover();
      const me = e as MouseEvent;
      const r = resolve(e.target as Element, { x: me.clientX, y: me.clientY, doc });
      if (r?.el === hovered) return;
      clearHover();
      if (r) {
        hovered = r.el;
        r.el.setAttribute("data-yr-hover", "");
      }
    });
    doc.addEventListener("mouseleave", clearHover);
    doc.addEventListener(
      "click",
      (e) => {
        if (modeRef.current !== "edit") return;
        e.preventDefault();
        e.stopPropagation();
        const me = e as MouseEvent;
        const r = resolve(e.target as Element, { x: me.clientX, y: me.clientY, doc });
        doc.querySelectorAll("[data-yr-sel]").forEach((x) => x.removeAttribute("data-yr-sel"));
        if (r) {
          r.el.setAttribute("data-yr-sel", "");
          setSel({ ...r, targets: groupTargets(r.targets) });
        } else setSel({ targets: [], text: norm((e.target as HTMLElement).innerText ?? "").slice(0, 80), el: null, isImage: false });
        setTab(0);
      },
      true,
    );
    // forms on the preview should never send anything
    doc.addEventListener("submit", (e) => e.preventDefault(), true);
  }, [resolve]);

  const go = (p: string) => {
    setSel(null);
    setPath(p);
    setFrameKey((k) => k + 1);
    try {
      sessionStorage.setItem("yr_visual_path", p);
    } catch {
      /* ignore */
    }
  };

  /* live preview: swap the old text for the new one inside the selected element */
  const patchPreview = (oldText: string, newText: string) => {
    const el = sel?.el;
    if (!el || !oldText) return;
    const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    const hit = nodes.find((n) => norm(n.nodeValue ?? "") === norm(oldText)) ?? (nodes.length === 1 ? nodes[0] : null);
    if (hit) hit.nodeValue = newText;
    setSel((s) => (s ? { ...s, text: norm(newText) } : s));
  };

  const dict = get<Record<string, { ar: string; en: string }>>(TEXTS_FILE) ?? {};
  const t = sel?.targets[tab];
  const col: Collection | undefined = t && t.kind !== "dict" ? COLLECTIONS.find((c) => c.id === t.col) : undefined;
  const fileVal = col ? get<any>(col.file) : null;
  const colData = col ? getAt(fileVal, col.pointer) : null;
  const rec = col ? (Array.isArray(colData) ? colData[(t as any).index ?? 0] : colData) : null;
  const patchRec = (p: Record<string, any>) => {
    if (!col || !t || t.kind === "dict") return;
    const old = rec ?? {};
    // preview: find which string changed
    for (const [k, v] of Object.entries(p)) {
      if (typeof v === "string" && typeof old[k] === "string") {
        const oldLines = old[k].split("\n");
        const newLines = v.split("\n");
        const i = oldLines.findIndex((l: string, n: number) => l !== newLines[n]);
        if (oldLines.length === newLines.length && i >= 0 && norm(oldLines[i].replace(/^[•\-\s]+/, "")) === sel?.text) patchPreview(oldLines[i].replace(/^[•\-\s]+/, ""), newLines[i].replace(/^[•\-\s]+/, ""));
        else if (norm(old[k]) === sel?.text) patchPreview(old[k], v);
      }
      if (t.kind === "image" && typeof v === "string" && sel?.el?.tagName === "IMG") {
        const img = sel.el as HTMLImageElement;
        img.removeAttribute("srcset");
        img.src = previewFor(v) ?? v;
      }
    }
    const next = { ...old, ...p };
    const nextData = Array.isArray(colData) ? colData.map((x: any, i: number) => (i === ((t as any).index ?? 0) ? next : x)) : next;
    set(col.file, setAt(fileVal, col.pointer, nextData));
  };

  const width = device === "mobile" ? 390 : undefined;

  return (
    <div className="-mx-4 -mt-6 flex h-[calc(100vh-4rem)] flex-col sm:-mx-8 sm:-mt-8 lg:flex-row">
      {/* preview */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#ececec]">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-background px-3 py-2">
          <select value={PAGES.some((p) => p.path === path) ? path : ""} onChange={(e) => e.target.value && go(e.target.value)} className="rounded-full border border-border bg-background px-3 py-1.5 text-sm">
            {!PAGES.some((p) => p.path === path) && <option value="">{decodeURI(path)}</option>}
            {PAGES.map((p) => <option key={p.path} value={p.path}>{p.label}</option>)}
          </select>
          <div className="inline-flex rounded-full border border-border bg-muted p-0.5 text-xs font-semibold">
            <button type="button" onClick={() => setMode("edit")} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${mode === "edit" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}><MousePointerClick className="h-3.5 w-3.5" /> تعديل</button>
            <button type="button" onClick={() => { setMode("browse"); setSel(null); }} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${mode === "browse" ? "bg-ink text-white" : "text-muted-foreground"}`}><Navigation className="h-3.5 w-3.5" /> تصفّح</button>
          </div>
          <div className="inline-flex rounded-full border border-border bg-muted p-0.5">
            <button type="button" onClick={() => setDevice("desktop")} className={`rounded-full p-1.5 ${device === "desktop" ? "bg-background shadow-sm" : "text-muted-foreground"}`} aria-label="كمبيوتر"><Monitor className="h-4 w-4" /></button>
            <button type="button" onClick={() => setDevice("mobile")} className={`rounded-full p-1.5 ${device === "mobile" ? "bg-background shadow-sm" : "text-muted-foreground"}`} aria-label="موبايل"><Smartphone className="h-4 w-4" /></button>
          </div>
          <button type="button" onClick={() => go(path)} className="rounded-full p-2 text-muted-foreground hover:bg-muted" title="تحديث المعاينة"><RefreshCw className="h-4 w-4" /></button>
          <a href={path} target="_blank" rel="noreferrer" className="ms-auto hidden items-center gap-1 text-xs text-muted-foreground hover:text-foreground sm:inline-flex"><ExternalLink className="h-3.5 w-3.5" /> فتح الصفحة</a>
        </div>
        <div className="flex min-h-0 flex-1 justify-center overflow-auto p-0 sm:p-4">
          <iframe
            key={frameKey}
            ref={frame}
            src={path}
            onLoad={onLoad}
            title="معاينة الموقع"
            className={`h-full bg-white ${device === "mobile" ? "rounded-[28px] border-[10px] border-ink shadow-2xl" : "w-full sm:rounded-xl sm:shadow-lg"}`}
            style={width ? { width: width + 20, minHeight: 640 } : undefined}
          />
        </div>
      </div>

      {/* side panel */}
      <aside className="max-h-[48vh] shrink-0 overflow-y-auto border-t border-border bg-card lg:max-h-none lg:w-[400px] lg:border-s lg:border-t-0">
        {!sel ? (
          <div className="p-6 text-sm leading-relaxed text-muted-foreground">
            <div className="mb-3 font-display text-lg font-bold text-foreground">المحرر المرئي</div>
            {mode === "edit" ? (
              <>
                <p>عدّي بالماوس على الموقع — أي حاجة يتعمل حواليها <span className="font-semibold text-accent">إطار أحمر</span> تقدر تعدّلها. دوس عليها وهتظهر هنا.</p>
                <p className="mt-3">عايز تروح صفحة تانية؟ اختارها من فوق، أو حوّل لـ <b>تصفّح</b> ودوس على اللينكات عادي، وبعدين ارجع لـ <b>تعديل</b>.</p>
                <p className="mt-3">التعديل بيظهر في المعاينة على طول، وبيتنشر على الموقع لما تدوس <b>نشر التعديلات</b>.</p>
              </>
            ) : (
              <p>وضع التصفّح: اللينكات شغّالة. ارجع لـ <b>تعديل</b> عشان تدوس على أي نص.</p>
            )}
          </div>
        ) : (
          <div className="p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-accent">{sel.isImage ? "صورة" : "نص"}</div>
                {!sel.isImage && <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">«{sel.text}»</div>}
              </div>
              <button type="button" onClick={() => { setSel(null); frame.current?.contentDocument?.querySelectorAll("[data-yr-sel]").forEach((x) => x.removeAttribute("data-yr-sel")); }} className="rounded-full p-1.5 hover:bg-muted" aria-label="إغلاق"><X className="h-4 w-4" /></button>
            </div>

            {sel.targets.length === 0 && (
              <div className="rounded-2xl bg-muted p-4 text-sm leading-relaxed text-muted-foreground">
                الجزء ده مش نص ثابت لوحده (غالبًا مكوّن من أكتر من حتة، أو رقم بيتحسب تلقائي). دوس على كلمة أصغر جواه، أو دوّر عليه في <b>نصوص الموقع</b>.
              </div>
            )}

            {sel.targets.length > 1 && (
              <div className="mb-4">
                <div className="mb-1.5 text-xs text-muted-foreground">النص ده موجود في أكتر من مكان — اختار اللي عايز تعدّله:</div>
                <div className="flex flex-wrap gap-1.5">
                  {sel.targets.map((x, i) => (
                    <button key={i} type="button" onClick={() => setTab(i)} className={`rounded-full px-3 py-1 text-xs font-semibold ${i === tab ? "bg-ink text-white" : "border border-border"}`}>
                      {x.kind === "dict" ? "نص عام في الموقع" : `${COLLECTIONS.find((c) => c.id === x.col)?.title.split(" — ")[0]}: ${x.itemTitle}`.slice(0, 40)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {t?.kind === "dict" && dict[t.key] && (() => {
              const keys = (t.keys ?? [t.key]).filter((k) => dict[k]);
              const write = (lang: "ar" | "en", v: string) => {
                const next = { ...dict };
                for (const k of keys) next[k] = { ...next[k], [lang]: v };
                set(TEXTS_FILE, next);
              };
              return (
                <div>
                  <div className="mb-2 text-xs text-muted-foreground">نصوص الموقع {isDirty(TEXTS_FILE) && "· فيه تعديل"}</div>
                  <BiInput
                    key={keys.join(",")}
                    context="site text"
                    multiline
                    ar={dict[t.key].ar}
                    en={dict[t.key].en}
                    onAr={(v) => { if (norm(dict[t.key].ar) === sel.text) patchPreview(dict[t.key].ar, v); write("ar", v); }}
                    onEn={(v) => { if (norm(dict[t.key].en) === sel.text) patchPreview(dict[t.key].en, v); write("en", v); }}
                  />
                  <div className="mt-2 text-xs text-muted-foreground">
                    {keys.length > 1 ? `الجملة دي موجودة في ${keys.length} أماكن في الموقع — هتتغيّر فيهم كلهم.` : "بيتغيّر في كل مكان الجملة دي ظاهرة فيه."}
                  </div>
                </div>
              );
            })()}

            {t && t.kind !== "dict" && col && rec && (
              <div>
                <div className="mb-3 rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                  {col.title} · <b className="text-foreground">{t.itemTitle}</b>
                </div>
                <FieldEditor key={`${t.col}-${t.index}-${t.field.key}`} field={t.field} record={rec} options={options} onChange={patchRec} />
                {col.kind === "list" && (
                  <button type="button" onClick={() => openInCollection(col.id, t.index)} className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold hover:border-foreground/30">
                    افتح كل بيانات «{t.itemTitle.slice(0, 24)}»
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
