import { createFileRoute } from "@tanstack/react-router";
import { HomeView } from "@/views/HomeView";
import { listServices } from "@/lib/services.functions";
import { listPortfolio } from "@/lib/portfolio.functions";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [services, projects] = await Promise.all([
      listServices().catch(() => []),
      listPortfolio({ data: {} }).catch(() => []),
    ]);
    return { services, projects };
  },
  head: () => ({
    meta: [
      { title: "يوسف رحاب — مصمم هوية بصرية في السعودية والإمارات" },
      { name: "description", content: "مصمم هوية بصرية استراتيجي لعلامات السعودية والإمارات والخليج — 8+ سنوات خبرة و250+ علامة تجارية." },
      { name: "keywords", content: "مصمم هوية بصرية, تصميم شعار السعودية, تصميم هوية الإمارات, مصمم جرافيك الخليج, ملفات شركات, يوسف رحاب" },
      { property: "og:title", content: "يوسف رحاب — مصمم هوية بصرية في السعودية والإمارات" },
      { property: "og:description", content: "مصمم هوية بصرية استراتيجي لعلامات السعودية والإمارات والخليج — 8+ سنوات خبرة و250+ علامة تجارية." },
      { property: "og:url", content: "/" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/c7PudvvpxgTNZbNywwP2DRvYmIk2/social-images/social-1783592902412-ChatGPT_Image_Jul_9,_2026,_01_28_06_PM.webp" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "يوسف رحاب — مصمم هويات بصرية" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/c7PudvvpxgTNZbNywwP2DRvYmIk2/social-images/social-1783592902412-ChatGPT_Image_Jul_9,_2026,_01_28_06_PM.webp" },
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
  component: HomeRoute,
});

function HomeRoute() {
  const services = Route.useLoaderData();
  return <HomeView services={services} />;
}
