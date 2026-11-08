import { createFileRoute } from "@tanstack/react-router";
import { BriefView } from "@/views/BriefView";

export const Route = createFileRoute("/brief")({
  head: () => ({
    meta: [
      { title: "نموذج المشروع | يوسف رحاب" },
      {
        name: "description",
        content:
          "أخبرني عن مشروعك في خمس خطوات قصيرة: نشاطك، والخدمة التي تحتاجها، والذوق، والميزانية والوقت.",
      },
      { property: "og:title", content: "نموذج المشروع — يوسف رحاب" },
      { property: "og:url", content: "/brief" },
    ],
    links: [{ rel: "canonical", href: "/brief" }],
  }),
  component: BriefView,
});
