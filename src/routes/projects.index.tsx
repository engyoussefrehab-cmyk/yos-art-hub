import { createFileRoute } from "@tanstack/react-router";
import { ProjectsHubView } from "@/views/ProjectsHubView";
import { listPortfolio, listCategories, getProjectsStats } from "@/lib/portfolio.functions";


import seo from "@/content/seo.json";
const SORTS = new Set(["newest", "oldest", "featured", "az"]);
const asStr = (v: unknown) => (typeof v === "string" ? v : "");
const asSort = (v: unknown) => {
  const s = asStr(v);
  return (SORTS.has(s) ? s : "newest") as "newest" | "oldest" | "featured" | "az";
};



export const Route = createFileRoute("/projects/")({
  validateSearch: (s: Record<string, unknown>) => ({
    cat: asStr(s.cat),
    country: asStr(s.country),
    year: asStr(s.year),
    tag: asStr(s.tag),
    sort: asSort(s.sort),
  }),

  head: () => ({
    meta: [
      { title: seo.projects.ar.title },
      { name: "description", content: seo.projects.ar.description },
      { name: "keywords", content: seo.projects.ar.keywords },
      { property: "og:title", content: seo.projects.ar.og_title },
      { property: "og:description", content: seo.projects.ar.og_description },
      { property: "og:url", content: "/projects" },
    ],
    links: [{ rel: "canonical", href: "/projects" }],
  }),
  loader: async () => {
    const [projects, categories, stats] = await Promise.all([
      listPortfolio({ data: {} }),
      listCategories(),
      getProjectsStats(),
    ]);
    return { projects, categories, stats };
  },
  component: Page,
});

function Page() {
  const { projects, categories, stats } = Route.useLoaderData();
  return <ProjectsHubView projects={projects} categories={categories} stats={stats} routeId="/projects/" />;
}

