import { useMemo } from "react";
import { Link, useNavigate, getRouteApi } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import type { PortfolioDTO } from "@/lib/portfolio.functions";
import { X, ArrowUpRight, Search } from "lucide-react";

import { pair } from "@/i18n/dictionary";
import { SECTORS, OTHER_SECTOR, sectorOf } from "@/lib/sectors";
const CAT_LABELS: Record<string, { ar: string; en: string }> = {
  branding: { ar: pair("ui_latestprojectsslider_6")[0], en: pair("ui_latestprojectsslider_6")[1] },
  logos: { ar: pair("cat_logos_label")[0], en: pair("cat_logos_label")[1] },
  profiles: { ar: pair("cat_profiles_label")[0], en: pair("cat_profiles_label")[1] },
  social: { ar: pair("ptype_social")[0], en: pair("ptype_social")[1] },
  presentations: { ar: "العروض التقديمية", en: "Presentations" },
  packaging: { ar: "التغليف", en: "Packaging" },
};

export type ProjectFilters = {
  sector: string;
  cat: string;
  country: string;
  year: string;
  tag: string;
  sort: "newest" | "oldest" | "featured" | "az";
};

export function ProjectsBrowser({
  projects,
  routeId,
}: {
  projects: PortfolioDTO[];
  routeId: "/projects/";
}) {
  const { lang } = useLang();
  const routeApi = getRouteApi(routeId);
  const search = routeApi.useSearch() as ProjectFilters;
  const navigate = useNavigate({ from: routeId });

  const isAr = lang === "ar";
  const t = (ar: string, en: string) => (isAr ? ar : en);

  const countries = useMemo(
    () => Array.from(new Set(projects.map((p) => p.country).filter(Boolean) as string[])).sort(),
    [projects],
  );
  const years = useMemo(
    () =>
      Array.from(new Set(projects.map((p) => p.year).filter(Boolean) as number[])).sort(
        (a, b) => b - a,
      ),
    [projects],
  );
  const tags = useMemo(
    () => Array.from(new Set(projects.flatMap((p) => p.tags))).sort(),
    [projects],
  );
  const cats = useMemo(
    () => Array.from(new Set(projects.map((p) => p.category_slug).filter(Boolean) as string[])),
    [projects],
  );

  // Business sectors that have work, with counts (biggest first).
  const sectors = useMemo(() => {
    const count = new Map<string, number>();
    for (const p of projects)
      count.set(sectorOf(p.industry), (count.get(sectorOf(p.industry)) ?? 0) + 1);
    const list = SECTORS.filter((s) => count.get(s.key)).map((s) => ({
      key: s.key,
      label: s[isAr ? "ar" : "en"],
      n: count.get(s.key)!,
    }));
    list.sort((a, b) => b.n - a.n);
    if (count.get("other"))
      list.push({ key: "other", label: OTHER_SECTOR[isAr ? "ar" : "en"], n: count.get("other")! });
    return list;
  }, [projects, isAr]);

  const filtered = useMemo(() => {
    let arr = projects.slice();
    if (search.sector) arr = arr.filter((p) => sectorOf(p.industry) === search.sector);
    if (search.cat) arr = arr.filter((p) => p.category_slug === search.cat);
    if (search.country) arr = arr.filter((p) => p.country === search.country);
    if (search.year) arr = arr.filter((p) => String(p.year) === search.year);
    if (search.tag) arr = arr.filter((p) => p.tags.includes(search.tag));
    switch (search.sort) {
      case "oldest":
        arr.sort((a, b) => (a.published_at ?? "").localeCompare(b.published_at ?? ""));
        break;
      case "featured":
        arr.sort((a, b) => Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order);
        break;
      case "az":
        arr.sort((a, b) =>
          (isAr ? a.name_ar : a.name_en).localeCompare(isAr ? b.name_ar : b.name_en),
        );
        break;
      case "newest":
      default:
        arr.sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
    }
    return arr;
  }, [projects, search, isAr]);

  const setParam = (key: keyof ProjectFilters, value: string) =>
    navigate({ search: (prev: any) => ({ ...prev, [key]: value }), resetScroll: false });
  const reset = () =>
    navigate({
      search: () =>
        ({ sector: "", cat: "", country: "", year: "", tag: "", sort: "newest" }) as any,
      resetScroll: false,
    });

  const active =
    !!(search.sector || search.cat || search.country || search.year || search.tag) ||
    search.sort !== "newest";
  const projectHref = (p: PortfolioDTO) =>`/projects/${p.category_slug ?? "branding"}/${p.slug}`;

  return (
    <div id="browse" className="scroll-mt-24">
      {/* Step 1: the client's own business sector */}
      <div className="-mx-6 border-y border-border bg-cream/60 px-6 py-5 sm:mx-0 sm:rounded-3xl sm:border md:p-8">
        <h2 className="font-display text-2xl font-bold md:text-3xl">
          {t("ما مجال شركتك؟", "What does your company do?")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t(
            "اختر مجالك لترى أعمالا لشركات تشبه شركتك.",
            "Pick your field to see work for companies like yours.",
          )}
        </p>
        <div className="mt-4 -mx-6 flex snap-x gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {sectors.map((sec) => {
            const on = search.sector === sec.key;
            return (
              <button
                key={sec.key}
                type="button"
                aria-pressed={on}
                onClick={() => setParam("sector", on ? "" : sec.key)}
                className={`flex shrink-0 snap-start items-center justify-between gap-3 whitespace-nowrap rounded-full border px-4 py-2.5 text-start text-sm font-semibold transition-colors sm:rounded-2xl sm:py-3 ${
                  on
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background hover:border-foreground/40"
                }`}
              >
                <span>{sec.label}</span>
                <span
                  className={`text-xs font-normal ${on ? "text-background/70" : "text-muted-foreground"}`}
                >
                  {sec.n}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3 sm:mt-10">
        <div>
          <h2 className="font-display text-xl font-bold sm:text-2xl md:text-3xl">
            {search.sector
              ? `${t("أعمال في مجال", "Work in")} ${sectors.find((x) => x.key === search.sector)?.label ?? ""}`
              : t("كل الأعمال", "All work")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("ويمكنك التصفية حسب نوع الخدمة:", "You can also filter by service:")}
          </p>
        </div>
        {active && (
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-cream/60 px-4 py-2 text-sm">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-semibold text-foreground">{filtered.length}</span>
            <span className="text-muted-foreground">{t(...pair("projects_results_count"))}</span>
          </div>
        )}
      </div>

      {/* Category chips */}
      <div className="mt-4 -mx-6 flex snap-x gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <CatChip active={!search.cat} onClick={() => setParam("cat", "")}>
          {t("كل الخدمات", "All services")}
        </CatChip>
        {cats.map((c) => (
          <CatChip key={c} active={search.cat === c} onClick={() => setParam("cat", c)}>
            {CAT_LABELS[c]?.[isAr ? "ar" : "en"] ?? c}
          </CatChip>
        ))}
      </div>

      {/* Advanced filters — tucked away; most clients only need sector + service */}
      <details className="mt-4 rounded-2xl border border-border/70 bg-cream/50 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-muted-foreground">
          {t("فلاتر إضافية", "More filters")}
        </summary>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <FilterSelect
            label={t(...pair("ui_projectsbrowser_4"))}
            value={search.country}
            onChange={(v) => setParam("country", v)}
            options={[
              ["", t(...pair("ui_projectsbrowser_5"))],
              ...countries.map((c) => [c, c] as [string, string]),
            ]}
          />
          <FilterSelect
            label={t(...pair("proj_year"))}
            value={search.year}
            onChange={(v) => setParam("year", v)}
            options={[
              ["", t(...pair("ui_projectsbrowser_6"))],
              ...years.map((y) => [String(y), String(y)] as [string, string]),
            ]}
          />
          <FilterSelect
            label={t(...pair("ui_projectsbrowser_7"))}
            value={search.tag}
            onChange={(v) => setParam("tag", v)}
            options={[
              ["", t(...pair("ui_projectsbrowser_8"))],
              ...tags.map((tg) => [tg, tg] as [string, string]),
            ]}
          />
          <FilterSelect
            label={t(...pair("ui_projectsbrowser_9"))}
            value={search.sort}
            onChange={(v) => setParam("sort", v)}
            options={[
              ["newest", t(...pair("ui_projectsbrowser_10"))],
              ["oldest", t(...pair("ui_projectsbrowser_11"))],
              ["featured", t(...pair("ui_projectsbrowser_12"))],
              ["az", t(...pair("ui_projectsbrowser_13"))],
            ]}
          />
          {active && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 self-end rounded-full border border-border/60 bg-background px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground md:col-span-4 md:w-max"
            >
              <X className="h-3.5 w-3.5" />
              {t(...pair("ui_projectsbrowser_14"))}
            </button>
          )}
        </div>
      </details>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border/70 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          <p className="mt-4 text-muted-foreground">{t(...pair("ui_projectsbrowser_15"))}</p>
          <button
            onClick={reset}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
            {t(...pair("ui_projectsbrowser_14"))}
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-6 lg:grid-cols-3">
          {filtered.map((p) => {
            const name = isAr ? p.name_ar : p.name_en;
            const short = isAr ? p.short_ar : p.short_en;
            return (
              <Link
                key={p.slug}
                to={projectHref(p)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-cream transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {p.cover && (
                    <img
                      src={p.cover}
                      alt={name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                  )}
                  {p.featured && (
                    <span className="absolute end-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent-foreground shadow-sm">
                      {t(...pair("ui_latestprojectsslider_5"))}
                    </span>
                  )}
                  <span className="absolute bottom-3 end-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm backdrop-blur transition-all duration-500 group-hover:opacity-100">
                    <ArrowUpRight className={`h-4 w-4 ${isAr ? "-scale-x-100" : ""}`} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-3 sm:p-5">
                  <div className="hidden items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground sm:flex">
                    {p.category_slug && (
                      <span>
                        {CAT_LABELS[p.category_slug]?.[isAr ? "ar" : "en"] ?? p.category_slug}
                      </span>
                    )}
                    {p.year && <span>· {p.year}</span>}
                    <span>
                      ·{" "}
                      {
                        (SECTORS.find((x) => x.key === sectorOf(p.industry)) ?? OTHER_SECTOR)[
                          isAr ? "ar" : "en"
                        ]
                      }
                    </span>
                  </div>
                  <h3 className="font-display text-sm font-bold leading-snug transition-colors group-hover:text-accent sm:mt-2 sm:text-xl">
                    {name}
                  </h3>
                  {short && (
                    <p className="mt-1 hidden text-sm text-muted-foreground line-clamp-2 sm:block">
                      {short}
                    </p>
                  )}
                  {p.tags.length > 0 && (
                    <div className="mt-3 hidden flex-wrap gap-1 sm:flex">
                      {p.tags.slice(0, 3).map((tg) => (
                        <span
                          key={tg}
                          className="rounded-full bg-background px-2 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {tg}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CatChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 snap-start whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
        active
          ? "border-accent bg-accent text-accent-foreground shadow-sm"
          : "border-border bg-background text-muted-foreground hover:border-accent/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="grid gap-1.5 text-xs font-medium">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
