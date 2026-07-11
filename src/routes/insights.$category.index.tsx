import { createFileRoute, notFound } from "@tanstack/react-router";
import { InsightsCategoryView } from "@/views/InsightsCategoryView";
import { getCategory } from "@/lib/insights-data";

export const Route = createFileRoute("/insights/$category/")({
  loader: ({ params }) => {
    const cat = getCategory(params.category);
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ params, loaderData }) => {
    const label = loaderData?.cat.label.ar ?? params.category;
    const desc = loaderData?.cat.description.ar ?? "";
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
    const { category } = Route.useParams();
    return <InsightsCategoryView categorySlug={category} />;
  },
});
