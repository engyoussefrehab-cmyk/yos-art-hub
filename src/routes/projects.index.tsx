import { createFileRoute } from "@tanstack/react-router";
import { ProjectsHubView } from "@/views/ProjectsHubView";
import { listPortfolio, listCategories } from "@/lib/portfolio.functions";


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
      { title: "أعمال يوسف رحاب — هويات بصرية وشعارات وملفات شركات" },
      { name: "description", content: "مشاريع مختارة عبر أربعة تخصصات: الهوية البصرية، الشعارات، ملفات الشركات، والسوشيال ميديا — لعلامات السعودية والإمارات والخليج." },
      { name: "keywords", content: "أعمال هوية بصرية, بورتفوليو مصمم شعارات, ملفات شركات, سوشيال ميديا ديزاين, يوسف رحاب" },
      { property: "og:title", content: "المشاريع — يوسف رحاب" },
      { property: "og:description", content: "أعمال هوية بصرية وشعارات وملفات شركات وسوشيال ميديا." },
      { property: "og:url", content: "/projects" },
    ],
    links: [{ rel: "canonical", href: "/projects" }],
  }),
  loader: async () => {
    const [projects, categories] = await Promise.all([
      listPortfolio({ data: {} }),
      listCategories(),
    ]);
    return { projects, categories };
  },
  component: Page,
});

function Page() {
  const { projects, categories } = Route.useLoaderData();
  return <ProjectsHubView projects={projects} categories={categories} routeId="/projects/" />;
}

