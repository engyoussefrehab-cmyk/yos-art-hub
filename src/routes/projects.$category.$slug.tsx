import { createFileRoute, notFound } from "@tanstack/react-router";
import { listPortfolio, getPortfolioBySlug } from "@/lib/portfolio.functions";
import { ProjectDetailView } from "@/views/ProjectDetailView";

export const Route = createFileRoute("/projects/$category/$slug")({
  loader: async ({ params }) => {
    const project = await getPortfolioBySlug({ data: { slug: params.slug } });
    if (!project) throw notFound();
    if (project.category_slug && project.category_slug !== params.category) throw notFound();
    const all = await listPortfolio({ data: { category: params.category } });
    const idx = all.findIndex((p) => p.slug === project.slug);
    const next = idx >= 0 ? all[(idx + 1) % all.length] : null;
    return { project, next };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.project;
    const name = p?.name_ar ?? "مشروع";
    const short = p?.short_ar ?? "تفاصيل المشروع.";
    const title = p?.seo_title_ar || (p?.industry ? `${name} — ${p.industry}` : `${name} — يوسف رحاب`);
    const description = p?.seo_description_ar || short;
    const path = `/projects/${p?.category_slug ?? "branding"}/${p?.slug ?? ""}`;
    const ogImage = p?.og_image_url || p?.cover;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: `${name}, هوية بصرية, تصميم شعار, يوسف رحاب` },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: path },
        { property: "og:type", content: "article" },
        ...(ogImage ? [{ property: "og:image", content: ogImage }] : []),
        ...(ogImage ? [{ name: "twitter:image", content: ogImage }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: path }],
    };
  },
  component: ProjectDetail,
});

function ProjectDetail() {
  const { project, next } = Route.useLoaderData();
  return <ProjectDetailView project={project} next={next} />;
}
