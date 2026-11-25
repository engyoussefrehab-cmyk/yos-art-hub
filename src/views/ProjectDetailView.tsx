import { Link } from "@tanstack/react-router";
import { StudioPage } from "@/components/studio-site";
import { ProjectFlipbook } from "@/components/project-blocks/ProjectFlipbook";
import caseStyles from "./project-case.css?inline";
import { useLang } from "@/i18n/use-lang";
import type { PortfolioDTO } from "@/lib/portfolio.functions";
import {
  ProjectBlocksRenderer,
  type RenderContext,
} from "@/components/project-blocks/ProjectBlocksRenderer";

import { pair } from "@/i18n/dictionary";
const CAT_LABELS: Record<string, { ar: string; en: string }> = {
  branding: { ar: pair("cat_branding_label")[0], en: pair("cat_branding_label")[1] },
  logos: { ar: pair("cat_logos_label")[0], en: pair("cat_logos_label")[1] },
  profiles: { ar: pair("cat_profiles_label")[0], en: pair("cat_profiles_label")[1] },
  social: { ar: pair("ptype_social")[0], en: pair("ptype_social")[1] },
  presentations: { ar: pair("ui_projectdetailview_1")[0], en: pair("ui_projectdetailview_1")[1] },
  packaging: { ar: pair("ui_projectdetailview_2")[0], en: pair("ui_projectdetailview_2")[1] },
};

const isPdf = (url: string) => /\.pdf(?:[?#]|$)/i.test(url);

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

  const projectsHref = "/projects";
  const categoryHref = `/projects/${catSlug}`;

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
          href: `/projects/${next.category_slug ?? catSlug}/${next.slug}`,
        }
      : null,
  };

  const hero = project.blocks.find((block) => block.type === "hero");
  const showIntro = hero?.enabled !== false;
  const title = (showIntro && (hero?.title_ar || hero?.title_en)) || name;
  const subtitle = showIntro && (hero ? hero.subtitle_ar || hero.subtitle_en : project.short_ar);
  const description = showIntro && (hero ? hero.description_ar || hero.description_en : project.description_ar);
  const industry = hero?.type_value_ar || hero?.type_value_en || project.industry;
  const typeLabel = hero?.type_label_ar && hero.type_label_ar !== t("proj_type") ? hero.type_label_ar : "القطاع";
  const showMeta = showIntro && hero?.show_meta_card !== false && (industry || project.country || hero?.specialty_value_ar);
  const covers = project.blocks
    .filter((block) => block.type === "cover")
    .filter((block) => block.enabled !== false && block.url && !isPdf(block.url));
  const gallery = [
    ...project.gallery,
    ...project.blocks.flatMap((block) => block.type === "gallery" && block.enabled !== false ? block.urls ?? [] : []),
  ].filter((url) => url && !isPdf(url));
  const coverPages = covers.map((block) => block.url).filter((url) => !gallery.includes(url));
  const pages = gallery.length ? [...new Set([...coverPages, ...gallery])] : [];
  const bookTitle = catSlug === "profiles" ? "تصفّح الملف التعريفي" : pages.length > 1 ? "تصفّح صور المشروع" : "عرض المشروع";
  const blocks = project.blocks
    .filter((block) => block.type !== "hero" && block.type !== "cover" && block.type !== "gallery")
    .map((block) => {
      if (block.type === "links") return { ...block, items: (block.items ?? []).filter(({ url }) => !isPdf(url)) };
      if (block.type === "approach" && catSlug === "profiles" && block.title_ar === pair("ui_project_blocks_10")[0]) {
        return { ...block, title_ar: "كيف صممنا الملف" };
      }
      return block;
    });

  return (
    <StudioPage active="work">
      <style dangerouslySetInnerHTML={{ __html: caseStyles }} />
      <article className="project-case">
        <nav aria-label="مسار الصفحة" className="case-crumbs">
          <a href={projectsHref}>{t("crumb_projects")}</a>
          <span aria-hidden="true">/</span>
          <Link to={categoryHref}>{catLabel}</Link>
        </nav>
        <header className="case-hero">
          <span className="case-hero-kicker">{(showIntro && (hero?.kicker_ar || hero?.kicker_en)) || catLabel}</span>
          <h1 className="case-hero-title">{title}</h1>
          {(subtitle || showMeta) && (
            <div className="case-hero-info">
              {subtitle && <p className="case-hero-subtitle">{subtitle}</p>}
              {showMeta && (
                <dl className="case-hero-meta">
                  {industry && <div><dt>{typeLabel}</dt><dd>{industry}</dd></div>}
                  {project.country && <div><dt>الدولة</dt><dd>{project.country}</dd></div>}
                  {hero?.specialty_value_ar && <div><dt>{hero.specialty_label_ar || "المجال"}</dt><dd>{hero.specialty_value_ar}</dd></div>}
                </dl>
              )}
            </div>
          )}
        </header>
        {pages.length > 0
          ? <ProjectFlipbook key={project.slug} pages={pages} name={name} title={bookTitle} rtl={lang === "ar"} />
          : <ProjectBlocksRenderer blocks={covers} lang={lang} context={context} />}
        {description && (
          <section className="case-overview" aria-labelledby="case-overview-title">
            <h2 id="case-overview-title">عن المشروع</h2>
            <p>{description}</p>
          </section>
        )}
        <ProjectBlocksRenderer blocks={blocks} lang={lang} context={context} />
      </article>
    </StudioPage>
  );
}
