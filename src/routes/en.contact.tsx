import { createFileRoute } from "@tanstack/react-router";
import { ContactView } from "@/views/ContactView";

export const Route = createFileRoute("/en/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Youssef Rehab" },
      { name: "description", content: "Get in touch with Youssef Rehab for visual identity and creative design projects." },
      { property: "og:title", content: "Contact — Youssef Rehab" },
      { property: "og:description", content: "Available for freelance projects and collaborations." },
    ],
  }),
  component: ContactView,
});
