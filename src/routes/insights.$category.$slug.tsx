import { createFileRoute, notFound } from "@tanstack/react-router";
import { InsightsArticleView } from "@/views/InsightsArticleView";
import { getArticle, getCategory } from "@/lib/insights-data";

export const Route = createFileRoute("/insights/$category/$slug")({
  loader: ({ params }) => {
    const article = getArticle(params.slug);
    const cat = getCategory(params.category);
    if (!article || !cat || article.category !== params.category) throw notFound();
    return { article, cat };
  },
  head: ({ params, loaderData }) => {
    const a = loaderData?.article;
    if (!a) {
      return { meta: [{ title: "غير متاح" }, { name: "robots", content: "noindex" }] };
    }
    const url = `/insights/${params.category}/${params.slug}`;
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: a.title.ar,
      description: a.excerpt.ar,
      author: { "@type": "Person", name: a.author.ar },
      datePublished: a.publishedAt,
      inLanguage: "ar",
      keywords: a.keywords.join(", "),
      articleSection: loaderData?.cat.label.ar,
      mainEntityOfPage: url,
    };
    const faqSchema = a.faq && a.faq.length > 0 ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: a.faq.map((f) => ({
        "@type": "Question",
        name: f.q.ar,
        acceptedAnswer: { "@type": "Answer", text: f.a.ar },
      })),
    } : null;
    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "الرؤى", item: "/insights" },
        { "@type": "ListItem", position: 2, name: loaderData?.cat.label.ar, item: `/insights/${params.category}` },
        { "@type": "ListItem", position: 3, name: a.title.ar, item: url },
      ],
    };
    return {
      meta: [
        { title: `${a.title.ar} | يوسف رحاب` },
        { name: "description", content: a.excerpt.ar },
        { name: "keywords", content: a.keywords.join(", ") },
        { name: "author", content: a.author.ar },
        { property: "og:title", content: a.title.ar },
        { property: "og:description", content: a.excerpt.ar },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "article:published_time", content: a.publishedAt },
        { property: "article:author", content: a.author.ar },
        { property: "article:section", content: loaderData?.cat.label.ar ?? "" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: a.title.ar },
        { name: "twitter:description", content: a.excerpt.ar },
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
