import { createFileRoute, notFound } from "@tanstack/react-router";
import { listPortfolio } from "@/lib/portfolio.functions";
import { CategoryView } from "@/views/CategoryView";

const CATS = ["branding", "logos", "profiles", "social"] as const;

export const Route = createFileRoute("/en/projects/$category/")({
  head: ({ params }) => {
    const path = `/en/projects/${params.category}`;
    return {
      meta: [
        { title: "Selected work — Youssef Rehab" },
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
