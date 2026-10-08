import { createFileRoute } from "@tanstack/react-router";
import { PackagesView } from "@/views/PackagesView";

import seo from "@/content/seo.json";
export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: seo.packages.ar.title },
      { name: "description", content: seo.packages.ar.description },
      { name: "keywords", content: seo.packages.ar.keywords },
      { property: "og:title", content: seo.packages.ar.og_title },
      { property: "og:description", content: seo.packages.ar.og_description },
      { property: "og:url", content: "/packages" },
    ],
    links: [{ rel: "canonical", href: "/packages" }],
  }),
  component: PackagesView,
});
