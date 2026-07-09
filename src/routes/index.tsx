import { createFileRoute } from "@tanstack/react-router";
import { HomeView } from "@/views/HomeView";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "يوسف رحاب — مصمم هوية بصرية في السعودية والإمارات" },
      { name: "description", content: "مصمم هوية بصرية استراتيجي لعلامات السعودية والإمارات والخليج — 8+ سنوات خبرة و250+ علامة تجارية." },
      { property: "og:title", content: "يوسف رحاب — مصمم هوية بصرية" },
      { property: "og:description", content: "هويات بصرية وشعارات احترافية لعلامات السعودية والإمارات." },
      { property: "og:url", content: "/" },
      { property: "og:image", content: "https://project--30cd8622-cf1b-4401-a5a8-56d8d4f482e1.lovable.app/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "يوسف رحاب — مصمم هويات بصرية" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://project--30cd8622-cf1b-4401-a5a8-56d8d4f482e1.lovable.app/og-image.jpg" },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "alternate", hrefLang: "ar", href: "/" },
      { rel: "alternate", hrefLang: "ar-SA", href: "/" },
      { rel: "alternate", hrefLang: "ar-AE", href: "/" },
      { rel: "alternate", hrefLang: "en", href: "/en" },
      { rel: "alternate", hrefLang: "en-SA", href: "/en" },
      { rel: "alternate", hrefLang: "en-AE", href: "/en" },
      { rel: "alternate", hrefLang: "x-default", href: "/" },
    ],
  }),
  component: HomeView,
});
