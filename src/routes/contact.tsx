import { createFileRoute } from "@tanstack/react-router";
import { ContactView } from "@/views/ContactView";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل مع يوسف رحاب — مصمم هوية بصرية" },
      { name: "description", content: "تواصل مع يوسف رحاب لمشاريع الهوية البصرية والشعارات وملفات الشركات في السعودية والإمارات والخليج." },
      { name: "keywords", content: "تواصل مصمم هوية بصرية, يوسف رحاب, تصميم شعار السعودية, تصميم هوية الإمارات, مصمم جرافيك الخليج" },
      { property: "og:title", content: "تواصل — يوسف رحاب" },
      { property: "og:description", content: "متاح لمشاريع الهوية البصرية والتعاونات في السعودية والإمارات." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactView,
});
