import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import { formatDate, type InsightArticle, type InsightCategoryRow } from "@/lib/insights-types";

import { pair } from "@/i18n/dictionary";
import { ColourField } from "@/components/studio";
interface Props {
  category: InsightCategoryRow;
  articles: InsightArticle[];
  allCategories: InsightCategoryRow[];
}

export function InsightsCategoryView({ category, articles, allCategories }: Props) {
  const { lang } = useLang();
  const base = "/insights";

  return (
    <div className="bg-background">
      <section className="px-3 pt-3 sm:px-6">
        <div className="relative isolate mx-auto max-w-[1400px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b0b] px-6 pb-10 pt-24 md:px-16 md:pb-16 md:pt-32">
          <ColourField />
          <nav
            className="flex items-center gap-2 text-xs text-muted-foreground"
            aria-label="Breadcrumb"
          >
            <Link to={base} className="hover:text-accent">
              {lang === "ar" ? pair("nav_insights")[0] : pair("nav_insights")[1]}
            </Link>
            <span aria-hidden>/</span>
            <span className="text-foreground">
              {lang === "ar" ? category.label_ar : category.label_en}
            </span>
          </nav>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs text-white backdrop-blur">
            {lang === "ar"
              ? pair("ui_insightscategoryview_1")[0]
              : pair("ui_insightscategoryview_1")[1]}
          </span>
          <h1 className="mt-3 font-display text-[2.25rem] font-bold leading-[1.15] text-white sm:text-5xl lg:text-[3.75rem]">
            {lang === "ar" ? category.label_ar : category.label_en}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-[1.9] text-white/75 md:text-lg">
            {lang === "ar" ? category.description_ar : category.description_en}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-28 pt-16 md:px-10 md:pb-40 md:pt-24">
        {articles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
            {lang === "ar"
              ? pair("ui_insightscategoryview_2")[0]
              : pair("ui_insightscategoryview_2")[1]}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {articles.map((a) => (
              <MiniCard key={a.id} article={a} />
            ))}
          </div>
        )}

        <div className="mt-20 border-t border-border/60 pt-12">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {lang === "ar"
              ? pair("ui_insightscategoryview_3")[0]
              : pair("ui_insightscategoryview_3")[1]}
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {allCategories
              .filter((c) => c.slug !== category.slug)
              .map((c) => (
                <Link
                  key={c.slug}
                  to={`${base}/${c.slug}`}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition-colors hover:border-white/60 hover:text-white"
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
  const base = "/insights";
  const title = lang === "ar" ? article.title_ar : article.title_en || article.title_ar;
  const excerpt = lang === "ar" ? article.excerpt_ar : article.excerpt_en || article.excerpt_ar;
  const style = article.cover_url
    ? {
        backgroundImage: `url(${article.cover_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { background: "linear-gradient(135deg,#1a1a2e,#16213e)" };
  return (
    <Link
      to={`${base}/${article.category.slug}/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b0b0b] transition-colors hover:border-white/25"
    >
      <div className="aspect-[16/10] relative overflow-hidden" style={style} />
      <div className="flex flex-1 flex-col p-6">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {article.reading_minutes}{" "}
          {lang === "ar"
            ? pair("ui_insightscategoryview_4")[0]
            : pair("ui_insightscategoryview_4")[1]}{" "}
          · {formatDate(article.published_at, lang)}
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{excerpt}</p>
      </div>
    </Link>
  );
}
