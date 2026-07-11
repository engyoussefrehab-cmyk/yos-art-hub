import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import {
  INSIGHT_CATEGORIES,
  getAllArticlesSorted,
  getFeaturedArticle,
  searchArticles,
  formatDate,
  type Article,
  type CategorySlug,
} from "@/lib/insights-data";

function Cover({ article, className }: { article: Article; className?: string }) {
  const { lang } = useLang();
  const cat = INSIGHT_CATEGORIES.find((c) => c.slug === article.category);
  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{ background: `linear-gradient(135deg, ${article.cover.from} 0%, ${article.cover.to} 100%)` }}
      aria-hidden={false}
      role="img"
      aria-label={article.title[lang]}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{ background: `radial-gradient(60% 50% at 30% 30%, ${article.cover.accent}44, transparent 60%)` }}
      />
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
          {cat?.label[lang]}
        </span>
        <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-white sm:text-2xl line-clamp-3">
          {article.title[lang]}
        </h3>
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const { lang } = useLang();
  const base = lang === "ar" ? "/insights" : "/en/insights";
  const cat = INSIGHT_CATEGORIES.find((c) => c.slug === article.category);
  return (
    <Link
      to={`${base}/${article.category}/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-xl"
    >
      <Cover article={article} className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span className="text-accent">{cat?.label[lang]}</span>
          <span aria-hidden>·</span>
          <span>{article.readingMinutes} {lang === "ar" ? "دقائق" : "min"}</span>
        </div>
        <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">
          {article.title[lang]}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">{article.excerpt[lang]}</p>
        <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground/80">
          <span>{formatDate(article.publishedAt, lang)}</span>
          <span className="inline-flex items-center gap-1 font-medium text-foreground/80 transition-colors group-hover:text-accent">
            {lang === "ar" ? "اقرأ المقال" : "Read article"}
            <span aria-hidden>{lang === "ar" ? "←" : "→"}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export function InsightsHubView() {
  const { lang } = useLang();
  const base = lang === "ar" ? "/insights" : "/en/insights";
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<CategorySlug | "all">("all");

  const featured = getFeaturedArticle();

  const filtered = useMemo(() => {
    let list = query ? searchArticles(query, lang) : getAllArticlesSorted();
    if (active !== "all") list = list.filter((a) => a.category === active);
    if (!query) list = list.filter((a) => a.slug !== featured.slug);
    return list;
  }, [query, active, lang, featured.slug]);

  const featuredCat = INSIGHT_CATEGORIES.find((c) => c.slug === featured.category);

  return (
    <div className="bg-background">
      {/* Hero */}
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

          {/* Search */}
          <div className="mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border/80 bg-card px-4 py-2 shadow-sm transition-colors focus-within:border-accent">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
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

          {/* Category filters */}
          <div className="mt-6 flex flex-wrap gap-2">
            <FilterChip active={active === "all"} onClick={() => setActive("all")}>
              {lang === "ar" ? "الكل" : "All"}
            </FilterChip>
            {INSIGHT_CATEGORIES.map((c) => (
              <FilterChip key={c.slug} active={active === c.slug} onClick={() => setActive(c.slug)}>
                {c.label[lang]}
              </FilterChip>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      {!query && active === "all" && (
        <section className="mx-auto max-w-6xl px-6 pt-16">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {lang === "ar" ? "مقال مميّز" : "Featured"}
          </span>
          <Link
            to={`${base}/${featured.category}/${featured.slug}`}
            className="group mt-4 grid overflow-hidden rounded-3xl border border-border/70 bg-card transition-all duration-300 hover:border-accent/50 hover:shadow-2xl md:grid-cols-2"
          >
            <Cover article={featured} className="aspect-[16/10] md:aspect-auto md:min-h-[380px]" />
            <div className="flex flex-col justify-center gap-4 p-8 sm:p-12">
              <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-accent">{featuredCat?.label[lang]}</span>
                <span>{featured.readingMinutes} {lang === "ar" ? "دقائق قراءة" : "min read"}</span>
                <span aria-hidden>·</span>
                <span>{formatDate(featured.publishedAt, lang)}</span>
              </div>
              <h2 className="font-display text-2xl font-semibold leading-tight text-foreground transition-colors group-hover:text-accent sm:text-3xl md:text-4xl">
                {featured.title[lang]}
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">{featured.excerpt[lang]}</p>
              <span className="mt-2 inline-flex items-center gap-2 self-start rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform group-hover:-translate-y-0.5">
                {lang === "ar" ? "اقرأ المقال" : "Read article"}
                <span aria-hidden>{lang === "ar" ? "←" : "→"}</span>
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* Grid */}
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
          <p className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
            {lang === "ar" ? "لا توجد نتائج مطابقة." : "No matching results."}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => <ArticleCard key={a.slug} article={a} />)}
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
