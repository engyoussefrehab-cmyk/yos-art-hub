import { createFileRoute } from "@tanstack/react-router";
import { ContactView } from "@/views/ContactView";

import seo from "@/content/seo.json";
export const Route = createFileRoute("/en/contact")({
  head: () => ({
    meta: [
      { title: seo.contact.en.title },
      { name: "description", content: seo.contact.en.description },
      { name: "keywords", content: seo.contact.en.keywords },
      { property: "og:title", content: seo.contact.en.og_title },
      { property: "og:description", content: seo.contact.en.og_description },
      { property: "og:url", content: "/en/contact" },
    ],
    links: [{ rel: "canonical", href: "/en/contact" }],
  }),
  component: ContactView,
});
