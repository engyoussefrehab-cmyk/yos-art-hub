import { createFileRoute } from "@tanstack/react-router";
import { ProjectsHubView } from "@/views/ProjectsHubView";
import { listPortfolio } from "@/lib/portfolio.functions";

const SORTS = new Set(["newest", "oldest", "featured", "az"]);
const asStr = (v: unknown) => (typeof v === "string" ? v : "");
const asSort = (v: unknown) => {
  const s = asStr(v);
  return (SORTS.has(s) ? s : "newest") as "newest" | "oldest" | "featured" | "az";
};



export const Route = createFileRoute("/projects/")({
  validateSearch: zodValidator(searchSchema),
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
  loader: () => listPortfolio({ data: {} }),
  component: Page,
});

function Page() {
  const projects = Route.useLoaderData();
  return <ProjectsHubView projects={projects} routeId="/projects/" />;
}
