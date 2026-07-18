import { createFileRoute, notFound } from "@tanstack/react-router";
import { listPortfolio, getPortfolioBySlug } from "@/lib/portfolio.functions";
import { ProjectDetailView } from "@/views/ProjectDetailView";

export const Route = createFileRoute("/en/projects/$category/$slug")({
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
    const name = p?.name_en ?? "Project";
    const short = p?.short_en ?? "Project details.";
    const title = p?.industry ? `${name} — ${p.industry}` : `${name} — Youssef Rehab`;
    const path = `/en/projects/${p?.category_slug ?? "branding"}/${p?.slug ?? ""}`;
    return {
      meta: [
        { title },
        { name: "description", content: short },
        { name: "keywords", content: `${name}, brand identity, logo design, Youssef Rehab` },
        { property: "og:title", content: title },
        { property: "og:description", content: short },
        { property: "og:url", content: path },
        { property: "og:type", content: "article" },
        ...(p?.cover ? [{ property: "og:image", content: p.cover }] : []),
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
