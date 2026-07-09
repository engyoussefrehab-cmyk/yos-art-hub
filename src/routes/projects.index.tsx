import { createFileRoute } from "@tanstack/react-router";
import { ProjectsHubView } from "@/views/ProjectsHubView";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "المشاريع — يوسف رحاب" },
      { name: "description", content: "مشاريع مختارة عبر أربعة تخصصات: الهوية البصرية، الشعارات، ملفات الشركات، والسوشيال ميديا." },
    ],
  }),
  component: ProjectsHubView,
});
