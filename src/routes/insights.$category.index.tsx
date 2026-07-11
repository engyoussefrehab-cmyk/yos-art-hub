import { createFileRoute, notFound } from "@tanstack/react-router";
import { InsightsCategoryView } from "@/views/InsightsCategoryView";
import { getArticlesByCategoryFn, getCategoriesFn } from "@/lib/insights.functions";

export const Route = createFileRoute("/insights/$category/")({
  loader: async ({ params }) => {
    const [byCat, allCategories] = await Promise.all([
      getArticlesByCategoryFn({ data: { categorySlug: params.category } }),
      getCategoriesFn(),
    ]);
    if (!byCat.category) throw notFound();
    return { category: byCat.category, articles: byCat.articles, allCategories };
  },
  head: ({ params, loaderData }) => {
    const label = loaderData?.category.label_ar ?? params.category;
    const desc = loaderData?.category.description_ar ?? "";
    return {
      meta: [
        { title: `${label} — رؤى | يوسف رحاب` },
        { name: "description", content: desc },
        { property: "og:title", content: `${label} — رؤى` },
        { property: "og:description", content: desc },
        { property: "og:url", content: `/insights/${params.category}` },
      ],
      links: [{ rel: "canonical", href: `/insights/${params.category}` }],
    };
  },
  component: () => {
    const data = Route.useLoaderData();
    return <InsightsCategoryView category={data.category} articles={data.articles} allCategories={data.allCategories} />;
  },
});
