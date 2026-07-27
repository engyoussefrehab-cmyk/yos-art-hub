import { Link } from "@tanstack/react-router";
import youssefPortrait from "@/assets/youssef-portrait.jpg.asset.json";
import portfolioPdf from "@/assets/portfolio.pdf.asset.json";
import svcVisualIdentity from "@/assets/services/visual-identity.jpg.asset.json";
import svcLogoDesign from "@/assets/services/logo-design.jpg.asset.json";
import svcCompanyProfile from "@/assets/services/company-profile.jpg.asset.json";
import svcSocialMedia from "@/assets/services/social-media.jpg.asset.json";
import svcDesignSystem from "@/assets/services/design-system.jpg.asset.json";
import svcCreativeDirection from "@/assets/services/creative-direction.jpg.asset.json";
import { Testimonials } from "@/components/Testimonials";
import { ClientsMarquee } from "@/components/ClientsMarquee";
import { LatestProjectsSlider } from "@/components/projects/LatestProjectsSlider";
import { Reveal } from "@/components/Reveal";
import { useLang } from "@/i18n/use-lang";
import type { DictKey } from "@/i18n/dictionary";
import type { ServiceDTO } from "@/lib/services.functions";
import type { PortfolioDTO } from "@/lib/portfolio.functions";

const SERVICE_FALLBACK_IMAGES = [
  svcVisualIdentity.url,
  svcLogoDesign.url,
  svcCompanyProfile.url,
  svcSocialMedia.url,
  svcDesignSystem.url,
  svcCreativeDirection.url,
];

