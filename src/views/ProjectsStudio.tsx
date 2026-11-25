import { useEffect, useMemo, useState } from "react";
import { useNavigate, getRouteApi } from "@tanstack/react-router";
import type { PortfolioDTO } from "@/lib/portfolio.functions";
import { SECTORS, OTHER_SECTOR, sectorOf } from "@/lib/sectors";
import { StudioPage, AR } from "@/components/studio-site";

/* /projects in the studio design: a title, one filter bar (service tabs + business
   sector), then the work split into one section per service (6 each, with "view all").
   Choosing a service shows that service alone, in one grid with "show more". Filters live in the URL
   (?cat=…&sector=…) and apply after hydration so the static HTML matches. */

type Filters = { sector: string; cat: string; country: string; year: string; tag: string; sort: "newest" | "oldest" | "featured" | "az" };
const EMPTY: Filters = { sector: "", cat: "", country: "", year: "", tag: "", sort: "newest" };
const routeApi = getRouteApi("/projects/");

const SERVICES: { key: string; label: string; desc: string }[] = [
  { key: "branding", label: "الهويات البصرية", desc: "شعار وألوان وخطوط ودليل استخدام كامل للعلامة." },
  { key: "profiles", label: "الملفات التعريفية", desc: "ملفات تعرض الشركة وخدماتها وأعمالها باحتراف." },
  { key: "social", label: "منشورات التواصل", desc: "حملات وتصاميم منشورات لمنصات التواصل." },
  { key: "presentations", label: "العروض التقديمية", desc: "عروض للمستثمرين والعملاء والفعاليات." },
  { key: "packaging", label: "التغليف", desc: "تصميم عبوات وملصقات المنتجات." },
  { key: "logos", label: "الشعارات", desc: "شعارات بنسخها المختلفة." },
];
const SERVICE_SHORT: Record<string, string> = {
  branding: "هوية بصرية",
  profiles: "ملف تعريفي",
  social: "منشورات تواصل",
  presentations: "عرض تقديمي",
  packaging: "تغليف",
  logos: "شعار",
};
const serviceLabel = (k: string) => SERVICES.find((s) => s.key === k)?.label ?? "";
const sectorLabel = (k: string) => (SECTORS.find((s) => s.key === k) ?? OTHER_SECTOR).ar;
const countLabel = (n: number) =>
  n === 1 ? "مشروع واحد" : n === 2 ? "مشروعان" : n <= 10 ? `${AR(n)} مشاريع` : `${AR(n)} مشروعًا`;
const projectHref = (p: PortfolioDTO) => `/projects/${p.category_slug ?? "branding"}/${p.slug}`;
// Identities first (service order), then featured, then the dashboard order.
const serviceRank = (k: string | null) => {
  const i = SERVICES.findIndex((s) => s.key === k);
  return i < 0 ? SERVICES.length : i;
};
const byFeatured = (a: PortfolioDTO, b: PortfolioDTO) =>
  serviceRank(a.category_slug) - serviceRank(b.category_slug) ||
  Number(b.featured) - Number(a.featured) ||
  a.sort_order - b.sort_order ||
  (b.published_at ?? "").localeCompare(a.published_at ?? "");

const PAGE = 12;
const PREVIEW = 6;

