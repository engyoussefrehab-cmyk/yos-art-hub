import { createFileRoute } from "@tanstack/react-router";
import { HomeView } from "@/views/HomeView";

export const Route = createFileRoute("/en/")({
  head: () => ({
    meta: [
      { title: "Youssef Rehab — Visual Identity Designer in Saudi Arabia & UAE" },
      { name: "description", content: "Strategic visual identity and logo designer serving brands across Saudi Arabia, UAE and the Gulf — 8+ years and 250+ brand collaborations." },
      { property: "og:title", content: "Youssef Rehab — Visual Identity Designer" },
      { property: "og:description", content: "Brand identities and logos for Saudi Arabia & UAE businesses." },
      { property: "og:url", content: "/en" },
      { property: "og:locale", content: "en_US" },
    ],
    links: [
      { rel: "canonical", href: "/en" },
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
