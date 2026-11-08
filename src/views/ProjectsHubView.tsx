import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import type { DictKey } from "@/i18n/dictionary";
import type { PortfolioDTO, CategoryDTO, ProjectsStatsDTO } from "@/lib/portfolio.functions";
import { ProjectsBrowser } from "@/components/projects/ProjectsBrowser";
import { sectorOf } from "@/lib/sectors";
import {
  ArrowDot,
  Chip,
  Heading,
  PageHero,
  Stat,
  card,
  container,
  focusRing,
} from "@/components/studio";
import p5 from "@/assets/portfolio/page_5.webp";
import p22 from "@/assets/portfolio/page_22.webp";
import p27 from "@/assets/portfolio/page_27.webp";
import p34 from "@/assets/portfolio/page_34.webp";

const FALLBACK_COVERS: Record<string, string> = {
  branding: p5,
  logos: p22,
  profiles: p27,
  social: p34,
};

const FALLBACK_I18N: Record<string, { label: DictKey; desc: DictKey }> = {
  branding: { label: "cat_branding_label", desc: "cat_branding_desc" },
  logos: { label: "cat_logos_label", desc: "cat_logos_desc" },
  profiles: { label: "cat_profiles_label", desc: "cat_profiles_desc" },
  social: { label: "cat_social_label", desc: "cat_social_desc" },
};

export function ProjectsHubView({
  projects = [],
  categories = [],
  stats: statsOverride,
  routeId,
}: {
  projects?: PortfolioDTO[];
  categories?: CategoryDTO[];
  stats?: ProjectsStatsDTO;
  routeId: "/projects/";
}) {
  const { t } = useLang();

  const totalProjects = projects.length;
  // Business sectors (grouped), not the raw free-text industries.
  const sectorCount = new Set(projects.map((p) => sectorOf(p.industry)).filter((k) => k !== "other")).size;
  const countryCount = new Set(projects.map((p) => p.country).filter(Boolean) as string[]).size;

  const stats: { value: string; label: string }[] = [
    {
      value: `${statsOverride?.projects_count || totalProjects}+`,
      label: t("projects_stat_projects"),
    },
    {
      value: `${sectorCount || statsOverride?.sectors_count || categories.length}`,
      label: t("projects_stat_sectors"),
    },
    {
      value: `${statsOverride?.countries_count || countryCount || 4}+`,
      label: t("projects_stat_countries"),
    },
  ];

  return (
    <>
      <PageHero
        kicker={t("projects_kicker")}
        title="أعمال لعلامات حقيقية"
        lede="اختر مجال شركتك أو نوع الخدمة، وشاهد أعمالا لشركات تشبه شركتك."
        aside={
          <dl className="grid grid-cols-3 gap-2 lg:w-[360px]">
            {stats.map((s) => (
              <Stat key={s.label} value={s.value} label={s.label} />
            ))}
          </dl>
        }
      />

      {projects.length > 0 && (
        <section className={`${container} pt-16 md:pt-24`}>
          <ProjectsBrowser projects={projects} routeId={routeId} />
        </section>
      )}

      <section className={`${container} pb-28 pt-28 md:pb-40 md:pt-40`}>
        <Heading kicker="حسب نوع الخدمة" title={t("projects_title")} />
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {categories.map((c, i) => {
            const fallbackMeta = FALLBACK_I18N[c.slug];
            const label = c.name_ar || c.name_en;
            const desc = c.description_ar || (fallbackMeta ? t(fallbackMeta.desc) : "");
            const cover = c.cover_image_url || FALLBACK_COVERS[c.slug] || FALLBACK_COVERS.branding;
            return (
              <Link
                key={c.slug}
                to={`/projects/${c.slug}`}
                className={`group relative block overflow-hidden ${card} ${focusRing}`}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={cover}
                    alt={label}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"
                  />
                  <span className="absolute start-5 top-5">
                    <ArrowDot tone={i % 2 ? "light" : "red"} size="lg" />
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <Chip tone="solid">
                      {c.project_count}+ {t("projects_items")}
                    </Chip>
                    <h3 className="mt-3 font-display text-2xl font-bold text-white md:text-[2rem]">
                      {label}
                    </h3>
                    {desc && <p className="mt-2 line-clamp-2 text-sm text-white/70">{desc}</p>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
