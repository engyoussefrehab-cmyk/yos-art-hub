import { createFileRoute } from "@tanstack/react-router";
import { HomeView } from "@/views/HomeView";
import { listServices } from "@/lib/services.functions";
import { listPortfolio } from "@/lib/portfolio.functions";
import { getMethodology } from "@/lib/methodology.functions";

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
      { title: "Youssef Rehab — Visual Identity Designer in Saudi Arabia & UAE" },
      { name: "description", content: "Strategic visual identity and logo designer serving brands across Saudi Arabia, UAE and the Gulf — 8+ years and 250+ brand collaborations." },
      { name: "keywords", content: "visual identity designer, logo designer Saudi Arabia, brand identity UAE, graphic designer Gulf, company profile design, Youssef Rehab" },
      { property: "og:title", content: "Youssef Rehab — Visual Identity Designer" },
      { property: "og:description", content: "Brand identities and logos for Saudi Arabia & UAE businesses." },
      { property: "og:url", content: "/en" },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: "https://yrstudio.art/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Youssef Rehab — Visual Identity Designer" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://yrstudio.art/og-image.jpg" },
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
