import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import {
  getArticlesByCategory,
  getCategory,
  formatDate,
  INSIGHT_CATEGORIES,
  type Article,
} from "@/lib/insights-data";

export function InsightsCategoryView({ categorySlug }: { categorySlug: string }) {
  const { lang } = useLang();
  const cat = getCategory(categorySlug);
  const base = lang === "ar" ? "/insights" : "/en/insights";
  if (!cat) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">
          {lang === "ar" ? "التصنيف غير موجود" : "Category not found"}
        </h1>
        <Link to={base} className="mt-6 inline-block text-accent underline">
          {lang === "ar" ? "العودة إلى المقالات" : "Back to insights"}
        </Link>
      </div>
    );
  }

  const articles = getArticlesByCategory(cat.slug);

  return (
    <div className="bg-background">
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 pb-14 pt-16">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link to={base} className="hover:text-accent">
              {lang === "ar" ? "الرؤى" : "Insights"}
            </Link>
            <span aria-hidden>/</span>
            <span className="text-foreground">{cat.label[lang]}</span>
          </nav>
          <span className="mt-6 inline-block text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            {lang === "ar" ? "تصنيف" : "Category"}
          </span>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            {cat.label[lang]}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{cat.description[lang]}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        {articles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
            {lang === "ar" ? "قريبًا — مقالات جديدة في هذا التصنيف." : "Coming soon — new articles in this category."}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => <MiniCard key={a.slug} article={a} />)}
          </div>
        )}

        {/* Other categories */}
        <div className="mt-20 border-t border-border/60 pt-12">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {lang === "ar" ? "استكشف تصنيفات أخرى" : "Explore other categories"}
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {INSIGHT_CATEGORIES.filter((c) => c.slug !== cat.slug).map((c) => (
              <Link
                key={c.slug}
                to={`${base}/${c.slug}`}
                className="rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              >
                {c.label[lang]}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function MiniCard({ article }: { article: Article }) {
  const { lang } = useLang();
  const base = lang === "ar" ? "/insights" : "/en/insights";
  return (
    <Link
      to={`${base}/${article.category}/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-xl"
    >
      <div
        className="aspect-[16/10] relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${article.cover.from}, ${article.cover.to})` }}
      >
        <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(60% 50% at 30% 30%, ${article.cover.accent}55, transparent 60%)` }} />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {article.readingMinutes} {lang === "ar" ? "دقائق" : "min"} · {formatDate(article.publishedAt, lang)}
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">
          {article.title[lang]}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{article.excerpt[lang]}</p>
      </div>
    </Link>
  );
}
