import { createFileRoute } from "@tanstack/react-router";
import { ProjectsHubView } from "@/views/ProjectsHubView";
import { listPortfolio, listCategories, getProjectsStats } from "@/lib/portfolio.functions";


const SORTS = new Set(["newest", "oldest", "featured", "az"]);
const asStr = (v: unknown) => (typeof v === "string" ? v : "");
const asSort = (v: unknown) => {
  const s = asStr(v);
  return (SORTS.has(s) ? s : "newest") as "newest" | "oldest" | "featured" | "az";
};

export const Route = createFileRoute("/en/projects/")({
  validateSearch: (s: Record<string, unknown>) => ({
    cat: asStr(s.cat),
    country: asStr(s.country),
    year: asStr(s.year),
    tag: asStr(s.tag),
    sort: asSort(s.sort),
  }),
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
  return <ProjectsHubView projects={projects} categories={categories} stats={stats} routeId="/en/projects/" />;
}

