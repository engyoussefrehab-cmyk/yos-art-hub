import { Link } from "@tanstack/react-router";
import youssefPortrait from "@/assets/youssef-portrait.jpg.asset.json";
import portfolioPdf from "@/assets/portfolio.pdf.asset.json";
import { Testimonials } from "@/components/Testimonials";
import { ClientsMarquee } from "@/components/ClientsMarquee";
import { LatestProjectsSlider } from "@/components/projects/LatestProjectsSlider";
import { Reveal } from "@/components/Reveal";
import { useLang } from "@/i18n/use-lang";
import type { DictKey } from "@/i18n/dictionary";
import type { ServiceDTO } from "@/lib/services.functions";
import type { PortfolioDTO } from "@/lib/portfolio.functions";
import type { MethodologyDataDTO } from "@/lib/methodology.functions";
import { pair } from "@/i18n/dictionary";
import contact from "@/content/contact.json";

/*
 * Home page — one story, top to bottom:
 *   1. Hero      who I am + one clear action
 *   2. Work      proof first: the latest projects
 *   3. Clients   trust: brands that hired me
 *   4. Services  what you can hire me for (scannable list)
 *   5. Process   how we'll work together
 *   6. Reviews   what clients say
 *   7. CTA       start a project
 */

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Paths and the reading-direction arrow for the current language. */
function useNav() {
  const { lang } = useLang();
  const ar = lang === "ar";
  return {
    ar,
    arrow: ar ? "←" : "→",
    href: (path: string) => (ar ? path : `/en${path}`),
  };
}

export function HomeView({
  projects = [],
  methodology,
}: {
  services?: ServiceDTO[];
  projects?: PortfolioDTO[];
  methodology?: MethodologyDataDTO;
}) {
  return (
    <>
      <Hero />
      {projects.length > 0 && <Work projects={projects} />}
      <ClientsMarquee showStats={false} />
      <Services />
      <Process methodology={methodology} />
      <Testimonials />
      <CTA />
    </>
  );
}

/* ---------------------------------------------------------------- Hero */

