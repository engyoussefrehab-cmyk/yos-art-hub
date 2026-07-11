import { createFileRoute, notFound } from "@tanstack/react-router";
import { InsightsArticleView } from "@/views/InsightsArticleView";
import { getArticle, getCategory } from "@/lib/insights-data";

export const Route = createFileRoute("/en/insights/$category/$slug")({
  loader: ({ params }) => {
    const article = getArticle(params.slug);
    const cat = getCategory(params.category);
    if (!article || !cat || article.category !== params.category) throw notFound();
    return { article, cat };
  },
  head: ({ params, loaderData }) => {
    const a = loaderData?.article;
    if (!a) {
      return { meta: [{ title: "Unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const url = `/en/insights/${params.category}/${params.slug}`;
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: a.title.en,
      description: a.excerpt.en,
      author: { "@type": "Person", name: a.author.en },
      datePublished: a.publishedAt,
      inLanguage: "en",
      keywords: a.keywords.join(", "),
      articleSection: loaderData?.cat.label.en,
      mainEntityOfPage: url,
    };
    const faqSchema = a.faq && a.faq.length > 0 ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: a.faq.map((f) => ({
        "@type": "Question",
        name: f.q.en,
        acceptedAnswer: { "@type": "Answer", text: f.a.en },
      })),
    } : null;
    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Insights", item: "/en/insights" },
        { "@type": "ListItem", position: 2, name: loaderData?.cat.label.en, item: `/en/insights/${params.category}` },
        { "@type": "ListItem", position: 3, name: a.title.en, item: url },
      ],
    };
    return {
      meta: [
        { title: `${a.title.en} | Youssef Rehab` },
        { name: "description", content: a.excerpt.en },
        { name: "keywords", content: a.keywords.join(", ") },
        { name: "author", content: a.author.en },
        { property: "og:title", content: a.title.en },
        { property: "og:description", content: a.excerpt.en },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "article:published_time", content: a.publishedAt },
        { property: "article:author", content: a.author.en },
        { property: "article:section", content: loaderData?.cat.label.en ?? "" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: a.title.en },
        { name: "twitter:description", content: a.excerpt.en },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(schema) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumb) },
        ...(faqSchema ? [{ type: "application/ld+json", children: JSON.stringify(faqSchema) }] : []),
      ],
    };
  },
  component: () => {
    const { slug } = Route.useParams();
    return <InsightsArticleView slug={slug} />;
  },
});
