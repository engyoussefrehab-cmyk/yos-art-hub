import { createFileRoute } from "@tanstack/react-router";
import { PackagesView } from "@/views/PackagesView";

import seo from "@/content/seo.json";
export const Route = createFileRoute("/en/packages")({
  head: () => ({
    meta: [
      { title: seo.packages.en.title },
      { name: "description", content: seo.packages.en.description },
      { name: "keywords", content: seo.packages.en.keywords },
      { property: "og:title", content: seo.packages.en.og_title },
      { property: "og:description", content: seo.packages.en.og_description },
      { property: "og:url", content: "/en/packages" },
    ],
    links: [{ rel: "canonical", href: "/en/packages" }],
  }),
  component: PackagesView,
});
