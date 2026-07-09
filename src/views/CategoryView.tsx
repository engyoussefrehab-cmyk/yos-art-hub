import { Link } from "@tanstack/react-router";
import { brandingProjects, categories, logoBoards, profileBoards, socialBoards } from "@/lib/portfolio-data";
import { useLang } from "@/i18n/use-lang";
import { projectI18n } from "@/i18n/portfolio-en";
import type { DictKey } from "@/i18n/dictionary";

const catI18n: Record<string, { label: DictKey; desc: DictKey }> = {
  branding: { label: "cat_branding_label", desc: "cat_branding_desc" },
  logos: { label: "cat_logos_label", desc: "cat_logos_desc" },
  profiles: { label: "cat_profiles_label", desc: "cat_profiles_desc" },
  social: { label: "cat_social_label", desc: "cat_social_desc" },
};

export function CategoryView({ categorySlug }: { categorySlug: string }) {
  const { t, lang } = useLang();
  const cat = categories.find((c) => c.slug === categorySlug);
  if (!cat) return null;
  const meta = catI18n[cat.slug];
  const label = meta ? t(meta.label) : cat.label;
  const desc = meta ? t(meta.desc) : cat.desc;
  const projectsHref = lang === "ar" ? "/projects" : "/en/projects";

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to={projectsHref} className="hover:text-foreground">{t("crumb_projects")}</Link>
        <span>/</span>
        <span className="text-foreground">{label}</span>
      </nav>
      <header className="max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">{t("cat_kicker")}</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold leading-tight">{label}</h1>
        <p className="mt-5 text-lg text-muted-foreground">{desc}</p>
      </header>

      <div className="mt-14">
        {cat.slug === "branding" && <BrandingList />}
        {cat.slug === "logos" && <ImageGrid images={logoBoards} labelKey="logo_board" cols={2} />}
        {cat.slug === "profiles" && <ImageGrid images={profileBoards} labelKey="profile_board" cols={3} />}
        {cat.slug === "social" && <ImageGrid images={socialBoards} labelKey="post_board" cols={3} />}
      </div>
    </section>
  );
}

function BrandingList() {
  const { t, lang } = useLang();
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {brandingProjects.map((p, i) => {
        const loc = projectI18n(p.slug, lang, p);
        const idx = String(i + 1).padStart(2, "0");
        const href = lang === "ar" ? `/projects/branding/${p.slug}` : `/en/projects/branding/${p.slug}`;
        return (
          <Link
            key={p.slug}
            to={href}
            className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-cream transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="aspect-[16/11] overflow-hidden">
              <img src={p.cover} alt={loc.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="p-6 md:p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
                <span>{idx}</span>
                <span className="h-px w-8 bg-border" />
                <span>{loc.country} · {p.year}</span>
              </div>
              <h3 className="mt-3 font-display text-2xl md:text-3xl font-bold">{loc.name}</h3>
              <div className="mt-1 text-accent font-medium text-sm">{loc.tagline}</div>
              <p className="mt-3 text-muted-foreground leading-relaxed">{loc.short}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                {t("view_project")} <span aria-hidden>{lang === "ar" ? "←" : "→"}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ImageGrid({ images, labelKey, cols }: { images: string[]; labelKey: DictKey; cols: 2 | 3 }) {
  const { t } = useLang();
  const gridCls = cols === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";
  const label = t(labelKey);
  return (
    <div className={`grid grid-cols-1 gap-6 ${gridCls}`}>
      {images.map((src, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border bg-cream">
          <img src={src} alt={`${label} ${i + 1}`} loading="lazy" className="w-full" />
        </div>
      ))}
    </div>
  );
}
