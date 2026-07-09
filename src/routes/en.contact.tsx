import { createFileRoute } from "@tanstack/react-router";
import { ContactView } from "@/views/ContactView";

export const Route = createFileRoute("/en/contact")({
  head: () => ({
    meta: [
      { title: "Contact Youssef Rehab — Visual Identity Designer" },
      { name: "description", content: "Get in touch with Youssef Rehab for brand identity, logo, and company profile projects across Saudi Arabia, UAE and the Gulf." },
      { name: "keywords", content: "contact brand designer, Youssef Rehab, logo designer Saudi Arabia, visual identity UAE, graphic designer Gulf" },
      { property: "og:title", content: "Contact — Youssef Rehab" },
      { property: "og:description", content: "Available for identity projects and collaborations across Saudi Arabia & UAE." },
      { property: "og:url", content: "/en/contact" },
    ],
    links: [{ rel: "canonical", href: "/en/contact" }],
  }),
  component: ContactView,
});