export function ProjectsStudio({ projects }: { projects: PortfolioDTO[] }) {
  const urlSearch = routeApi.useSearch() as Filters;
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const search = hydrated ? urlSearch : EMPTY;
  const navigate = useNavigate({ from: "/projects/" });
  const [shown, setShown] = useState(PAGE);

  const setFilters = (next: Partial<Filters>) => {
    setShown(PAGE);
    navigate({
      search: (prev: any) =>
        Object.fromEntries(Object.entries({ ...prev, ...next }).filter(([k, v]) => v && !(k === "sort" && v === "newest"))) as any,
      resetScroll: false,
    });
  };

  const services = useMemo(
    () => SERVICES.map((s) => ({ ...s, n: projects.filter((p) => p.category_slug === s.key).length })).filter((s) => s.n > 0),
    [projects],
  );
  // Sector counts follow the chosen service, so the menu never offers an empty result.
  const sectors = useMemo(() => {
    const pool = search.cat ? projects.filter((p) => p.category_slug === search.cat) : projects;
    const count = new Map<string, number>();
    for (const p of pool) count.set(sectorOf(p.industry), (count.get(sectorOf(p.industry)) ?? 0) + 1);
    const list = SECTORS.filter((s) => count.get(s.key)).map((s) => ({ key: s.key as string, n: count.get(s.key)! }));
    list.sort((a, b) => b.n - a.n);
    if (count.get("other")) list.push({ key: "other", n: count.get("other")! });
    return list;
  }, [projects, search.cat]);

  const results = useMemo(
    () =>
      projects
        .filter((p) => (!search.cat || p.category_slug === search.cat) && (!search.sector || sectorOf(p.industry) === search.sector))
        .sort(byFeatured),
    [projects, search.cat, search.sector],
  );
  const title = [search.cat ? serviceLabel(search.cat) : "كل الأعمال", search.sector && `في مجال ${sectorLabel(search.sector)}`]
    .filter(Boolean)
    .join(" ");
  const visible = results.slice(0, shown);

  return (
    <StudioPage active="work">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <section className="phead g">
        <h1 className="rv">الأعمال</h1>
        <div className="phead-foot rv">
          <p>هويات بصرية وملفات تعريفية لشركات في السعودية والخليج ومصر. اختر الخدمة أو مجال شركتك، وشاهد أعمالًا لشركات تشبه شركتك.</p>
          <span className="pcount">{countLabel(projects.length)}</span>
        </div>
      </section>

      <section className="browse g" id="browse" aria-label="تصفح الأعمال">
        <div className="fbar rv">
          <div className="tabs" role="group" aria-label="نوع الخدمة">
            <button type="button" aria-pressed={!search.cat} onClick={() => setFilters({ cat: "", sector: "" })}>
              الكل <span>{AR(projects.length)}</span>
            </button>
            {services.map((s) => (
              <button
                type="button"
                key={s.key}
                aria-pressed={search.cat === s.key}
                onClick={() => setFilters({ cat: s.key, sector: "" })}
              >
                {s.label} <span>{AR(s.n)}</span>
              </button>
            ))}
          </div>
          <label className="sect">
            <span>مجال شركتك</span>
            <select id="sector" value={search.sector} onChange={(e) => setFilters({ sector: e.target.value })}>
              <option value="">كل المجالات</option>
              {sectors.map((s) => (
                <option key={s.key} value={s.key}>
                  {sectorLabel(s.key)} ({AR(s.n)})
                </option>
              ))}
            </select>
          </label>
        </div>

        {(search.cat || search.sector) && (
          <div className="rhead">
            <h2>{title}</h2>
            <span aria-live="polite">{countLabel(results.length)}</span>
            <button type="button" className="clear" onClick={() => setFilters({ cat: "", sector: "" })}>
              إلغاء التصفية ✕
            </button>
          </div>
        )}

        {!results.length ? (
          <div className="empty">
            لا توجد أعمال بهذه التصفية حاليًا.
            <button type="button" className="pill" onClick={() => setFilters({ cat: "", sector: "" })}>اعرض كل الأعمال</button>
          </div>
        ) : search.cat ? (
          <>
            <div className="pgrid">
              {visible.map((p, i) => <Card key={p.slug} p={p} eager={i < 6} />)}
            </div>
            {results.length > shown && (
              <div className="morew">
                <button type="button" className="pill" onClick={() => setShown(shown + PAGE)}>
                  عرض المزيد <span>({AR(results.length - shown)} متبقٍ)</span>
                </button>
              </div>
            )}
          </>
        ) : (
          SERVICES.map((s) => {
            const items = results.filter((p) => p.category_slug === s.key);
            if (!items.length) return null;
            return (
              <section className="grp" key={s.key} aria-labelledby={`g-${s.key}`}>
                <div className="ghead">
                  <div>
                    <span className="gnum">{countLabel(items.length)}</span>
                    <h2 id={`g-${s.key}`}>{s.label}</h2>
                    <p>{s.desc}</p>
                  </div>
                  {items.length > PREVIEW && (
                    <button type="button" className="pill" onClick={() => { setFilters({ cat: s.key }); document.getElementById("browse")?.scrollIntoView({ block: "start" }); }}>
                      عرض الكل ({AR(items.length)}) ←
                    </button>
                  )}
                </div>
                <div className="pgrid">
                  {items.slice(0, PREVIEW).map((p, i) => <Card key={p.slug} p={p} eager={i < 3} />)}
                </div>
              </section>
            );
          })
        )}
      </section>
    </StudioPage>
  );
}

function Card({ p, eager }: { p: PortfolioDTO; eager: boolean }) {
  const sector = sectorOf(p.industry);
  return (
    <a className="pc" href={projectHref(p)}>
      <div className="im">
        {p.cover && <img src={p.cover} alt={p.name_ar} loading={eager ? "eager" : "lazy"} decoding="async" />}
      </div>
      <div className="pcap">
        <h3>{p.name_ar}</h3>
        {p.short_ar && <p>{p.short_ar}</p>}
        <small>
          {SERVICE_SHORT[p.category_slug ?? ""] ?? ""}
          {sector !== "other" && ` · ${sectorLabel(sector)}`}
          {p.year ? ` · ${AR(p.year)}` : ""}
        </small>
      </div>
    </a>
  );
}

