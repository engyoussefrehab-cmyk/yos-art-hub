import { createFileRoute } from "@tanstack/react-router";
import { PackagesView } from "@/views/PackagesView";

export const Route = createFileRoute("/en/packages")({
  head: () => ({
    meta: [
      { title: "Service Tiers — Youssef Rehab" },
      { name: "description", content: "Choose the right branding solution — tailored service tiers from Brand Launch to a complete Brand System. Strategic identity design for growing businesses." },
      { name: "keywords", content: "branding service tiers, brand identity pricing, logo design packages, brand strategy consultancy" },
      { property: "og:title", content: "Service Tiers — Youssef Rehab" },
      { property: "og:description", content: "Tailored branding service tiers — from launch to a complete brand system." },
      { property: "og:url", content: "/en/packages" },
    ],
    links: [{ rel: "canonical", href: "/en/packages" }],
  }),
  component: PackagesView,
});
