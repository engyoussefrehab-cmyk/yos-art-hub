import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import type { PortfolioDTO } from "@/lib/portfolio.functions";
import { ProjectBlocksRenderer, type RenderContext } from "@/components/project-blocks/ProjectBlocksRenderer";

const CAT_LABELS: Record<string, { ar: string; en: string }> = {
  branding: { ar: "الهوية البصرية", en: "Visual Identity" },
  logos: { ar: "الشعارات", en: "Logos" },
  profiles: { ar: "ملفات الشركات", en: "Company Profiles" },
  social: { ar: "سوشيال ميديا", en: "Social Media" },
  presentations: { ar: "العروض التقديمية", en: "Presentations" },
  packaging: { ar: "التغليف", en: "Packaging" },
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
