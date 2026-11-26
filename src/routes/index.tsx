import { createFileRoute } from "@tanstack/react-router";
import { StudioHome } from "@/views/StudioHome";
import { getPublishedArticlesFn } from "@/lib/insights.functions";
import { countPublishedPortfolio } from "@/lib/portfolio.functions";

import seo from "@/content/seo.json";
export const Route = createFileRoute("/")({
  loader: async () => {
    const [articles, projectCount] = await Promise.all([getPublishedArticlesFn(), countPublishedPortfolio()]);
    return {
      projectCount,
      posts: articles.slice(0, 3).map((article) => ({
        title: article.title_ar || article.title_en,
        to: `/insights/${article.category.slug}/${article.slug}`,
        publishedAt: article.published_at,
      })),
    };
  },
  head: () => ({
    meta: [
      { title: seo.home.ar.title },
      { name: "description", content: seo.home.ar.description },
      { name: "keywords", content: seo.home.ar.keywords },
      { property: "og:title", content: seo.home.ar.og_title },
      { property: "og:description", content: seo.home.ar.og_description },
      { property: "og:url", content: "/" },
      { property: "og:image", content: seo.home.ar.og_image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: seo.home.ar.og_image_alt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: seo.home.ar.og_image },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "alternate", hrefLang: "ar", href: "/" },
      { rel: "alternate", hrefLang: "ar-SA", href: "/" },
      { rel: "alternate", hrefLang: "ar-AE", href: "/" },
      { rel: "alternate", hrefLang: "x-default", href: "/" },
    ],
  }),
  component: HomeRoute,
});

function HomeRoute() {
  const { posts, projectCount } = Route.useLoaderData();
  return <StudioHome posts={posts} projectCount={projectCount} />;
}
