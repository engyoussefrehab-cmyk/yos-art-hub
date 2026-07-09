import { createFileRoute, notFound } from "@tanstack/react-router";
import { categories } from "@/lib/portfolio-data";
import { CategoryView } from "@/views/CategoryView";

const catLabelsEn: Record<string, string> = {
  branding: "Visual Identity",
  logos: "Logos",
  profiles: "Company Profiles",
  social: "Social Media",
};

export const Route = createFileRoute("/en/projects/$category/")({
  head: ({ params }) => {
    const label = catLabelsEn[params.category] ?? "Projects";
    const path = `/en/projects/${params.category}`;
    return {
      meta: [
        { title: `${label} — Youssef Rehab` },
        { name: "description", content: `Selected ${label.toLowerCase()} work for Saudi Arabia, UAE and Gulf brands.` },
        { name: "keywords", content: `${label}, Youssef Rehab, Saudi Arabia design, UAE design, brand identity` },
        { property: "og:title", content: `${label} — Youssef Rehab` },
        { property: "og:description", content: `Selected ${label.toLowerCase()} work.` },
        { property: "og:url", content: path },
      ],
      links: [{ rel: "canonical", href: path }],
    };
  },
  loader: ({ params }) => {
    const cat = categories.find((c) => c.slug === params.category);
    if (!cat) throw notFound();
    return { slug: cat.slug };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useLoaderData();
  return <CategoryView categorySlug={slug} />;
}
