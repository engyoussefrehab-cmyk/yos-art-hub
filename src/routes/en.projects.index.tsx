import { createFileRoute } from "@tanstack/react-router";
import { ProjectsHubView } from "@/views/ProjectsHubView";

export const Route = createFileRoute("/en/projects/")({
  head: () => ({
    meta: [
      { title: "Youssef Rehab Portfolio — Brand Identity, Logos & Profiles" },
      { name: "description", content: "Selected work across four specialties: visual identity, logos, company profiles, and social media — for brands in Saudi Arabia, UAE and the Gulf." },
      { name: "keywords", content: "brand identity portfolio, logo designer, company profile design, social media design, Youssef Rehab" },
      { property: "og:title", content: "Projects — Youssef Rehab" },
      { property: "og:description", content: "Brand identity, logos, company profiles, and social media design." },
      { property: "og:url", content: "/en/projects" },
    ],
    links: [{ rel: "canonical", href: "/en/projects" }],
  }),
  component: ProjectsHubView,
});
