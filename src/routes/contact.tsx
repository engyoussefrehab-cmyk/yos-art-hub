import { createFileRoute } from "@tanstack/react-router";
import { ContactView } from "@/views/ContactView";

import seo from "@/content/seo.json";
export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: seo.contact.ar.title },
      { name: "description", content: seo.contact.ar.description },
      { name: "keywords", content: seo.contact.ar.keywords },
      { property: "og:title", content: seo.contact.ar.og_title },
      { property: "og:description", content: seo.contact.ar.og_description },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactView,
});
