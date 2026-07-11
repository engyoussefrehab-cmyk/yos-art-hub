import { createFileRoute } from "@tanstack/react-router";
import { PackagesView } from "@/views/PackagesView";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "الباقات والأسعار — يوسف رحاب" },
      { name: "description", content: "باقات تصميم الهوية البصرية والشعارات — من الانطلاقة إلى الأنظمة البصرية المتكاملة. أسعار شفافة ومراحل عمل واضحة." },
      { name: "keywords", content: "أسعار تصميم هوية بصرية, باقات شعار, تكلفة هوية تجارية, أسعار مصمم جرافيك" },
      { property: "og:title", content: "الباقات والأسعار — يوسف رحاب" },
      { property: "og:description", content: "باقات تصميم الهوية البصرية والشعارات بأسعار شفافة." },
      { property: "og:url", content: "/packages" },
    ],
    links: [{ rel: "canonical", href: "/packages" }],
  }),
  component: PackagesView,
});
