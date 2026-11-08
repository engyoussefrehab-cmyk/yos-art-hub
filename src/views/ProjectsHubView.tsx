import { useLang } from "@/i18n/use-lang";
import type { PortfolioDTO, CategoryDTO, ProjectsStatsDTO } from "@/lib/portfolio.functions";
import { ProjectsBrowser } from "@/components/projects/ProjectsBrowser";
import { sectorOf } from "@/lib/sectors";
import { PageHero, Stat, container } from "@/components/studio";

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
        <section className={`${container} pb-28 pt-12 md:pb-40 md:pt-16`}>
          <ProjectsBrowser projects={projects} routeId={routeId} />
        </section>
      )}
    </>
  );
}
