import { createFileRoute, notFound } from "@tanstack/react-router";
import { InsightsCategoryView } from "@/views/InsightsCategoryView";
import { getArticlesByCategoryFn, getCategoriesFn } from "@/lib/insights.functions";

export const Route = createFileRoute("/en/insights/$category/")({
  loader: async ({ params }) => {
    const [byCat, allCategories] = await Promise.all([
      getArticlesByCategoryFn({ data: { categorySlug: params.category } }),
      getCategoriesFn(),
    ]);
    if (!byCat.category) throw notFound();
    return { category: byCat.category, articles: byCat.articles, allCategories };
  },
  head: ({ params, loaderData }) => {
    const label = loaderData?.category.label_en ?? params.category;
    const desc = loaderData?.category.description_en ?? "";
    return {
      meta: [
        { title: `${label} — Insights | Youssef Rehab` },
        { name: "description", content: desc },
        { property: "og:title", content: `${label} — Insights` },
        { property: "og:description", content: desc },
        { property: "og:url", content: `/en/insights/${params.category}` },
      ],
      links: [{ rel: "canonical", href: `/en/insights/${params.category}` }],
    };
  },
  component: () => {
    const data = Route.useLoaderData();
    return <InsightsCategoryView category={data.category} articles={data.articles} allCategories={data.allCategories} />;
  },
});
