import { createFileRoute } from "@tanstack/react-router";
import { ProjectsHubView } from "@/views/ProjectsHubView";

export const Route = createFileRoute("/projects/")({
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
  component: ProjectsHubView,
});
