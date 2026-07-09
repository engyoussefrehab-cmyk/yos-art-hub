import { createFileRoute } from "@tanstack/react-router";
import { HomeView } from "@/views/HomeView";

export const Route = createFileRoute("/en/")({
  head: () => ({
    meta: [
      { title: "Youssef Rehab — Visual Identity Designer" },
      { name: "description", content: "Youssef Rehab — strategic visual identity designer with 8+ years and 250+ brand collaborations." },
      { property: "og:title", content: "Youssef Rehab — Visual Identity Designer" },
      { property: "og:description", content: "8+ years crafting visual identities and logos." },
    ],
  }),
  component: HomeView,
});