export function HomeView({ services = [], projects = [] }: { services?: ServiceDTO[]; projects?: PortfolioDTO[] }) {
  return (
    <>
      <Hero />
      <About />
      {projects.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <Reveal>
            <LatestProjectsSlider projects={projects} compact limit={10} />
          </Reveal>
        </section>
      )}
      <Services items={services} />
      <Process />
      <ClientsMarquee />
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
      {/* Ambient background accents */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-7 flex flex-col justify-center">
          <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-cream px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {t("hero_badge")}
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
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Link to={projectsHref} className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-14px_hsl(var(--primary)/0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto">
              {t("hero_cta_projects")}
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                {lang === "ar" ? "←" : "→"}
              </span>
            </Link>
            <Link to={contactHref} className="inline-flex w-full items-center justify-center rounded-full border border-foreground/15 px-7 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto">
              {t("cta_start_project")}
            </Link>
            <a
              href={portfolioPdf.url}
              download="Youssef-Rehab-Portfolio.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-3 py-3 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
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
            <img src={youssefPortrait.url} alt={t("brand_alt")} className="h-full w-full object-cover object-center transition-transform duration-[1200ms] hover:scale-[1.03]" />
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

      {/* Scroll cue */}
      <div className="pointer-events-none mx-auto hidden max-w-7xl px-6 pb-6 md:block">
        <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
          <span className="h-px w-10 bg-border" />
          <span className="tracking-wide">{t("home_scroll_cue")}</span>
          <span aria-hidden className="inline-block animate-bounce">↓</span>
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
          <Reveal>
            <p className="text-lg leading-relaxed text-foreground/90">{t("about_p1")}</p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{t("about_p2")}</p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-10">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("about_skills_kicker")}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {skillKeys.map((k) => (
                  <span key={k} className="rounded-full border border-border bg-background px-4 py-2 text-sm transition-colors hover:border-accent/60 hover:text-accent">{t(k)}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Services({ items }: { items: ServiceDTO[] }) {
  const { t, lang } = useLang();
  const fallback: Array<{ title: string; desc: string; image: string }> = ([
    ["svc_1_t", "svc_1_d"],
    ["svc_2_t", "svc_2_d"],
    ["svc_3_t", "svc_3_d"],
    ["svc_4_t", "svc_4_d"],
    ["svc_5_t", "svc_5_d"],
    ["svc_6_t", "svc_6_d"],
  ] as [DictKey, DictKey][]).map(([tk, dk], i) => ({
    title: t(tk),
    desc: t(dk),
    image: SERVICE_FALLBACK_IMAGES[i],
  }));

  const list = items.length
    ? items.map((s, i) => ({
        title: lang === "ar" ? s.title_ar : s.title_en,
        desc: lang === "ar" ? s.description_ar : s.description_en,
        image: s.cover_url || SERVICE_FALLBACK_IMAGES[i % SERVICE_FALLBACK_IMAGES.length],
      }))
    : fallback;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">{t("services_kicker")}</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">{t("services_title")}</h2>
        </div>
        <p className="hidden md:block max-w-md text-muted-foreground">{t("services_lede")}</p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((item, i) => (
          <Reveal key={i} delay={i * 60}>
            <article
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-background transition-all duration-500 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_30px_60px_-30px_rgb(0_0_0/0.25)]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
                <span
                  className={`absolute top-4 font-display text-xs font-semibold tracking-widest text-white/90 ${lang === "ar" ? "right-4" : "left-4"}`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl font-bold text-foreground transition-colors group-hover:text-accent md:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                <div className={`mt-5 inline-flex items-center gap-2 text-xs font-semibold text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                  <span>{lang === "ar" ? "اعرف المزيد" : "Learn more"}</span>
                  <span aria-hidden>{lang === "ar" ? "←" : "→"}</span>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Process({ methodology }: { methodology?: MethodologyDataDTO }) {
  const { t, lang } = useLang();
  const fallback: Array<{ t: DictKey; d: DictKey }> = [
    { t: "process_1_t", d: "process_1_d" },
    { t: "process_2_t", d: "process_2_d" },
    { t: "process_3_t", d: "process_3_d" },
    { t: "process_4_t", d: "process_4_d" },
  ];
  const copy = methodology?.copy;
  if (copy && copy.is_visible === false) return null;

  const pick = (ar?: string | null, en?: string | null, fb?: string) => {
    const v = lang === "ar" ? ar : en;
    return v && v.trim() ? v : fb ?? "";
  };

  const cmsSteps = methodology?.steps ?? [];
  const steps = cmsSteps.length
    ? cmsSteps.map((s) => ({
        key: s.id,
        title: pick(s.title_ar, s.title_en),
        desc: pick(s.description_ar, s.description_en),
      }))
    : fallback.map((s) => ({ key: s.t, title: t(s.t), desc: t(s.d) }));

  const kicker = pick(copy?.kicker_ar, copy?.kicker_en, t("process_kicker"));
  const title = pick(copy?.title_ar, copy?.title_en, t("process_title"));
  const lede = pick(copy?.lede_ar, copy?.lede_en, t("process_lede"));

  return (
    <section className="border-y border-border bg-cream/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">{kicker}</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">{title}</h2>
          <p className="mt-4 text-muted-foreground">{lede}</p>
        </div>
        <div className="relative mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connector line — desktop only */}
          <div aria-hidden className="pointer-events-none absolute inset-x-6 top-10 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />
          {steps.map((step, i) => (
            <Reveal key={step.key} delay={i * 90}>
              <div className="relative flex h-full flex-col rounded-2xl border border-border bg-background p-6 transition-all duration-500 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_20px_40px_-24px_rgb(0_0_0/0.2)]">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 font-display text-sm font-bold text-accent ring-4 ring-background">
                    {lang === "ar" ? ["١","٢","٣","٤","٥","٦","٧","٨"][i] ?? String(i + 1) : String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <h3 className="font-display text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const { t, lang } = useLang();
  const contactHref = lang === "ar" ? "/contact" : "/en/contact";
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-1/4 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-20 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
            {t("cta_title_a")} <span className="text-accent">{t("cta_title_b")}</span>
          </h2>
          <p className="mt-4 max-w-xl text-white/70">{t("cta_sub")}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {t("cta_reply_time")}
            </span>
            <span className="hidden h-3 w-px bg-white/20 md:inline-block" />
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {t("hero_badge")}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <Link
            to={contactHref}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-bold text-primary transition-transform hover:-translate-y-0.5"
          >
            {t("cta_button")}
          </Link>
          <a
            href="mailto:youssefrehab@yrstudio.art"
            className="text-xs text-white/60 underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            youssefrehab@yrstudio.art
          </a>
        </div>
      </div>
    </section>
  );
}
