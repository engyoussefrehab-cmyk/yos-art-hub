import { createFileRoute, notFound } from "@tanstack/react-router";
import { categories } from "@/lib/portfolio-data";
import { CategoryView } from "@/views/CategoryView";

export const Route = createFileRoute("/projects/$category/")({
  head: ({ params }) => {
    const cat = categories.find((c) => c.slug === params.category);
    const title = cat ? `${cat.label} — يوسف رحاب` : "مشاريع — يوسف رحاب";
    const desc = cat?.desc ?? "أعمال مختارة.";
    const path = `/projects/${params.category}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: `${cat?.label ?? "مشاريع"}, يوسف رحاب, تصميم السعودية, تصميم الإمارات, هوية بصرية` },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: path },
      ],
      links: [{ rel: "canonical", href: path }],
    };
  },
  loader: ({ params }) => {
    const cat = categories.find((c) => c.slug === params.category);
    if (!cat) throw notFound();
    return { category: cat };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  return <CategoryView categorySlug={category.slug} />;
}
