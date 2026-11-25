import { createFileRoute, notFound } from "@tanstack/react-router";
import { listPortfolio, getCategoryBySlug, type CategoryDTO, type PortfolioDTO } from "@/lib/portfolio.functions";
import { CategoryView } from "@/views/CategoryView";

export const Route = createFileRoute("/projects/$category/")({
  loader: async ({ params }): Promise<{ category: CategoryDTO; projects: PortfolioDTO[] }> => {
    const [category, projects] = await Promise.all([
      getCategoryBySlug({ data: { slug: params.category } }),
      listPortfolio({ data: { category: params.category } }),
    ]);
    if (!category) throw notFound();
    return { category, projects };
  },
  head: ({ params, loaderData }) => {
    const c = loaderData?.category;
    const label = c ? (c.name_ar || c.name_en) : params.category;
    const title = `${label} — يوسف رحاب`;
    const desc = c?.description_ar || "أعمال مختارة.";
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
  component: CategoryPage,
});

function CategoryPage() {
  const { category, projects } = Route.useLoaderData();
  return <CategoryView category={category} projects={projects} />;
}
