import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import { formatDate, type InsightArticle, type InsightCategoryRow } from "@/lib/insights-types";

function coverStyle(a: InsightArticle) {
  if (a.cover_url) return { backgroundImage: `url(${a.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" };
  // Fallback gradient — derived from slug for visual variety
  const hash = Array.from(a.slug).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
  const hue = hash % 360;
  return { background: `linear-gradient(135deg, hsl(${hue} 45% 25%) 0%, hsl(${(hue + 40) % 360} 55% 40%) 100%)` };
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
  const base = lang === "ar" ? "/insights" : "/en/insights";
  const title = lang === "ar" ? article.title_ar : article.title_en || article.title_ar;
  const excerpt = lang === "ar" ? article.excerpt_ar : article.excerpt_en || article.excerpt_ar;
  return (
    <Link
      to={`${base}/${article.category.slug}/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-xl"
    >
      <Cover article={article} className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span className="text-accent">{lang === "ar" ? article.category.label_ar : article.category.label_en}</span>
          <span aria-hidden>·</span>
          <span>{article.reading_minutes} {lang === "ar" ? "دقائق" : "min"}</span>
        </div>
        <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">{excerpt}</p>
        <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground/80">
          <span>{formatDate(article.published_at, lang)}</span>
          <span className="inline-flex items-center gap-1 font-medium text-foreground/80 transition-colors group-hover:text-accent">
            {lang === "ar" ? "اقرأ المقال" : "Read article"}
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
  const base = lang === "ar" ? "/insights" : "/en/insights";
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>("all");

  const featured = useMemo(
    () => articles.find((a) => a.featured) ?? articles[0] ?? null,
    [articles],
  );

  const filtered = useMemo(() => {
    let list = articles;
    if (active !== "all") list = list.filter((a) => a.category.slug === active);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((a) =>
        [a.title_ar, a.title_en, a.excerpt_ar, a.excerpt_en, ...(a.tags ?? []), ...(a.keywords ?? [])]
          .join(" ").toLowerCase().includes(q),
      );
    }
    if (!query && active === "all" && featured) list = list.filter((a) => a.slug !== featured.slug);
    return list;
  }, [articles, query, active, featured]);

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden border-b border-border/60">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-40 left-1/3 h-[520px] w-[520px] rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pt-28">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            {lang === "ar" ? "رؤى ومقالات" : "Insights"}
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl">
            {lang === "ar" ? "رؤًى تُبنى بها العلامات" : "Insights that build brands"}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {lang === "ar"
              ? "استراتيجيات عمليّة، أنظمة هويّة بصريّة، تصميم شعارات، تصميم العروض، رؤى الأعمال، سير عمل الذكاء الاصطناعي، ودراسات حالة من العالم الحقيقي."
              : "Practical brand strategies, visual identity systems, logo design, presentation design, business insights, AI workflows, and real-world case studies."}
          </p>

          <div className="mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border/80 bg-card px-4 py-2 shadow-sm transition-colors focus-within:border-accent">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === "ar" ? "ابحث في المقالات، الكلمات المفتاحية، التصنيفات…" : "Search articles, keywords, categories…"}
              className="w-full bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              aria-label={lang === "ar" ? "بحث" : "Search"}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <FilterChip active={active === "all"} onClick={() => setActive("all")}>
              {lang === "ar" ? "الكل" : "All"}
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
        <section className="mx-auto max-w-6xl px-6 pt-16">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {lang === "ar" ? "مقال مميّز" : "Featured"}
          </span>
          <Link
            to={`${base}/${featured.category.slug}/${featured.slug}`}
            className="group mt-4 grid overflow-hidden rounded-3xl border border-border/70 bg-card transition-all duration-300 hover:border-accent/50 hover:shadow-2xl md:grid-cols-2"
          >
            <Cover article={featured} className="aspect-[16/10] md:aspect-auto md:min-h-[380px]" />
            <div className="flex flex-col justify-center gap-4 p-8 sm:p-12">
              <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-accent">
                  {lang === "ar" ? featured.category.label_ar : featured.category.label_en}
                </span>
                <span>{featured.reading_minutes} {lang === "ar" ? "دقائق قراءة" : "min read"}</span>
                <span aria-hidden>·</span>
                <span>{formatDate(featured.published_at, lang)}</span>
              </div>
              <h2 className="font-display text-2xl font-semibold leading-tight text-foreground transition-colors group-hover:text-accent sm:text-3xl md:text-4xl">
                {lang === "ar" ? featured.title_ar : featured.title_en || featured.title_ar}
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                {lang === "ar" ? featured.excerpt_ar : featured.excerpt_en || featured.excerpt_ar}
              </p>
              <span className="mt-2 inline-flex items-center gap-2 self-start rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform group-hover:-translate-y-0.5">
                {lang === "ar" ? "اقرأ المقال" : "Read article"}
                <span aria-hidden>{lang === "ar" ? "←" : "→"}</span>
              </span>
            </div>
          </Link>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            {query || active !== "all"
              ? lang === "ar" ? "نتائج البحث" : "Results"
              : lang === "ar" ? "أحدث المقالات" : "Latest articles"}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filtered.length} {lang === "ar" ? "مقال" : filtered.length === 1 ? "article" : "articles"}
          </span>
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-20 text-center">
            <p className="text-muted-foreground">
              {articles.length === 0
                ? lang === "ar" ? "قريبًا — نُعِدّ أوّل مقالاتنا." : "Coming soon — we're preparing our first articles."
                : lang === "ar" ? "لا توجد نتائج مطابقة." : "No matching results."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-background text-muted-foreground hover:border-accent/50 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// silence "unused import" for useEffect if not needed later
void useEffect;
