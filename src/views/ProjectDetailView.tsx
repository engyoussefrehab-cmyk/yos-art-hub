import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import type { PortfolioDTO } from "@/lib/portfolio.functions";
import { ProjectBlocksRenderer, type RenderContext } from "@/components/project-blocks/ProjectBlocksRenderer";

import { pair } from "@/i18n/dictionary";
const CAT_LABELS: Record<string, { ar: string; en: string }> = {
  branding: { ar: pair("cat_branding_label")[0], en: pair("cat_branding_label")[1] },
  logos: { ar: pair("cat_logos_label")[0], en: pair("cat_logos_label")[1] },
  profiles: { ar: pair("cat_profiles_label")[0], en: pair("cat_profiles_label")[1] },
  social: { ar: pair("ptype_social")[0], en: pair("ptype_social")[1] },
  presentations: { ar: pair("ui_projectdetailview_1")[0], en: pair("ui_projectdetailview_1")[1] },
  packaging: { ar: pair("ui_projectdetailview_2")[0], en: pair("ui_projectdetailview_2")[1] },
};

export function ProjectDetailView({
  project,
  next,
}: {
  project: PortfolioDTO;
  next: PortfolioDTO | null;
}) {
  const { t, lang } = useLang();
  const name = lang === "ar" ? project.name_ar : project.name_en;
  const catSlug = project.category_slug ?? "branding";
  const catLabel = CAT_LABELS[catSlug]?.[lang === "ar" ? "ar" : "en"] ?? catSlug;

  const projectsHref = lang === "ar" ? "/projects" : "/en/projects";
  const categoryHref = lang === "ar" ? `/projects/${catSlug}` : `/en/projects/${catSlug}`;

  const context: RenderContext = {
    projectName: name,
    categorySlug: catSlug,
    categoryLabel: catLabel,
    industry: project.industry ?? null,
    projectsHref,
    categoryHref,
    next: next
      ? {
          slug: next.slug,
          name: lang === "ar" ? next.name_ar : next.name_en,
          categorySlug: next.category_slug ?? null,
          href:
            lang === "ar"
              ? `/projects/${next.category_slug ?? catSlug}/${next.slug}`
              : `/en/projects/${next.category_slug ?? catSlug}/${next.slug}`,
        }
      : null,
  };

  return (
    <article>
      <div className="mx-auto max-w-7xl px-6 pt-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to={projectsHref} className="hover:text-foreground">
            {t("crumb_projects")}
          </Link>
          <span>/</span>
          <Link to={categoryHref} className="hover:text-foreground">
            {catLabel}
          </Link>
          <span>/</span>
          <span className="text-foreground">{name}</span>
        </nav>
      </div>
      <ProjectBlocksRenderer blocks={project.blocks} lang={lang} context={context} />
    </article>
  );
}