const CSS = `
.yrh .phead{padding-top:clamp(130px,16vw,210px)}
.yrh .phead h1{font-family:var(--display);font-weight:700;font-size:clamp(64px,11vw,180px);line-height:1;letter-spacing:-.02em}
.yrh .phead-foot{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:end;margin-top:clamp(28px,4vw,48px)}
.yrh .phead-foot p{color:var(--ink-2);max-width:52ch;font-size:clamp(16px,1.3vw,19px)}
.yrh .pcount{font-family:var(--display);font-size:clamp(20px,1.8vw,26px);color:var(--muted);white-space:nowrap}

.yrh .browse{padding-top:clamp(56px,6vw,96px)}
.yrh .fbar{display:flex;justify-content:space-between;align-items:center;gap:16px 24px;flex-wrap:wrap;padding-block:14px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.yrh .tabs{display:flex;gap:6px;flex-wrap:wrap}
.yrh .tabs button{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 18px;border-radius:999px;border:1px solid transparent;font-size:15px;color:var(--ink-2);transition:all .25s}
.yrh .tabs button span{font-size:13px;color:var(--muted)}
.yrh .tabs button:hover{border-color:var(--line);color:var(--ink)}
.yrh .tabs button[aria-pressed="true"]{background:var(--ink);color:var(--bg);font-weight:700}
.yrh .tabs button[aria-pressed="true"] span{color:color-mix(in srgb,var(--bg) 70%,transparent)}
.yrh .sect{display:flex;align-items:center;gap:12px;font-size:14px;color:var(--muted)}
.yrh .sect select{appearance:none;-webkit-appearance:none;font:inherit;font-size:15px;color:var(--ink);background:var(--bg) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%233B1A1E' stroke-width='1.6'/%3E%3C/svg%3E") no-repeat left 16px center;border:1px solid var(--line);border-radius:999px;min-height:44px;padding:0 18px 0 42px;cursor:pointer}
.yrh .sect select:hover{border-color:var(--ink)}

.yrh .rhead{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin-top:clamp(40px,5vw,64px)}
.yrh .rhead h2{font-family:var(--display);font-weight:700;font-size:clamp(28px,3.2vw,48px);line-height:1.2}
.yrh .rhead>span{color:var(--muted);font-size:15px}
.yrh .clear{margin-inline-start:auto;font-size:14px;color:var(--acc-text);min-height:40px;padding:0 4px}
.yrh .clear:hover{text-decoration:underline}

.yrh .pgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(40px,4.4vw,64px) clamp(14px,1.6vw,24px);margin-top:clamp(24px,3vw,40px)}
.yrh .pc{display:block;min-width:0}
.yrh .pc .im{overflow:hidden;background:var(--bg-2);aspect-ratio:4/3}
.yrh .pc img{width:100%;height:100%;object-fit:cover;transition:transform 1s cubic-bezier(.2,.7,.2,1)}
.yrh .pc:hover img{transform:scale(1.04)}
.yrh .pcap{padding-top:14px;display:flex;flex-direction:column;gap:2px}
.yrh .pcap h3{font-family:var(--display);font-weight:700;font-size:clamp(20px,1.7vw,24px);line-height:1.35;transition:color .25s}
.yrh .pc:hover .pcap h3{color:var(--acc)}
.yrh .pcap p{color:var(--ink-2);font-size:15px;line-height:1.6;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.yrh .pcap small{color:var(--muted);font-size:14px}
.yrh .pill{display:inline-flex;align-items:center;gap:10px;height:54px;padding:0 28px;border-radius:999px;border:1px solid var(--line);font-weight:700;font-size:15px;transition:all .3s;white-space:nowrap}
.yrh .pill:hover{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.yrh .pill span{font-weight:400;opacity:.75}
.yrh .browse{scroll-margin-top:80px}
.yrh .grp{padding-top:clamp(56px,6vw,96px)}
.yrh .grp+.grp{margin-top:clamp(40px,5vw,72px);border-top:1px solid var(--line)}
.yrh .ghead{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap}
.yrh .gnum{font-size:14px;color:var(--muted)}
.yrh .ghead h2{font-family:var(--display);font-weight:700;font-size:clamp(32px,3.6vw,56px);line-height:1.15;margin-top:4px}
.yrh .ghead p{color:var(--ink-2);margin-top:8px;max-width:48ch}
.yrh .morew{display:flex;justify-content:center;margin-top:clamp(48px,6vw,80px)}
.yrh .empty{margin-top:32px;padding:56px 24px;border:1px dashed var(--line);display:flex;flex-direction:column;align-items:center;gap:20px;color:var(--ink-2);text-align:center}

@media (max-width:1000px){
  .yrh .pgrid{grid-template-columns:repeat(2,1fr)}
  .yrh .fbar{flex-direction:column;align-items:stretch}
  .yrh .tabs{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;margin-inline:calc(-1 * var(--gut));padding-inline:var(--gut)}
  .yrh .tabs::-webkit-scrollbar{display:none}
  .yrh .tabs button{flex:none;white-space:nowrap}
  .yrh .sect{width:100%}
  .yrh .sect select{flex:1;min-width:0;width:100%}
}
@media (max-width:640px){
  .yrh .pgrid{grid-template-columns:1fr}
  .yrh .grp .pc:nth-child(n+5){display:none}
  .yrh .ghead .pill{width:100%;justify-content:center}
  .yrh .phead-foot{grid-template-columns:1fr}
  .yrh .clear{margin-inline-start:0}
}
`;
