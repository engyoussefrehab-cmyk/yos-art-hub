import { Link } from "@tanstack/react-router";
import youssefPortrait from "@/assets/youssef-portrait.jpg.asset.json";
import portfolioPdf from "@/assets/portfolio.pdf.asset.json";
import { Testimonials } from "@/components/Testimonials";
import { useLang } from "@/i18n/use-lang";
import type { DictKey } from "@/i18n/dictionary";

export function HomeView() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Testimonials />
      <CTA />
    </>
  );
}

function Hero() {
  const { t, lang } = useLang();
  const projectsHref = lang === "ar" ? "/projects" : "/en/projects";
  const contactHref = lang === "ar" ? "/contact" : "/en/contact";
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-7 flex flex-col justify-center">
          <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-cream px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent" /> {t("hero_badge")}
          </span>
          <h1 className="font-display text-[2rem] font-semibold leading-[1.45] text-balance sm:text-4xl md:text-5xl lg:text-6xl md:leading-[1.3]">
            {t("hero_title_a")} <span className="text-accent">{t("hero_title_b")}</span>
            <span className="block mt-2 text-muted-foreground/90 font-normal text-[0.72em]">
              {t("hero_subtitle")}
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-[1.9] text-muted-foreground md:text-lg">
            {t("hero_intro")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to={projectsHref} className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">{t("hero_cta_projects")}</Link>
            <Link to={contactHref} className="rounded-full border border-primary/20 px-7 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-cream">{t("cta_start_project")}</Link>
            <a
              href={portfolioPdf.url}
              download="Youssef-Rehab-Portfolio.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-7 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-primary"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {t("hero_cta_download")}
            </a>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8">
            <Stat n={lang === "ar" ? "+٨" : "8+"} labelKey="stat_years" />
            <Stat n={lang === "ar" ? "+٢٥٠" : "250+"} labelKey="stat_brands" />
            <Stat n={lang === "ar" ? "+٢٠" : "20+"} labelKey="stat_sectors" />
          </div>
        </div>
        <div className="md:col-span-5 relative flex items-center justify-center">
          <div className={`absolute inset-0 hidden md:block rounded-3xl border border-accent/30 ${lang === "ar" ? "-translate-x-4 translate-y-4" : "translate-x-4 translate-y-4"}`} aria-hidden />
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-ink shadow-2xl">
            <img src={youssefPortrait.url} alt={t("brand_alt")} className="h-full w-full object-cover object-center" />
          </div>
          <div className={`absolute -bottom-5 hidden md:flex items-center gap-3 rounded-full bg-accent px-5 py-3 text-primary shadow-xl ${lang === "ar" ? "right-6" : "left-6"}`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold">YR</span>
            <div className="leading-tight">
              <div className="font-display text-[10px] font-semibold uppercase tracking-widest opacity-70">{t("strategic_brand")}</div>
              <div className="font-display text-base font-bold">{t("identity_designer")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, labelKey }: { n: string; labelKey: DictKey }) {
  const { t } = useLang();
  return (
    <div>
      <div className="font-display text-3xl md:text-4xl font-bold">{n}</div>
      <div className="mt-1 text-xs text-muted-foreground">{t(labelKey)}</div>
    </div>
  );
}

function About() {
  const { t } = useLang();
  const skillKeys: DictKey[] = [
    "skill_visual_identity",
    "skill_visual_systems",
    "skill_logo_design",
    "skill_generative_ai",
    "skill_presentation",
    "skill_social",
    "skill_typography",
    "skill_creative_direction",
  ];
  return (
    <section className="border-y border-border bg-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-24 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="sticky top-24">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">{t("about_kicker")}</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold leading-tight">{t("about_title_a")}<br /> {t("about_title_b")}</h2>
          </div>
        </div>
        <div className="md:col-span-7">
          <p className="text-lg leading-relaxed text-foreground/90">{t("about_p1")}</p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{t("about_p2")}</p>
          <div className="mt-10">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("about_skills_kicker")}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {skillKeys.map((k) => (
                <span key={k} className="rounded-full border border-border bg-background px-4 py-2 text-sm">{t(k)}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const { t } = useLang();
  const items: [DictKey, DictKey][] = [
    ["svc_1_t", "svc_1_d"],
    ["svc_2_t", "svc_2_d"],
    ["svc_3_t", "svc_3_d"],
    ["svc_4_t", "svc_4_d"],
    ["svc_5_t", "svc_5_d"],
    ["svc_6_t", "svc_6_d"],
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">{t("services_kicker")}</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">{t("services_title")}</h2>
        </div>
        <p className="hidden md:block max-w-md text-muted-foreground">{t("services_lede")}</p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
        {items.map(([tk, dk], i) => (
          <div key={tk} className="group bg-background p-8 transition-colors hover:bg-cream">
            <div className="font-display text-6xl font-bold text-accent/20 group-hover:text-accent/40 transition-colors">{String(i + 1).padStart(2, "0")}</div>
            <h3 className="mt-4 font-display text-2xl font-bold">{t(tk)}</h3>
            <p className="mt-2 text-muted-foreground">{t(dk)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  const { t, lang } = useLang();
  const contactHref = lang === "ar" ? "/contact" : "/en/contact";
  return (
    <section className="bg-ink text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-20 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
            {t("cta_title_a")} <span className="text-accent">{t("cta_title_b")}</span>
          </h2>
          <p className="mt-4 max-w-xl text-white/70">{t("cta_sub")}</p>
        </div>
        <Link to={contactHref} className="inline-flex rounded-full bg-accent px-8 py-4 text-sm font-bold text-primary transition-transform hover:-translate-y-0.5">{t("cta_button")}</Link>
      </div>
    </section>
  );
}
