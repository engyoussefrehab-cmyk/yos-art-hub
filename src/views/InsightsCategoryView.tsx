import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import { type InsightArticle, type InsightCategoryRow } from "@/lib/insights-types";

import { pair } from "@/i18n/dictionary";
import { StudioSectionHero, container } from "@/components/studio";
import { InsightCard } from "@/components/InsightCard";
interface Props {
  category: InsightCategoryRow;
  articles: InsightArticle[];
  allCategories: InsightCategoryRow[];
}

export function InsightsCategoryView({ category, articles, allCategories }: Props) {
  const { lang } = useLang();

  return (
    <>
      <StudioSectionHero
        label={<Link to="/insights" className="hover:underline">{pair("nav_insights")[0]} ←</Link>}
        title={lang === "ar" ? category.label_ar : category.label_en}
        intro={lang === "ar" ? category.description_ar : category.description_en}
      />
      <section className={`${container} py-9 md:py-16`}>
        {articles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
            {lang === "ar"
              ? pair("ui_insightscategoryview_2")[0]
              : pair("ui_insightscategoryview_2")[1]}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {articles.map((a) => (
              <InsightCard key={a.id} article={a} />
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
                  to="/insights/$category" params={{ category: c.slug }}
                  className="inline-flex min-h-11 items-center rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:border-accent hover:text-accent"
                >
                  {lang === "ar" ? c.label_ar : c.label_en}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
