import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AR } from "@/components/studio-site";
import { formatDate, type InsightArticle } from "@/lib/insights-types";

export function InsightCard({ article, featured = false }: { article: InsightArticle; featured?: boolean }) {
  const image = article.cover_url || article.featured_image_url;
  const Title = featured ? "h2" : "h3";
  return (
    <Link
      to="/insights/$category/$slug"
      params={{ category: article.category.slug, slug: article.slug }}
      className={`group overflow-hidden rounded-xl border border-border bg-card text-foreground transition-colors hover:border-accent ${featured && image ? "grid md:grid-cols-2" : "flex flex-col"}`}
    >
      {image && (
        <div className={`overflow-hidden bg-cream ${featured ? "aspect-[16/10] md:aspect-auto" : "aspect-[16/10]"}`}>
          <img src={image} alt="" loading={featured ? "eager" : "lazy"} className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105" />
        </div>
      )}
      <div className={`flex min-w-0 flex-1 flex-col ${featured ? "justify-center p-6 md:p-10" : "p-5"}`}>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-bold text-accent">{article.category.label_ar}</span>
          {article.published_at && <time dateTime={article.published_at}>{formatDate(article.published_at, "ar")}</time>}
          {article.reading_minutes > 0 && <span>{AR(article.reading_minutes)} د قراءة</span>}
        </p>
        <Title className={`mt-3 font-display font-bold leading-snug group-hover:text-accent ${featured ? "text-3xl md:text-4xl" : "text-2xl"}`}>
          {article.title_ar || article.title_en}
        </Title>
        {(article.excerpt_ar || article.excerpt_en) && (
          <p className="mt-2 line-clamp-3 text-sm leading-loose text-muted-foreground">{article.excerpt_ar || article.excerpt_en}</p>
        )}
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-foreground group-hover:text-accent">
          اقرأ المقال <ArrowLeft aria-hidden="true" size={17} />
        </span>
      </div>
    </Link>
  );
}
