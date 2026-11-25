import { createFileRoute } from "@tanstack/react-router";
import { StudioHome } from "@/views/StudioHome";

import seo from "@/content/seo.json";
export const Route = createFileRoute("/")({
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
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Markazi+Text:wght@400;500;700&display=swap" },
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
  return <StudioHome />;
}
