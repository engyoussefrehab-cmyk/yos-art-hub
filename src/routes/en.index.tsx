import { createFileRoute } from "@tanstack/react-router";
import { HomeView } from "@/views/HomeView";
import { listServices } from "@/lib/services.functions";
import { listPortfolio } from "@/lib/portfolio.functions";
import { getMethodology } from "@/lib/methodology.functions";

import seo from "@/content/seo.json";
export const Route = createFileRoute("/en/")({
  loader: async () => {
    const [services, projects, methodology] = await Promise.all([
      listServices().catch(() => []),
      listPortfolio({ data: {} }).catch(() => []),
      getMethodology().catch(() => ({ copy: null, steps: [] })),
    ]);
    return { services, projects, methodology };
  },
  head: () => ({
    meta: [
      { title: seo.home.en.title },
      { name: "description", content: seo.home.en.description },
      { name: "keywords", content: seo.home.en.keywords },
      { property: "og:title", content: seo.home.en.og_title },
      { property: "og:description", content: seo.home.en.og_description },
      { property: "og:url", content: "/en" },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: seo.home.en.og_image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: seo.home.en.og_image_alt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: seo.home.en.og_image },
    ],
    links: [
      { rel: "canonical", href: "/en" },
      { rel: "alternate", hrefLang: "ar", href: "/" },
      { rel: "alternate", hrefLang: "ar-SA", href: "/" },
      { rel: "alternate", hrefLang: "ar-AE", href: "/" },
      { rel: "alternate", hrefLang: "en", href: "/en" },
      { rel: "alternate", hrefLang: "en-SA", href: "/en" },
      { rel: "alternate", hrefLang: "en-AE", href: "/en" },
      { rel: "alternate", hrefLang: "x-default", href: "/" },
    ],
  }),
  component: HomeRoute,
});

function HomeRoute() {
  const { services, projects, methodology } = Route.useLoaderData();
  return <HomeView services={services} projects={projects} methodology={methodology} />;
}
