import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import { type InsightArticle, type InsightCategoryRow } from "@/lib/insights-types";

import { pair } from "@/i18n/dictionary";
import { StudioSectionHero, container } from "@/components/studio";
import { AR } from "@/components/studio-site";
import { InsightCard } from "@/components/InsightCard";
/** Score an article/category against a lowercase query. Higher = better. */
function scoreMatch(text: string, q: string): number {
  if (!q) return 0;
  const t = text.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 40;
  const idx = t.indexOf(q);
  if (idx === 0) return 30;
  if (idx > 0) return Math.max(1, 20 - Math.floor(idx / 5));
  return 0;
}

function articleScore(a: InsightArticle, q: string): number {
  if (!q) return 0;
  const title = scoreMatch(a.title_ar, q) + scoreMatch(a.title_en, q);
  const kw = (a.keywords ?? []).reduce((s, k) => s + scoreMatch(k, q) * 2, 0);
  const tags = (a.tags ?? []).reduce((s, k) => s + scoreMatch(k, q) * 1.5, 0);
  const excerpt = (scoreMatch(a.excerpt_ar, q) + scoreMatch(a.excerpt_en, q)) * 0.4;
  const cat = scoreMatch(a.category.label_ar, q) + scoreMatch(a.category.label_en, q);
  return title * 3 + kw + tags + excerpt + cat;
}

interface HubProps {
  categories: InsightCategoryRow[];
  articles: InsightArticle[];
}