function Hero() {
  const { t, lang } = useLang();
  const { arrow, href } = useNav();
  const v = (key: DictKey) => (lang === "ar" ? pair(key)[0] : pair(key)[1]);
  const stats: Array<[string, DictKey]> = [
    [v("ui_contactview_1"), "stat_years"],
    [v("ui_contactview_2"), "stat_brands"],
    [v("ui_contactview_3"), "stat_sectors"],
  ];

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 start-1/3 -z-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-16 pt-12 md:pb-24 md:pt-20 lg:grid-cols-12 lg:gap-12">
        {/* Copy */}
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {t("hero_badge")}
          </span>

          <h1 className="mt-6 font-display text-[2.6rem] font-bold leading-[1.15] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {t("hero_title_a")}
            <span className="block text-accent">{t("hero_title_b")}</span>
          </h1>
          <p className="mt-4 font-display text-lg text-muted-foreground md:text-xl">
            {t("hero_subtitle")}
          </p>
          <p className="mt-5 max-w-xl text-base leading-[1.9] text-foreground/80 md:text-lg">
            {t("hero_intro")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to={href("/contact")}
              className={`group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-accent-foreground transition-transform hover:-translate-y-0.5 ${focusRing}`}
            >
              {t("cta_start_project")}
              <span aria-hidden>{arrow}</span>
            </Link>
            <Link
              to={href("/projects")}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-full border border-foreground/15 px-7 py-3.5 text-sm font-semibold transition-colors hover:border-foreground ${focusRing}`}
            >
              {t("hero_cta_projects")}
            </Link>
            <a
              href={portfolioPdf.url}
              download="Youssef-Rehab-Portfolio.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center gap-2 rounded-full px-3 py-3 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline ${focusRing}`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {t("hero_cta_download")}
            </a>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 border-t border-border pt-6">
            {stats.map(([n, label]) => (
              <div key={label} className="border-s border-border px-4 first:border-s-0 first:ps-0">
                <dt className="sr-only">{t(label)}</dt>
                <dd className="font-display text-3xl font-bold md:text-4xl">{n}</dd>
                <dd aria-hidden className="mt-1 text-xs text-muted-foreground">
                  {t(label)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Portrait — shorter crop on phones so the CTAs stay near the top */}
        <div className="relative lg:col-span-5">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-ink ring-1 ring-border md:aspect-[16/10] lg:aspect-[4/5]">
            <img
              src={youssefPortrait.url}
              alt={t("brand_alt")}
              fetchPriority="high"
              className="h-full w-full object-cover object-[center_30%]"
            />
          </div>
          <div className="absolute -bottom-4 start-5 flex items-center gap-3 rounded-full bg-background px-4 py-2.5 shadow-xl ring-1 ring-border">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-display text-xs font-bold text-accent-foreground">
              YR
            </span>
            <div className="leading-tight">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {t("strategic_brand")}
              </div>
              <div className="font-display text-sm font-bold">{t("identity_designer")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Work */

function Work({ projects }: { projects: PortfolioDTO[] }) {
  // The slider already links to all projects (in its header on desktop, below it on phones).
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 pt-4">
      <Reveal>
        <LatestProjectsSlider projects={projects} compact limit={10} />
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------ Services */

// DRAFT prices: only identity ($1,250) and logo ($450) come from the current
// packages page; the rest show "on request" until the owner sets them.
const SERVICE_OFFERS: {
  ar: string;
  en: string;
  getsAr: string[];
  getsEn: string[];
  timeAr: string;
  timeEn: string;
  priceAr: string;
  priceEn: string;
  work: string;
}[] = [
  {
    ar: "الهوية البصرية الكاملة",
    en: "Full visual identity",
    getsAr: ["الشعار بكل نسخه", "الألوان والخطوط", "دليل استخدام الهوية", "تطبيقات على المطبوعات"],
    getsEn: ["Logo in all versions", "Colours and fonts", "Brand guidelines", "Print applications"],
    timeAr: "٣–٤ أسابيع",
    timeEn: "3–4 weeks",
    priceAr: "يبدأ من ١٬٢٥٠ $",
    priceEn: "From $1,250",
    work: "branding",
  },
  {
    ar: "تصميم الشعار",
    en: "Logo design",
    getsAr: ["شعار بنسخ متعددة", "الألوان والخطوط", "كل ملفات التسليم"],
    getsEn: ["Logo in several versions", "Colours and fonts", "All delivery files"],
    timeAr: "٧–١٠ أيام",
    timeEn: "7–10 days",
    priceAr: "يبدأ من ٤٥٠ $",
    priceEn: "From $450",
    work: "branding",
  },
  {
    ar: "الملف التعريفي للشركة",
    en: "Company profile",
    getsAr: ["تنظيم المحتوى", "تصميم كل الصفحات", "ملف PDF للطباعة والإرسال"],
    getsEn: ["Content structure", "All pages designed", "PDF for print and sharing"],
    timeAr: "١–٢ أسبوع",
    timeEn: "1–2 weeks",
    priceAr: "حسب عدد الصفحات",
    priceEn: "Priced by pages",
    work: "profiles",
  },
  {
    ar: "منشورات التواصل الاجتماعي",
    en: "Social media posts",
    getsAr: ["تصاميم بهوية علامتك", "قوالب قابلة للتعديل", "مقاسات كل المنصات"],
    getsEn: ["Designs in your brand style", "Editable templates", "Sizes for every platform"],
    timeAr: "حسب عدد المنشورات",
    timeEn: "Depends on volume",
    priceAr: "حسب عدد المنشورات",
    priceEn: "Priced by volume",
    work: "social",
  },
  {
    ar: "العروض التقديمية",
    en: "Presentations",
    getsAr: ["تصميم الشرائح", "رسوم بيانية واضحة", "ملف قابل للتعديل"],
    getsEn: ["Slide design", "Clear charts", "Editable file"],
    timeAr: "٥–١٠ أيام",
    timeEn: "5–10 days",
    priceAr: "حسب عدد الشرائح",
    priceEn: "Priced by slides",
    work: "presentations",
  },
  {
    ar: "التغليف",
    en: "Packaging",
    getsAr: ["تصميم العبوة", "ملفات جاهزة للمطبعة"],
    getsEn: ["Pack design", "Print-ready files"],
    timeAr: "حسب المنتج",
    timeEn: "Depends on product",
    priceAr: "اطلب عرض سعر",
    priceEn: "Request a quote",
    work: "branding",
  },
];

function Services() {
  const { t, lang } = useLang();
  const { ar, arrow, href } = useNav();
  const L = (a: string, e: string) => (lang === "ar" ? a : e);
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
      <SectionHead
        kicker={t("services_kicker")}
        title={L("ماذا أقدم، وبكم", "What I do, and what it costs")}
        lede={L(
          "اختر الخدمة لترى ما ستستلمه والمدة والسعر المبدئي، أو شاهد أمثلة من أعمالي.",
          "Pick a service to see what you get, how long it takes and the starting price — or see examples.",
        )}
      />
      <div className="-mx-6 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
        {SERVICE_OFFERS.map((o) => (
          <article
            key={o.en}
            className="flex w-[82%] shrink-0 snap-center flex-col rounded-3xl border border-border bg-background p-5 sm:w-auto sm:p-6"
          >
            <h3 className="font-display text-xl font-bold">{L(o.ar, o.en)}</h3>
            <p className="mt-3 text-xs font-semibold text-muted-foreground">
              {L("ستستلم:", "You get:")}
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {(ar ? o.getsAr : o.getsEn).map((g) => (
                <li key={g} className="flex gap-2">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {g}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <div className="flex items-end justify-between gap-3 border-t border-border pt-4">
                <div>
                  <div className="text-xs text-muted-foreground">{L("المدة", "Time")}</div>
                  <div className="text-sm font-semibold">{L(o.timeAr, o.timeEn)}</div>
                </div>
                <div className="text-end">
                  <div className="text-xs text-muted-foreground">{L("السعر", "Price")}</div>
                  <div className="font-display text-lg font-bold">{L(o.priceAr, o.priceEn)}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  to={href(`/projects?cat=${o.work}#browse`)}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-full border border-foreground/15 px-3 py-2.5 text-sm font-semibold hover:border-foreground ${focusRing}`}
                >
                  {L("شاهد أمثلة", "See examples")}
                </Link>
                <Link
                  to={href("/contact")}
                  className={`inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full bg-accent px-3 py-2.5 text-sm font-bold text-accent-foreground ${focusRing}`}
                >
                  {L("اطلب عرض سعر", "Get a quote")} <span aria-hidden>{arrow}</span>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Process */

function Process({ methodology }: { methodology?: MethodologyDataDTO }) {
  const { t, lang } = useLang();
  const copy = methodology?.copy;
  if (copy && copy.is_visible === false) return null;

  const pick = (ar?: string | null, en?: string | null, fb = "") => {
    const v = lang === "ar" ? ar : en;
    return v && v.trim() ? v : fb;
  };

  const cmsSteps = methodology?.steps ?? [];
  const steps = cmsSteps.length
    ? cmsSteps.map((s) => ({
        key: s.id,
        title: pick(s.title_ar, s.title_en),
        desc: pick(s.description_ar, s.description_en),
      }))
    : ([1, 2, 3, 4] as const).map((n) => ({
        key: String(n),
        title: t(`process_${n}_t` as DictKey),
        desc: t(`process_${n}_d` as DictKey),
      }));

  return (
    <section className="border-y border-border bg-cream">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <SectionHead
          kicker={pick(copy?.kicker_ar, copy?.kicker_en, t("process_kicker"))}
          title={pick(copy?.title_ar, copy?.title_en, t("process_title"))}
          lede={pick(copy?.lede_ar, copy?.lede_en, t("process_lede"))}
        />
        <ol className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.key} className="border-t-2 border-foreground pt-5">
              <span className="font-display text-sm font-bold text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-display text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- CTA */

function CTA() {
  const { t } = useLang();
  const { href } = useNav();
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-20 md:flex-row md:items-end md:py-24">
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight md:text-6xl">
            {t("cta_title_a")} <span className="text-accent">{t("cta_title_b")}</span>
          </h2>
          <p className="mt-4 max-w-xl text-white/70">{t("cta_sub")}</p>
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t("cta_reply_time")}
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <Link
            to={href("/contact")}
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-bold text-accent-foreground transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            {t("cta_button")}
          </Link>
          <a
            href={`mailto:${contact.cta_email}`}
            className="text-sm text-white/60 underline-offset-4 hover:text-white hover:underline"
          >
            {contact.cta_email}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Shared */

function SectionHead({ kicker, title, lede }: { kicker: string; title: string; lede?: string }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-10">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
          {kicker}
        </span>
        <h2 className="mt-2 font-display text-4xl font-bold md:text-5xl">{title}</h2>
      </div>
      {lede && <p className="max-w-md text-muted-foreground">{lede}</p>}
    </div>
  );
}
