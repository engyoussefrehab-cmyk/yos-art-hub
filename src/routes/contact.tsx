import { createFileRoute } from "@tanstack/react-router";
import { ContactView } from "@/views/ContactView";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل — يوسف رحاب" },
      { name: "description", content: "تواصل مع يوسف رحاب لمشاريع الهوية البصرية والتصميم الإبداعي." },
      { property: "og:title", content: "تواصل — يوسف رحاب" },
      { property: "og:description", content: "متاح لمشاريع الفريلانس والتعاونات." },
    ],
  }),
  component: ContactView,
});