export function InsightsHubView({ categories, articles }: HubProps) {
  const { lang } = useLang();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>("all");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement | null>(null);

  const featured = useMemo(
    () => articles.find((a) => a.featured) ?? articles[0] ?? null,
    [articles],
  );

  // Ranked matches — used by both the results grid and the suggestions dropdown
  const ranked = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const scored = articles
      .map((a) => ({ a, s: articleScore(a, q) }))
      .filter((x) => x.s > 0)
      .sort((x, y) => y.s - x.s);
    return scored;
  }, [articles, query]);

  const matchedCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as InsightCategoryRow[];
    return categories
      .map((c) => ({
        c,
        s: Math.max(scoreMatch(c.label_ar, q), scoreMatch(c.label_en, q), scoreMatch(c.slug, q)),
      }))
      .filter((x) => x.s > 0)
      .sort((x, y) => y.s - x.s)
      .slice(0, 4)
      .map((x) => x.c);
  }, [categories, query]);

  const filtered = useMemo(() => {
    let list: InsightArticle[];
    if (ranked) {
      list = ranked.map((r) => r.a);
    } else {
      list = articles;
    }
    if (active !== "all") list = list.filter((a) => a.category.slug === active);
    if (!query && active === "all" && featured) list = list.filter((a) => a.slug !== featured.slug);
    return list;
  }, [articles, ranked, query, active, featured]);

  const suggestions = useMemo(() => (ranked ?? []).slice(0, 5), [ranked]);

  // Close suggestion popover on outside click
  useEffect(() => {
    if (!suggestOpen) return;
    const onDown = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSuggestOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [suggestOpen]);

  const showSuggestions =
    suggestOpen &&
    query.trim().length > 0 &&
    (suggestions.length > 0 || matchedCategories.length > 0);

  return (
    <>
      <StudioSectionHero
        title={lang === "ar" ? pair("ui_insightshubview_3")[0] : pair("ui_insightshubview_3")[1]}
        intro={lang === "ar" ? pair("ui_insightshubview_4")[0] : pair("ui_insightshubview_4")[1]}
      >
        <div className="w-full max-w-2xl">
          <div ref={searchWrapRef} className="relative">
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 transition-colors focus-within:border-accent">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSuggestOpen(true);
                }}
                onFocus={() => setSuggestOpen(true)}
                placeholder={
                  lang === "ar" ? pair("ui_insightshubview_5")[0] : pair("ui_insightshubview_5")[1]
                }
                className="min-h-11 w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
                aria-label={
                  lang === "ar" ? pair("ui_insightshubview_6")[0] : pair("ui_insightshubview_6")[1]
                }
                aria-controls={showSuggestions ? "insights-suggestions" : undefined}
                onKeyDown={(event) => {
                  if (event.key === "Escape" || event.key === "Enter") setSuggestOpen(false);
                }}
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSuggestOpen(false);
                  }}
                  aria-label={
                    lang === "ar"
                      ? pair("ui_insightshubview_7")[0]
                      : pair("ui_insightshubview_7")[1]
                  }
                  className="grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-accent"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {showSuggestions && (
              <div
                id="insights-suggestions"
                role="region"
                aria-label="اقتراحات البحث"
                className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
              >
                {matchedCategories.length > 0 && (
                  <div className="border-b border-border/60 p-2">
                    <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {lang === "ar"
                        ? pair("ui_insightshubview_8")[0]
                        : pair("ui_insightshubview_8")[1]}
                    </div>
                    <div className="flex flex-wrap gap-1.5 p-2">
                      {matchedCategories.map((c) => (
                        <Link
                          key={c.slug}
                          to="/insights/$category" params={{ category: c.slug }}
                          onClick={() => setSuggestOpen(false)}
                          className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          #{lang === "ar" ? c.label_ar : c.label_en}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {suggestions.length > 0 ? (
                  <ul className="max-h-[min(45svh,20rem)] overflow-y-auto p-2">
                    {suggestions.map(({ a }) => (
                      <li key={a.id}>
                        <Link
                          to="/insights/$category/$slug" params={{ category: a.category.slug, slug: a.slug }}
                          onClick={() => setSuggestOpen(false)}
                          className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-accent/10"
                        >
                          <div
                            aria-hidden
                            className="mt-0.5 h-10 w-10 flex-shrink-0 rounded-md bg-cover bg-center bg-muted"
                            style={
                              a.cover_url ? { backgroundImage: `url(${a.cover_url})` } : undefined
                            }
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-foreground">
                              {lang === "ar" ? a.title_ar : a.title_en || a.title_ar}
                            </div>
                            <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                              {lang === "ar" ? a.category.label_ar : a.category.label_en}
                              {" · "}
                              {a.reading_minutes}{" "}
                              {lang === "ar"
                                ? pair("ui_insightscategoryview_4")[0]
                                : pair("ui_insightscategoryview_4")[1]}
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-4 text-center text-xs text-muted-foreground">
                    {lang === "ar"
                      ? pair("ui_insightshubview_9")[0]
                      : pair("ui_insightshubview_9")[1]}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <FilterChip active={active === "all"} onClick={() => setActive("all")}>
              {lang === "ar" ? pair("ui_insightshubview_10")[0] : pair("ui_insightshubview_10")[1]}
            </FilterChip>
            {categories.map((c) => (
              <FilterChip key={c.slug} active={active === c.slug} onClick={() => setActive(c.slug)}>
                {lang === "ar" ? c.label_ar : c.label_en}
              </FilterChip>
            ))}
          </div>
        </div>
      </StudioSectionHero>

      {!query && active === "all" && featured && (
        <section className={`${container} pt-9 md:pt-14`} aria-label="مقال مميز">
          <p className="mb-3 text-sm font-bold text-accent">{pair("ui_insightshubview_11")[0]}</p>
          <InsightCard article={featured} featured />
        </section>
      )}

      <section className={`${container} py-10 md:py-16`}>
        <div className="mb-10 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-[2.25rem]">
            {query || active !== "all"
              ? lang === "ar"
                ? pair("ui_insightshubview_12")[0]
                : pair("ui_insightshubview_12")[1]
              : lang === "ar"
                ? pair("ui_insightshubview_13")[0]
                : pair("ui_insightshubview_13")[1]}
          </h2>
          <span className="text-sm text-muted-foreground" aria-live="polite">
            {lang === "ar" ? AR(filtered.length) : filtered.length}{" "}
            {lang === "ar" ? "مقال" : filtered.length === 1 ? "article" : "articles"}
          </span>
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-20 text-center">
            <p className="text-muted-foreground">
              {articles.length === 0
                ? lang === "ar"
                  ? pair("ui_insightshubview_14")[0]
                  : pair("ui_insightshubview_14")[1]
                : lang === "ar"
                  ? pair("ui_insightshubview_15")[0]
                  : pair("ui_insightshubview_15")[1]}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {filtered.map((a) => (
              <InsightCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function FilterChip({
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
      aria-pressed={active}
      className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        active
          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
          : "border-border text-muted-foreground hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}
