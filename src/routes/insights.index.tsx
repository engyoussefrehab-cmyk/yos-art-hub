import { createFileRoute } from "@tanstack/react-router";
import { InsightsHubView } from "@/views/InsightsHubView";
import { getInsightsHubDataFn } from "@/lib/insights.functions";

export const Route = createFileRoute("/insights/")({
  loader: () => getInsightsHubDataFn(),
  head: () => ({
    meta: [
      { title: "رؤى ومقالات — يوسف رحاب | استراتيجية العلامة والهوية البصرية" },
      { name: "description", content: "مقالات ورؤى متخصّصة في استراتيجية العلامة، الهوية البصرية، تصميم الشعارات، تصميم العروض، والذكاء الاصطناعي — من يوسف رحاب." },
      { name: "keywords", content: "مقالات هوية بصرية, استراتيجية العلامة, تصميم شعارات, نصائح تصميم, برند, brand strategy blog Arabic" },
      { property: "og:title", content: "رؤى ومقالات — يوسف رحاب" },
      { property: "og:description", content: "استراتيجيات ومقالات في الهوية البصرية والعلامات التجارية." },
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
