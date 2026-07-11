import { createFileRoute } from "@tanstack/react-router";
import { PackagesView } from "@/views/PackagesView";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "فئات الخدمات — يوسف رحاب" },
      { name: "description", content: "اختر الحلّ المناسب لعلامتك — فئات خدمات مدروسة من انطلاق العلامة إلى نظام هويّةٍ متكامل. تصميمُ هويّةٍ استراتيجيّ للأعمال النامية." },
      { name: "keywords", content: "فئات خدمات الهوية البصرية, أسعار تصميم الهوية, باقات تصميم شعار, استشارات علامة تجارية" },
      { property: "og:title", content: "فئات الخدمات — يوسف رحاب" },
      { property: "og:description", content: "فئات خدمات هوية بصريّة مدروسة — من الانطلاق إلى نظام علامة متكامل." },
      { property: "og:url", content: "/packages" },
    ],
    links: [{ rel: "canonical", href: "/packages" }],
  }),
  component: PackagesView,
});
