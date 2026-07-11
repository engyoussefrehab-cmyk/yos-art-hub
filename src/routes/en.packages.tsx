import { createFileRoute } from "@tanstack/react-router";
import { PackagesView } from "@/views/PackagesView";

export const Route = createFileRoute("/en/packages")({
  head: () => ({
    meta: [
      { title: "Packages & Pricing — Youssef Rehab" },
      { name: "description", content: "Brand identity and logo design packages — from launch essentials to full visual systems. Transparent pricing and a clear process." },
      { name: "keywords", content: "brand identity pricing, logo design packages, visual identity cost, graphic designer rates" },
      { property: "og:title", content: "Packages & Pricing — Youssef Rehab" },
      { property: "og:description", content: "Brand identity and logo design packages with transparent pricing." },
      { property: "og:url", content: "/en/packages" },
    ],
    links: [{ rel: "canonical", href: "/en/packages" }],
  }),
  component: PackagesView,
});
