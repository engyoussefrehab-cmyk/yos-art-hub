import { useMemo } from "react";
import { Link, useNavigate, getRouteApi } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import type { PortfolioDTO } from "@/lib/portfolio.functions";
import { X } from "lucide-react";

const CAT_LABELS: Record<string, { ar: string; en: string }> = {
  branding: { ar: "الهوية البصرية", en: "Brand Identity" },
  logos: { ar: "الشعارات", en: "Logos" },
  profiles: { ar: "ملفات الشركات", en: "Company Profiles" },
  social: { ar: "سوشيال ميديا", en: "Social Media" },
};

export type ProjectFilters = {
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
  routeId: "/projects/" | "/en/projects/";
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
    () => Array.from(new Set(projects.map((p) => p.year).filter(Boolean) as number[])).sort((a, b) => b - a),
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

  const filtered = useMemo(() => {
    let arr = projects.slice();
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
        arr.sort((a, b) => (isAr ? a.name_ar : a.name_en).localeCompare(isAr ? b.name_ar : b.name_en));
        break;
      case "newest":
      default:
        arr.sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
    }
    return arr;
  }, [projects, search, isAr]);

  const setParam = (key: keyof ProjectFilters, value: string) =>
    navigate({ search: (prev: any) => ({ ...prev, [key]: value }) });
  const reset = () =>
    navigate({ search: () => ({ cat: "", country: "", year: "", tag: "", sort: "newest" }) as any });

  const active = !!(search.cat || search.country || search.year || search.tag) || search.sort !== "newest";
  const projectHref = (p: PortfolioDTO) =>
    isAr
      ? `/projects/${p.category_slug ?? "branding"}/${p.slug}`
      : `/en/projects/${p.category_slug ?? "branding"}/${p.slug}`;

  return (
    <div className="mt-20">
      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border/70 pt-10">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-accent">
            {t("استكشاف كل الأعمال", "Browse all work")}
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            {t("فلاتر متقدمة", "Advanced filters")}
          </h2>
        </div>
        <div className="text-sm text-muted-foreground">
          {filtered.length} {t("مشروع", "projects")}
        </div>
      </div>

      <div className="mt-6 grid gap-3 rounded-2xl border border-border/70 bg-cream/50 p-4 md:grid-cols-5">
        <FilterSelect
          label={t("التصنيف", "Category")}
          value={search.cat}
          onChange={(v) => setParam("cat", v)}
          options={[
            ["", t("الكل", "All")],
            ...cats.map((c) => [c, CAT_LABELS[c]?.[isAr ? "ar" : "en"] ?? c] as [string, string]),
          ]}
        />
        <FilterSelect
          label={t("البلد", "Country")}
          value={search.country}
          onChange={(v) => setParam("country", v)}
          options={[["", t("كل البلدان", "All countries")], ...countries.map((c) => [c, c] as [string, string])]}
        />
        <FilterSelect
          label={t("السنة", "Year")}
          value={search.year}
          onChange={(v) => setParam("year", v)}
          options={[["", t("كل السنوات", "All years")], ...years.map((y) => [String(y), String(y)] as [string, string])]}
        />
        <FilterSelect
          label={t("الوسوم", "Tag")}
          value={search.tag}
          onChange={(v) => setParam("tag", v)}
          options={[["", t("كل الوسوم", "All tags")], ...tags.map((tg) => [tg, tg] as [string, string])]}
        />
        <FilterSelect
          label={t("الترتيب", "Sort")}
          value={search.sort}
          onChange={(v) => setParam("sort", v)}
          options={[
            ["newest", t("الأحدث", "Newest")],
            ["oldest", t("الأقدم", "Oldest")],
            ["featured", t("المميّز أولًا", "Featured first")],
            ["az", t("أبجديًا", "A → Z")],
          ]}
        />
        {active && (
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 self-end rounded-full border border-border/60 bg-background px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground md:col-span-5 md:w-max"
          >
            <X className="h-3.5 w-3.5" />
            {t("مسح الفلاتر", "Clear filters")}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border/70 p-12 text-center text-muted-foreground">
          {t("لا توجد نتائج مطابقة. جرّب تعديل الفلاتر.", "No results. Try adjusting the filters.")}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const name = isAr ? p.name_ar : p.name_en;
            const short = isAr ? p.short_ar : p.short_en;
            return (
              <Link
                key={p.slug}
                to={projectHref(p)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-cream transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  {p.cover && (
                    <img
                      src={p.cover}
                      alt={name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                    {p.category_slug && <span>{CAT_LABELS[p.category_slug]?.[isAr ? "ar" : "en"] ?? p.category_slug}</span>}
                    {p.year && <span>· {p.year}</span>}
                    {p.country && <span>· {p.country}</span>}
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold">{name}</h3>
                  {short && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{short}</p>}
                  {p.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {p.tags.slice(0, 3).map((tg) => (
                        <span key={tg} className="rounded-full bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
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

function FilterSelect({
  label, value, onChange, options,
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
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  );
}
