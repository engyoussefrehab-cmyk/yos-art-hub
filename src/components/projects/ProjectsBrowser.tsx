/*
 * Projects browser on /projects.
 *
 * One filter bar (service type tabs + business sector chips). With no filter
 * the work is grouped by service: each group shows its strongest projects and
 * a "view all" button. With a filter, a single grid of the results.
 * Filters live in the URL (?cat=…&sector=…) and apply after hydration.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, getRouteApi } from "@tanstack/react-router";
import type { PortfolioDTO } from "@/lib/portfolio.functions";
import { SECTORS, OTHER_SECTOR, sectorOf } from "@/lib/sectors";
import { focusRing } from "@/components/studio";

export type ProjectFilters = {
  sector: string;
  cat: string;
  country: string;
  year: string;
  tag: string;
  sort: "newest" | "oldest" | "featured" | "az";
};

/** Services in display order, with a one-line description. */
const SERVICES: { key: string; label: string; desc: string }[] = [
  { key: "branding", label: "الهويات البصرية", desc: "شعار وألوان وخطوط ودليل استخدام كامل للعلامة." },
  { key: "profiles", label: "الملفات التعريفية", desc: "ملفات تعرض الشركة وخدماتها وأعمالها باحتراف." },
  { key: "social", label: "منشورات التواصل", desc: "حملات وتصاميم منشورات لمنصات التواصل." },
  { key: "presentations", label: "العروض التقديمية", desc: "عروض للمستثمرين والعملاء والفعاليات." },
  { key: "packaging", label: "التغليف", desc: "تصميم عبوات وملصقات المنتجات." },
  { key: "logos", label: "الشعارات", desc: "شعارات بنسخها المختلفة." },
];
const serviceLabel = (k: string | null) => SERVICES.find((s) => s.key === k)?.label ?? "";
const sectorLabel = (k: string) => (SECTORS.find((s) => s.key === k) ?? OTHER_SECTOR).ar;

const PREVIEW = 6;
/** "3 مشاريع", "مشروعان", "15 مشروعا" … */
const countLabel = (n: number) =>
  n === 1 ? "مشروع واحد" : n === 2 ? "مشروعان" : n <= 10 ? `${n} مشاريع` : `${n} مشروعا`;
const projectHref = (p: PortfolioDTO): string => `/projects/${p.category_slug ?? "branding"}/${p.slug}`;
const EMPTY: ProjectFilters = { sector: "", cat: "", country: "", year: "", tag: "", sort: "newest" };

const byFeatured = (a: PortfolioDTO, b: PortfolioDTO) =>
  Number(b.featured) - Number(a.featured) ||
  a.sort_order - b.sort_order ||
  (b.published_at ?? "").localeCompare(a.published_at ?? "");

