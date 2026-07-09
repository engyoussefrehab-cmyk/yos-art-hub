import { createFileRoute } from "@tanstack/react-router";
import { ProjectsHubView } from "@/views/ProjectsHubView";

export const Route = createFileRoute("/en/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Youssef Rehab" },
      { name: "description", content: "Selected work across four specialties: visual identity, logos, company profiles, and social media." },
    ],
  }),
  component: ProjectsHubView,
});
