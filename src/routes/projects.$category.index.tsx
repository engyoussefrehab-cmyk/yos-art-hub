import { createFileRoute, notFound } from "@tanstack/react-router";
import { listPortfolio } from "@/lib/portfolio.functions";
import { CategoryView } from "@/views/CategoryView";

const CATS = ["branding", "logos", "profiles", "social"] as const;

const catMeta: Record<string, { labelAr: string; labelEn: string; descAr: string }> = {
  branding: { labelAr: "الهوية البصرية", labelEn: "Brand Identity", descAr: "هويات بصرية استراتيجية." },
  logos: { labelAr: "الشعارات", labelEn: "Logos", descAr: "شعارات دقيقة." },
  profiles: { labelAr: "ملفات الشركات", labelEn: "Company Profiles", descAr: "ملفات شركات مقنعة." },
  social: { labelAr: "سوشيال ميديا", labelEn: "Social Media", descAr: "منشورات إبداعية." },
};

export const Route = createFileRoute("/projects/$category/")({
  head: ({ params }) => {
    const m = catMeta[params.category];
    const title = m ? `${m.labelAr} — يوسف رحاب` : "مشاريع — يوسف رحاب";
    const desc = m?.descAr ?? "أعمال مختارة.";
    const path = `/projects/${params.category}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: path },
      ],
      links: [{ rel: "canonical", href: path }],
    };
  },
  loader: async ({ params }) => {
    if (!CATS.includes(params.category as any)) throw notFound();
    const projects = params.category === "branding"
      ? await listPortfolio({ data: { category: "branding" } })
      : [];
    return { categorySlug: params.category, projects };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { categorySlug, projects } = Route.useLoaderData();
  return <CategoryView categorySlug={categorySlug} projects={projects} />;
}
