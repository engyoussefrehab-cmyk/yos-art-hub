import { createFileRoute, notFound } from "@tanstack/react-router";
import { InsightsArticleView } from "@/views/InsightsArticleView";
import { getArticleBySlugFn, getPublishedArticlesFn } from "@/lib/insights.functions";
import { absUrl, SITE_NAME_EN, TWITTER_HANDLE } from "@/lib/site";

export const Route = createFileRoute("/en/insights/$category/$slug")({
  loader: async ({ params }) => {
    const [article, allArticles] = await Promise.all([
      getArticleBySlugFn({ data: { slug: params.slug, categorySlug: params.category } }),
      getPublishedArticlesFn(),
    ]);
    if (!article) throw notFound();
    return { article, allArticles };
  },
  head: ({ params, loaderData }) => {
    const a = loaderData?.article;
    if (!a) return { meta: [{ title: "Unavailable" }, { name: "robots", content: "noindex" }] };
    const path = `/en/insights/${params.category}/${params.slug}`;
    const url = absUrl(path);
    const seoTitle = a.seo_title_en || a.title_en || a.title_ar;
    const seoDesc = a.seo_description_en || a.excerpt_en || a.excerpt_ar;
    const catLabel = a.category.label_en;
    const title = a.title_en || a.title_ar;
    const coverAbs = a.cover_url ? absUrl(a.cover_url) : null;
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description: seoDesc,
      image: coverAbs ? [coverAbs] : undefined,
      author: { "@type": "Person", name: a.author_name, url: absUrl("/en") },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME_EN,
        logo: { "@type": "ImageObject", url: absUrl("/favicon-512.png") },
      },
      datePublished: a.published_at,
      dateModified: a.updated_at,
      inLanguage: "en",
      keywords: a.keywords.join(", "),
      articleSection: catLabel,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    };
    const faqSchema = a.faq && a.faq.length > 0 ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: a.faq.map((f) => ({
        "@type": "Question",
        name: f.q_en || f.q_ar,
        acceptedAnswer: { "@type": "Answer", text: f.a_en || f.a_ar },
      })),
    } : null;
    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Insights", item: absUrl("/en/insights") },
        { "@type": "ListItem", position: 2, name: catLabel, item: absUrl(`/en/insights/${params.category}`) },
        { "@type": "ListItem", position: 3, name: title, item: url },
      ],
    };
    const meta: Array<Record<string, string>> = [
      { title: `${seoTitle} | Youssef Rehab` },
      { name: "description", content: seoDesc },
      { name: "keywords", content: a.keywords.join(", ") },
      { name: "author", content: a.author_name },
      { property: "og:site_name", content: SITE_NAME_EN },
      { property: "og:locale", content: "en_US" },
      { property: "og:locale:alternate", content: "ar_AR" },
      { property: "og:title", content: seoTitle },
      { property: "og:description", content: seoDesc },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { property: "article:published_time", content: a.published_at ?? "" },
      { property: "article:modified_time", content: a.updated_at ?? "" },
      { property: "article:author", content: a.author_name },
      { property: "article:section", content: catLabel },
      ...a.tags.map((t) => ({ property: "article:tag", content: t })),
      { name: "twitter:card", content: coverAbs ? "summary_large_image" : "summary" },
      { name: "twitter:site", content: TWITTER_HANDLE },
      { name: "twitter:creator", content: TWITTER_HANDLE },
      { name: "twitter:title", content: seoTitle },
      { name: "twitter:description", content: seoDesc },
    ];
    if (coverAbs) {
      meta.push({ property: "og:image", content: coverAbs });
      meta.push({ property: "og:image:alt", content: title });
      meta.push({ name: "twitter:image", content: coverAbs });
    }
    return {
      meta,
      links: [
        { rel: "canonical", href: url },
        { rel: "alternate", hreflang: "en", href: url },
        { rel: "alternate", hreflang: "ar", href: absUrl(`/insights/${params.category}/${params.slug}`) },
        { rel: "alternate", hreflang: "x-default", href: absUrl(`/insights/${params.category}/${params.slug}`) },
        { rel: "alternate", type: "application/rss+xml", title: "Insights RSS", href: absUrl("/en/rss.xml") },
      ],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(schema) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumb) },
        ...(faqSchema ? [{ type: "application/ld+json", children: JSON.stringify(faqSchema) }] : []),
      ],
    };
  },
  component: () => {
    const data = Route.useLoaderData();
    return <InsightsArticleView article={data.article} allArticles={data.allArticles} />;
  },
});
