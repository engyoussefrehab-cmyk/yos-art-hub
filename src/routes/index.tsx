import { createFileRoute } from "@tanstack/react-router";
import { HomeView } from "@/views/HomeView";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "يوسف رحاب — مصمم هوية بصرية" },
      { name: "description", content: "يوسف رحاب — مصمم هوية بصرية استراتيجي بخبرة 8+ سنوات مع أكثر من 250 علامة تجارية." },
      { property: "og:title", content: "يوسف رحاب — مصمم هوية بصرية" },
      { property: "og:description", content: "8+ سنوات خبرة في تصميم الهويات البصرية والشعارات." },
    ],
  }),
  component: HomeView,
});
