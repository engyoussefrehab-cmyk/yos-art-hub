import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import { formatDate, type InsightArticle, type InsightCategoryRow } from "@/lib/insights-types";

import { pair } from "@/i18n/dictionary";
interface Props {
  category: InsightCategoryRow;
  articles: InsightArticle[];
  allCategories: InsightCategoryRow[];
}

export function InsightsCategoryView({ category, articles, allCategories }: Props) {
  const { lang } = useLang();
  const base = lang === "ar" ? "/insights" : "/en/insights";

  return (
    <div className="bg-background">
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 pb-14 pt-16">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link to={base} className="hover:text-accent">
              {lang === "ar" ? pair("nav_insights")[0] : pair("nav_insights")[1]}
            </Link>
            <span aria-hidden>/</span>
            <span className="text-foreground">{lang === "ar" ? category.label_ar : category.label_en}</span>
          </nav>
          <span className="mt-6 inline-block text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            {lang === "ar" ? pair("ui_insightscategoryview_1")[0] : pair("ui_insightscategoryview_1")[1]}
          </span>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            {lang === "ar" ? category.label_ar : category.label_en}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {lang === "ar" ? category.description_ar : category.description_en}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        {articles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
            {lang === "ar" ? pair("ui_insightscategoryview_2")[0] : pair("ui_insightscategoryview_2")[1]}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => <MiniCard key={a.id} article={a} />)}
          </div>
        )}

        <div className="mt-20 border-t border-border/60 pt-12">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {lang === "ar" ? pair("ui_insightscategoryview_3")[0] : pair("ui_insightscategoryview_3")[1]}
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {allCategories.filter((c) => c.slug !== category.slug).map((c) => (
              <Link
                key={c.slug}
                to={`${base}/${c.slug}`}
                className="rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              >
                {lang === "ar" ? c.label_ar : c.label_en}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function MiniCard({ article }: { article: InsightArticle }) {
  const { lang } = useLang();
  const base = lang === "ar" ? "/insights" : "/en/insights";
  const title = lang === "ar" ? article.title_ar : article.title_en || article.title_ar;
  const excerpt = lang === "ar" ? article.excerpt_ar : article.excerpt_en || article.excerpt_ar;
  const style = article.cover_url
    ? { backgroundImage: `url(${article.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: "linear-gradient(135deg,#1a1a2e,#16213e)" };
  return (
    <Link
      to={`${base}/${article.category.slug}/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-xl"
    >
      <div className="aspect-[16/10] relative overflow-hidden" style={style} />
      <div className="flex flex-1 flex-col p-6">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {article.reading_minutes} {lang === "ar" ? pair("ui_insightscategoryview_4")[0] : pair("ui_insightscategoryview_4")[1]} · {formatDate(article.published_at, lang)}
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{excerpt}</p>
      </div>
    </Link>
  );
}
