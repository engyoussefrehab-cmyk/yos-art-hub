import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import { formatDate, type InsightArticle, type InsightCategoryRow } from "@/lib/insights-types";

import { pair } from "@/i18n/dictionary";
import { ColourField } from "@/components/studio";
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

function coverStyle(a: InsightArticle) {
  if (a.cover_url)
    return {
      backgroundImage: `url(${a.cover_url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  // Fallback gradient — derived from slug for visual variety
  const hash = Array.from(a.slug).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
  const hue = hash % 360;
  return {
    background: `linear-gradient(135deg, hsl(${hue} 45% 25%) 0%, hsl(${(hue + 40) % 360} 55% 40%) 100%)`,
  };
}

function Cover({ article, className }: { article: InsightArticle; className?: string }) {
  const { lang } = useLang();
  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      style={coverStyle(article)}
      role="img"
      aria-label={article.title_ar || article.title_en}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
          {lang === "ar" ? article.category.label_ar : article.category.label_en}
        </span>
        <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-white sm:text-2xl line-clamp-3">
          {lang === "ar" ? article.title_ar : article.title_en || article.title_ar}
        </h3>
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: InsightArticle }) {
  const { lang } = useLang();
  const base = "/insights";
  const title = lang === "ar" ? article.title_ar : article.title_en || article.title_ar;
  const excerpt = lang === "ar" ? article.excerpt_ar : article.excerpt_en || article.excerpt_ar;
  return (
    <Link
      to={`${base}/${article.category.slug}/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b0b0b] transition-colors hover:border-white/25"
    >
      <Cover article={article} className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span className="text-accent">
            {lang === "ar" ? article.category.label_ar : article.category.label_en}
          </span>
          <span aria-hidden>·</span>
          <span>
            {article.reading_minutes}{" "}
            {lang === "ar"
              ? pair("ui_insightscategoryview_4")[0]
              : pair("ui_insightscategoryview_4")[1]}
          </span>
        </div>
        <h3 className="mt-3 font-display text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-accent">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">{excerpt}</p>
        <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground/80">
          <span>{formatDate(article.published_at, lang)}</span>
          <span className="inline-flex items-center gap-1 font-medium text-foreground/80 transition-colors group-hover:text-accent">
            {lang === "ar" ? pair("ui_insightshubview_1")[0] : pair("ui_insightshubview_1")[1]}
            <span aria-hidden>{lang === "ar" ? "←" : "→"}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

interface HubProps {
  categories: InsightCategoryRow[];
  articles: InsightArticle[];
}

export function InsightsHubView({ categories, articles }: HubProps) {
  const { lang } = useLang();
  const base = "/insights";
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
    <div className="bg-background">
      <section className="px-3 pt-3 sm:px-6">
        <div className="relative isolate mx-auto max-w-[1400px] rounded-[2rem] border border-white/10 bg-[#0b0b0b] px-6 pb-10 pt-24 md:px-16 md:pb-16 md:pt-32">
          <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden rounded-[2rem]">
            <ColourField />
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs text-white backdrop-blur">
            <span className="text-accent">✦</span>
            {lang === "ar" ? pair("ui_insightshubview_2")[0] : pair("ui_insightshubview_2")[1]}
          </span>
          <h1 className="mt-5 font-display text-[2.25rem] font-bold leading-[1.15] text-white sm:text-5xl lg:text-[3.75rem]">
            {lang === "ar" ? pair("ui_insightshubview_3")[0] : pair("ui_insightshubview_3")[1]}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-[1.9] text-white/75 md:text-lg">
            {lang === "ar" ? pair("ui_insightshubview_4")[0] : pair("ui_insightshubview_4")[1]}
          </p>

          <div ref={searchWrapRef} className="relative mt-8 max-w-xl">
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-5 py-2.5 backdrop-blur transition-colors focus-within:border-accent">
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
                className="w-full bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                aria-label={
                  lang === "ar" ? pair("ui_insightshubview_6")[0] : pair("ui_insightshubview_6")[1]
                }
                aria-expanded={showSuggestions}
                aria-controls="insights-suggestions"
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
                  className="text-muted-foreground hover:text-accent"
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
                role="listbox"
                className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b0b0b] shadow-2xl"
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
                          to={`${base}/${c.slug}`}
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
                  <ul className="max-h-96 overflow-y-auto p-2">
                    {suggestions.map(({ a }) => (
                      <li key={a.id}>
                        <Link
                          to={`${base}/${a.category.slug}/${a.slug}`}
                          onClick={() => setSuggestOpen(false)}
                          className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-accent/10"
                          role="option"
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
      </section>

      {!query && active === "all" && featured && (
        <section className="mx-auto max-w-[1400px] px-6 pt-20 md:px-10 md:pt-28">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-accent">✦</span>
            {lang === "ar" ? pair("ui_insightshubview_11")[0] : pair("ui_insightshubview_11")[1]}
          </span>
          <Link
            to={`${base}/${featured.category.slug}/${featured.slug}`}
            className="group mt-5 grid overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b0b] transition-colors hover:border-white/25 md:grid-cols-2"
          >
            <Cover article={featured} className="aspect-[16/10] md:aspect-auto md:min-h-[380px]" />
            <div className="flex flex-col justify-center gap-5 p-7 sm:p-12">
              <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-accent">
                  {lang === "ar" ? featured.category.label_ar : featured.category.label_en}
                </span>
                <span>
                  {featured.reading_minutes}{" "}
                  {lang === "ar"
                    ? pair("ui_insightsarticleview_1")[0]
                    : pair("ui_insightsarticleview_1")[1]}
                </span>
                <span aria-hidden>·</span>
                <span>{formatDate(featured.published_at, lang)}</span>
              </div>
              <h2 className="font-display text-2xl font-bold leading-snug text-foreground transition-colors group-hover:text-accent md:text-[2rem]">
                {lang === "ar" ? featured.title_ar : featured.title_en || featured.title_ar}
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                {lang === "ar" ? featured.excerpt_ar : featured.excerpt_en || featured.excerpt_ar}
              </p>
              <span className="mt-2 inline-flex items-center gap-3 self-start rounded-full bg-white py-1.5 pe-1.5 ps-5 text-sm font-bold text-black">
                {lang === "ar" ? pair("ui_insightshubview_1")[0] : pair("ui_insightshubview_1")[1]}
                <span
                  aria-hidden
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent transition-transform group-hover:-rotate-45"
                >
                  ↖
                </span>
              </span>
            </div>
          </Link>
        </section>
      )}

      <section className="mx-auto max-w-[1400px] px-6 pb-28 pt-20 md:px-10 md:pb-40 md:pt-28">
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
          <span className="text-sm text-muted-foreground">
            {filtered.length}{" "}
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
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>
    </div>
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
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        active
          ? "border-white bg-white text-black"
          : "border-white/20 text-white/80 hover:border-white/60 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
