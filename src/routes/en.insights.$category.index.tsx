import { createFileRoute, notFound } from "@tanstack/react-router";
import { InsightsCategoryView } from "@/views/InsightsCategoryView";
import { getCategory } from "@/lib/insights-data";

export const Route = createFileRoute("/en/insights/$category/")({
  loader: ({ params }) => {
    const cat = getCategory(params.category);
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ params, loaderData }) => {
    const label = loaderData?.cat.label.en ?? params.category;
    const desc = loaderData?.cat.description.en ?? "";
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
    const { category } = Route.useParams();
    return <InsightsCategoryView categorySlug={category} />;
  },
});
