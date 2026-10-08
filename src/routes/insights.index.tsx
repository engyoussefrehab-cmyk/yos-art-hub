import { createFileRoute } from "@tanstack/react-router";
import { InsightsHubView } from "@/views/InsightsHubView";
import { getInsightsHubDataFn } from "@/lib/insights.functions";

import seo from "@/content/seo.json";
export const Route = createFileRoute("/insights/")({
  loader: () => getInsightsHubDataFn(),
  head: () => ({
    meta: [
      { title: seo.insights.ar.title },
      { name: "description", content: seo.insights.ar.description },
      { name: "keywords", content: seo.insights.ar.keywords },
      { property: "og:title", content: seo.insights.ar.og_title },
      { property: "og:description", content: seo.insights.ar.og_description },
      { property: "og:url", content: "/insights" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "canonical", href: "/insights" },
      { rel: "alternate", type: "application/rss+xml", title: "Insights RSS", href: "/rss.xml" },
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
          url: "/insights",
          inLanguage: "ar",
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
