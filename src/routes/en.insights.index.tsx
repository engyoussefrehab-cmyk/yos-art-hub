import { createFileRoute } from "@tanstack/react-router";
import { InsightsHubView } from "@/views/InsightsHubView";
import { getInsightsHubDataFn } from "@/lib/insights.functions";

export const Route = createFileRoute("/en/insights/")({
  loader: () => getInsightsHubDataFn(),
  head: () => ({
    meta: [
      { title: "Insights — Youssef Rehab | Brand Strategy & Visual Identity" },
      { name: "description", content: "Practical articles on brand strategy, visual identity, logo design, presentation design, AI workflows, and real-world case studies — by Youssef Rehab." },
      { name: "keywords", content: "brand strategy blog, visual identity articles, logo design tips, presentation design, brand insights" },
      { property: "og:title", content: "Insights — Youssef Rehab" },
      { property: "og:description", content: "Brand strategy and visual identity insights." },
      { property: "og:url", content: "/en/insights" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "canonical", href: "/en/insights" },
      { rel: "alternate", type: "application/rss+xml", title: "Insights RSS", href: "/en/rss.xml" },
      { rel: "alternate", hreflang: "en", href: "/en/insights" },
      { rel: "alternate", hreflang: "ar", href: "/insights" },
      { rel: "alternate", hreflang: "x-default", href: "/insights" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Youssef Rehab Insights",
          url: "/en/insights",
          inLanguage: "en",
          author: { "@type": "Person", name: "Youssef Rehab" },
        }),
      },
    ],
  }),
  component: () => {
    const data = Route.useLoaderData();
    return <InsightsHubView categories={data.categories} articles={data.articles} />;
  },
});