export function ProjectsBrowser({ projects, routeId }: { projects: PortfolioDTO[]; routeId: "/projects/" }) {
  const routeApi = getRouteApi(routeId);
  const urlSearch = routeApi.useSearch() as ProjectFilters;
  // The static HTML is built without filters; apply the URL's filters only
  // after the first client render so hydration matches the HTML.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const search = hydrated ? urlSearch : EMPTY;
  const navigate = useNavigate({ from: routeId });

  const setFilters = (next: Partial<ProjectFilters>, scroll = false) => {
    navigate({
      // Keep only the filters that are set, so the URL stays short.
      search: (prev: any) =>
        Object.fromEntries(Object.entries({ ...prev, ...next }).filter(([k, v]) => v && !(k === "sort" && v === "newest"))) as any,
      resetScroll: false,
    });
    if (scroll) document.getElementById("browse")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Services that have work (in display order) and sectors with counts.
  const services = useMemo(
    () =>
      SERVICES.map((s) => ({ ...s, n: projects.filter((p) => p.category_slug === s.key).length })).filter((s) => s.n > 0),
    [projects],
  );
  const sectors = useMemo(() => {
    const count = new Map<string, number>();
    for (const p of projects) {
      const k = sectorOf(p.industry);
      count.set(k, (count.get(k) ?? 0) + 1);
    }
    const list = SECTORS.filter((s) => count.get(s.key)).map((s) => ({ key: s.key as string, n: count.get(s.key)! }));
    list.sort((a, b) => b.n - a.n);
    if (count.get("other")) list.push({ key: "other", n: count.get("other")! });
    return list;
  }, [projects]);

  const filtering = !!(search.cat || search.sector);
  const results = useMemo(
    () =>
      projects
        .filter((p) => (!search.cat || p.category_slug === search.cat) && (!search.sector || sectorOf(p.industry) === search.sector))
        .sort(byFeatured),
    [projects, search.cat, search.sector],
  );

  const resultTitle = [serviceLabel(search.cat) || "كل الأعمال", search.sector && `في مجال ${sectorLabel(search.sector)}`]
    .filter(Boolean)
    .join(" ");

  return (
    <div id="browse" className="scroll-mt-24">
      {/* Filter bar */}
      <div className="rounded-[1.75rem] border border-white/10 bg-[#0b0b0b] p-5 md:p-8">
        <div className="text-xs font-semibold text-white/45">نوع الخدمة</div>
        <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden">
          <Tab active={!search.cat} onClick={() => setFilters({ cat: "" })} n={projects.length}>
            كل الأعمال
          </Tab>
          {services.map((s) => (
            <Tab key={s.key} active={search.cat === s.key} onClick={() => setFilters({ cat: s.key })} n={s.n}>
              {s.label}
            </Tab>
          ))}
        </div>

        <div className="mt-6 border-t border-white/10 pt-5 text-xs font-semibold text-white/45">مجال شركتك</div>
        <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden">
          {sectors.map((s) => {
            const on = search.sector === s.key;
            return (
              <button
                key={s.key}
                type="button"
                aria-pressed={on}
                onClick={() => setFilters({ sector: on ? "" : s.key })}
                className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${focusRing} ${
                  on ? "border-accent bg-accent font-semibold text-black" : "border-white/15 text-white/75 hover:border-white/45"
                }`}
              >
                {sectorLabel(s.key)}
                <span className={`text-xs ${on ? "text-black/60" : "text-white/40"}`}>{s.n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {filtering ? (
        /* Filtered: one grid */
        <section className="mt-14 md:mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold md:text-[2.25rem]">{resultTitle}</h2>
              <p className="mt-1 text-sm text-white/50">{countLabel(results.length)}</p>
            </div>
            <button
              type="button"
              onClick={() => setFilters({ cat: "", sector: "" })}
              className={`rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/60 ${focusRing}`}
            >
              ✕ إلغاء التصفية
            </button>
          </div>
          {results.length ? (
            <Grid items={results} />
          ) : (
            <div className="mt-8 rounded-[1.75rem] border border-dashed border-white/15 p-12 text-center text-white/60">
              لا توجد أعمال بهذه التصفية حاليا.
            </div>
          )}
        </section>
      ) : (
        /* Default: grouped by service */
        services.map((s, i) => {
          const items = projects.filter((p) => p.category_slug === s.key).sort(byFeatured);
          return (
            <section key={s.key} className={i === 0 ? "mt-14 md:mt-20" : "mt-20 border-t border-white/10 pt-14 md:mt-28 md:pt-20"}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-2xl">
                  <span className="text-sm font-semibold text-accent">
                    {String(i + 1).padStart(2, "0")} <span className="text-white/40">— {countLabel(s.n)}</span>
                  </span>
                  <h2 className="mt-2 font-display text-2xl font-bold md:text-[2.25rem]">{s.label}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{s.desc}</p>
                </div>
                {s.n > PREVIEW && (
                  <button
                    type="button"
                    onClick={() => setFilters({ cat: s.key }, true)}
                    className={`group inline-flex items-center gap-3 rounded-full border border-white/20 py-1.5 pe-1.5 ps-5 text-sm font-bold hover:border-white/60 ${focusRing}`}
                  >
                    عرض الكل ({s.n})
                    <span aria-hidden className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:-rotate-45">
                      ↖
                    </span>
                  </button>
                )}
              </div>
              <Grid items={items.slice(0, PREVIEW)} />
            </section>
          );
        })
      )}
    </div>
  );
}

function Tab({ active, onClick, n, children }: { active: boolean; onClick: () => void; n: number; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${focusRing} ${
        active ? "bg-white text-black" : "bg-white/[0.05] text-white/75 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
      <span className={`text-xs font-normal ${active ? "text-black/50" : "text-white/40"}`}>{n}</span>
    </button>
  );
}

function Grid({ items }: { items: PortfolioDTO[] }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
      {items.map((p) => (
        <Link key={p.slug} to={projectHref(p)} className={`group flex flex-col ${focusRing}`}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-white/5 sm:rounded-[1.75rem]">
            {p.cover && (
              <img
                src={p.cover}
                alt={p.name_ar}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <span
              aria-hidden
              className="absolute bottom-3 end-3 hidden h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:-rotate-45 sm:inline-flex"
            >
              ↖
            </span>
          </div>
          <div className="pt-3 sm:pt-4">
            <div className="hidden text-xs text-white/45 sm:block">
              {serviceLabel(p.category_slug)} · {sectorLabel(sectorOf(p.industry))}
            </div>
            <h3 className="font-display text-sm font-bold leading-snug transition-colors group-hover:text-accent sm:mt-1 sm:text-lg">
              {p.name_ar}
            </h3>
            {p.short_ar && <p className="mt-1 hidden text-sm text-white/55 line-clamp-2 sm:block">{p.short_ar}</p>}
          </div>
        </Link>
      ))}
    </div>
  );
}
