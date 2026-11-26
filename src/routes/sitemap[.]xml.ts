import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import insightArticles from "@/data/snapshot/insight_articles.json";
import insightCategories from "@/data/snapshot/insight_categories.json";
import portfolioProjects from "@/data/snapshot/portfolio_projects.json";
import projectCategories from "@/data/snapshot/project_categories.json";

const publicPages = ["/", "/projects", "/contact", "/brief", "/quote-request/", "/tools", "/tools/color-brief/", "/tools/color-wheel/", "/tools/color-balance/", "/insights"];
const visibleProjectCategories = new Set(projectCategories.filter(({ is_hidden }) => !is_hidden).map(({ slug }) => slug));
const articleCategorySlugs = new Map(insightCategories.map(({ id, slug }) => [id, slug]));

function makeSitemap() {
  const pages = new Map<string, string | null>();
  for (const path of publicPages) pages.set(path, null);
  for (const slug of visibleProjectCategories) pages.set(`/projects/${encodeURIComponent(slug)}`, null);
  for (const slug of articleCategorySlugs.values()) pages.set(`/insights/${encodeURIComponent(slug)}`, null);

  for (const project of portfolioProjects) {
    const category = project.category_slug;
    if (project.status === "published" && category && visibleProjectCategories.has(category)) {
      pages.set(`/projects/${encodeURIComponent(category)}/${encodeURIComponent(project.slug)}`, project.updated_at || project.published_at);
    }
  }
  for (const article of insightArticles) {
    const category = articleCategorySlugs.get(article.category_id);
    if (article.status === "published" && category) {
      pages.set(`/insights/${encodeURIComponent(category)}/${encodeURIComponent(article.slug)}`, article.updated_at || article.published_at);
    }
  }

  const entries = Array.from(pages, ([path, date]) => {
    const lastmod = date?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    return `  <url><loc>${SITE_URL}${path}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`;
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
  ].join("\n");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => new Response(makeSitemap(), {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      }),
    },
  },
});
