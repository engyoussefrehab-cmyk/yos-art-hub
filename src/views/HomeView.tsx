import { Link } from "@tanstack/react-router";
import youssefPortrait from "@/assets/youssef-portrait.jpg.asset.json";
import portfolioPdf from "@/assets/portfolio.pdf.asset.json";
import { Testimonials } from "@/components/Testimonials";
import { ClientsMarquee } from "@/components/ClientsMarquee";
import { useLang } from "@/i18n/use-lang";
import type { DictKey } from "@/i18n/dictionary";
import { pair } from "@/i18n/dictionary";
import type { ServiceDTO } from "@/lib/services.functions";
import type { PortfolioDTO } from "@/lib/portfolio.functions";
import type { MethodologyDataDTO } from "@/lib/methodology.functions";
import { SECTORS, sectorOf } from "@/lib/sectors";
import contact from "@/content/contact.json";

/*
 * Home page (dark, Arabic only) — same story as before, new design:
 *   1. Hero      who I am, one clear action, numbers
 *   2. Work      latest projects + "what does your company do?"
 *   3. Clients   brands that hired me
 *   4. Services  what you get, how long, starting price
 *   5. Process   four steps
 *   6. Reviews   what clients say
 *   7. CTA       start a project
 */

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const ARROW = "←";
const CAT_AR: Record<string, string> = {
  branding: "هوية بصرية",
  profiles: "ملف تعريفي",
  social: "تواصل اجتماعي",
  presentations: "عرض تقديمي",
  packaging: "تغليف",
  logos: "شعار",
};

export function HomeView({
  projects = [],
  methodology,
}: {
  services?: ServiceDTO[];
  projects?: PortfolioDTO[];
  methodology?: MethodologyDataDTO;
}) {
  return (
    <div className="overflow-x-clip">
      <Hero />
      <Marquee />
      {projects.length > 0 && <Work projects={projects} />}
      <ClientsMarquee showStats={false} />
      <Services />
      <Process methodology={methodology} />
      <Testimonials />
      <CTA />
    </div>
  );
}

/* ---------------------------------------------------------------- Shared */

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold text-accent">
      <span aria-hidden className="h-px w-6 bg-accent" />
      {children}
    </span>
  );
}

function SectionHead({
  kicker,
  title,
  lede,
  action,
}: {
  kicker: string;
  title: string;
  lede?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
      <div className="max-w-2xl">
        <Kicker>{kicker}</Kicker>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
          {title}
        </h2>
        {lede && <p className="mt-3 text-muted-foreground md:text-lg">{lede}</p>}
      </div>
      {action}
    </div>
  );
}

function PillLink({
  to,
  children,
  primary,
  className = "",
}: {
  to: string;
  children: React.ReactNode;
  primary?: boolean;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={`group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-3 text-sm font-bold transition ${
        primary
          ? "bg-accent text-accent-foreground hover:brightness-110"
          : "border border-white/15 text-foreground hover:border-white/50"
      } ${focusRing} ${className}`}
    >
      {children}
      <span aria-hidden className="transition-transform group-hover:-translate-x-1">
        {ARROW}
      </span>
    </Link>
  );
}

/* ---------------------------------------------------------------- 1. Hero */

function Hero() {
  const { t } = useLang();
  const v = (key: DictKey) => pair(key)[0];
  const stats: Array<[string, DictKey]> = [
    [v("ui_contactview_1"), "stat_years"],
    [v("ui_contactview_2"), "stat_brands"],
    [v("ui_contactview_3"), "stat_sectors"],
  ];

  return (
    <section className="relative">
      {/* Soft red glow + fine grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 start-[-10%] h-[520px] w-[520px] rounded-full bg-accent/20 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at 70% 30%, black 20%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at 70% 30%, black 20%, transparent 70%)",
          }}
        />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-14 pt-10 md:pt-16 lg:grid-cols-12 lg:gap-14 lg:pb-20">
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {t("hero_badge")}
          </span>

          <h1 className="mt-6 font-display text-[2.75rem] font-bold leading-[1.1] sm:text-6xl lg:text-[5.5rem]">
            {t("hero_title_a")}
            <span className="mt-1 block text-accent">{t("hero_title_b")}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-[1.9] text-muted-foreground md:text-lg">
            {t("hero_intro")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <PillLink to="/contact" primary>
              {t("cta_start_project")}
            </PillLink>
            <PillLink to="/projects">{t("hero_cta_projects")}</PillLink>
            <a
              href={portfolioPdf.url}
              download="Youssef-Rehab-Portfolio.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-full px-2 py-3 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline ${focusRing}`}
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

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            {stats.map(([n, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <dt className="sr-only">{t(label)}</dt>
                <dd className="font-display text-2xl font-bold md:text-3xl">{n}</dd>
                <dd aria-hidden className="mt-0.5 text-xs text-muted-foreground">
                  {t(label)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative lg:col-span-5">
          <div
            aria-hidden
            className="absolute -inset-3 -z-10 rounded-[2rem] border border-accent/30"
          />
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white/10 bg-black md:aspect-[16/10] lg:aspect-[4/5]">
            <img
              src={youssefPortrait.url}
              alt={t("brand_alt")}
              fetchPriority="high"
              className="h-full w-full object-cover object-[center_30%]"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent"
            />
            <div className="absolute bottom-4 start-4 end-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-display text-lg font-bold">يوسف رحاب</div>
                <div className="text-xs text-white/70">
                  {t("strategic_brand")} {t("identity_designer")}
                </div>
              </div>
              <span className="rounded-full bg-accent px-3 py-1 font-display text-xs font-bold text-accent-foreground">
                YR
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Marquee */

const MARQUEE_WORDS = [
  "هوية بصرية",
  "تصميم شعارات",
  "ملفات تعريفية",
  "منشورات التواصل الاجتماعي",
  "عروض تقديمية",
  "تغليف",
];

function Marquee() {
  const row = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
  return (
    <div className="overflow-hidden border-y border-white/10 bg-black py-5" aria-hidden dir="ltr">
      <div className="yr-marquee flex w-max gap-10" dir="ltr">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center gap-10">
            {row.map((w, i) => (
              <span
                key={`${copy}-${i}`}
                className="flex items-center gap-10 font-display text-2xl font-bold text-white/85 md:text-4xl"
                dir="rtl"
              >
                {w}
                <span className="text-accent">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <style>{`
        .yr-marquee { animation: yr-marquee 40s linear infinite; }
        @keyframes yr-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .yr-marquee { animation: none; } }
      `}</style>
    </div>
  );
}

/* ---------------------------------------------------------------- 2. Work */

function Work({ projects }: { projects: PortfolioDTO[] }) {
  const latest = [...projects]
    .filter((p) => p.cover)
    .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""))
    .slice(0, 5);

  // Sectors with the most work, for the quick "what does your company do?" row.
  const counts = new Map<string, number>();
  for (const p of projects)
    counts.set(sectorOf(p.industry), (counts.get(sectorOf(p.industry)) ?? 0) + 1);
  const topSectors = SECTORS.filter((s) => counts.get(s.key))
    .sort((a, b) => (counts.get(b.key) ?? 0) - (counts.get(a.key) ?? 0))
    .slice(0, 8);

  const href = (p: PortfolioDTO) => `/projects/${p.category_slug ?? "branding"}/${p.slug}`;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
      <SectionHead
        kicker="أحدث الأعمال"
        title="شغل حقيقي لعلامات حقيقية"
        action={<PillLink to="/projects">كل الأعمال</PillLink>}
      />

      {/* Phones: swipe. Larger screens: bento grid. */}
      <div className="-mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:grid-rows-2 md:gap-5 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
        {latest.map((p, i) => (
          <Link
            key={p.slug}
            to={href(p)}
            className={`group relative block w-[78%] shrink-0 snap-center overflow-hidden rounded-[1.75rem] border border-white/10 bg-black md:w-auto ${
              i === 0
                ? "aspect-[4/5] md:col-span-2 md:row-span-2 md:aspect-auto"
                : "aspect-[4/5] md:aspect-[4/3]"
            } ${focusRing}`}
          >
            <img
              src={p.cover}
              alt={p.name_ar}
              loading={i === 0 ? "eager" : "lazy"}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
              <div>
                <div className="text-xs text-white/70">
                  {CAT_AR[p.category_slug ?? ""] ?? "مشروع"}
                </div>
                <h3
                  className={`mt-1 font-display font-bold text-white ${i === 0 ? "text-2xl md:text-3xl" : "text-lg"}`}
                >
                  {p.name_ar}
                </h3>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition-colors group-hover:bg-accent">
                {ARROW}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Find work for your own field */}
      <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 md:flex md:items-center md:gap-6 md:p-6">
        <p className="shrink-0 font-display text-lg font-bold">ما مجال شركتك؟</p>
        <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:mt-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {topSectors.map((s) => (
            <a
              key={s.key}
              href={`/projects?sector=${s.key}#browse`}
              className={`shrink-0 whitespace-nowrap rounded-full border border-white/15 px-4 py-2 text-sm transition-colors hover:border-accent hover:text-accent ${focusRing}`}
            >
              {s.ar} <span className="text-muted-foreground">{counts.get(s.key)}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ 4. Services */

// Starting prices set by the owner (Nov 2026). Presentations and packaging are quoted per project.
const SERVICE_OFFERS: {
  title: string;
  gets: string[];
  time: string;
  price: string;
  work: string;
}[] = [
  {
    title: "الهوية البصرية الكاملة",
    gets: ["الشعار بكل نسخه", "الألوان والخطوط", "دليل استخدام الهوية", "تطبيقات على المطبوعات"],
    time: "٣–٤ أسابيع",
    price: "يبدأ من ١٥٠ $",
    work: "branding",
  },
  {
    title: "تصميم الشعار",
    gets: ["شعار بنسخ متعددة", "الألوان والخطوط", "كل ملفات التسليم"],
    time: "٧–١٠ أيام",
    price: "يبدأ من ٧٥ $",
    work: "branding",
  },
  {
    title: "الملف التعريفي للشركة",
    gets: ["تنظيم المحتوى", "تصميم كل الصفحات", "ملف PDF للطباعة والإرسال"],
    time: "١–٢ أسبوع",
    price: "يبدأ من ١٠٠ $",
    work: "profiles",
  },
  {
    title: "منشورات التواصل الاجتماعي",
    gets: ["٥ منشورات على الأقل", "قوالب قابلة للتعديل", "مقاسات كل المنصات"],
    time: "حسب عدد المنشورات",
    price: "يبدأ من ٣٥ $",
    work: "social",
  },
  {
    title: "العروض التقديمية",
    gets: ["تصميم الشرائح", "رسوم بيانية واضحة", "ملف قابل للتعديل"],
    time: "٥–١٠ أيام",
    price: "حسب عدد الشرائح",
    work: "presentations",
  },
  {
    title: "التغليف",
    gets: ["تصميم العبوة", "ملفات جاهزة للمطبعة"],
    time: "حسب المنتج",
    price: "اطلب عرض سعر",
    work: "branding",
  },
];

function Services() {
  return (
    <section id="services" className="scroll-mt-24 border-y border-white/10 bg-black">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <SectionHead
          kicker="الخدمات والأسعار"
          title="ماذا أقدم، وبكم"
          lede="اختر الخدمة لترى ما ستستلمه والمدة والسعر المبدئي."
        />
        <div className="-mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
          {SERVICE_OFFERS.map((o, i) => (
            <article
              key={o.title}
              className="group flex w-[82%] shrink-0 snap-center flex-col rounded-[1.75rem] border border-white/10 bg-[#111] p-6 transition-colors hover:border-accent/50 sm:w-auto"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl font-bold md:text-2xl">{o.title}</h3>
                <span className="font-display text-sm text-white/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <ul className="mt-5 flex flex-wrap gap-2">
                {o.gets.map((g) => (
                  <li
                    key={g}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80"
                  >
                    {g}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">السعر</div>
                    <div className="font-display text-2xl font-bold text-accent">{o.price}</div>
                  </div>
                  <div className="text-end">
                    <div className="text-xs text-muted-foreground">المدة</div>
                    <div className="text-sm font-semibold">{o.time}</div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <a
                    href={`/projects?cat=${o.work}#browse`}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-full border border-white/15 px-3 py-2.5 text-sm font-semibold hover:border-white/50 ${focusRing}`}
                  >
                    شاهد أمثلة
                  </a>
                  <Link
                    to="/contact"
                    className={`inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full bg-white px-3 py-2.5 text-sm font-bold text-black transition-colors hover:bg-accent ${focusRing}`}
                  >
                    اطلب عرض سعر
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- 5. Process */

function Process({ methodology }: { methodology?: MethodologyDataDTO }) {
  const { t } = useLang();
  const copy = methodology?.copy;
  if (copy && copy.is_visible === false) return null;
  const pick = (v?: string | null, fb = "") => (v && v.trim() ? v : fb);

  const cmsSteps = methodology?.steps ?? [];
  const steps = cmsSteps.length
    ? cmsSteps.map((s) => ({ key: s.id, title: pick(s.title_ar), desc: pick(s.description_ar) }))
    : ([1, 2, 3, 4] as const).map((n) => ({
        key: String(n),
        title: t(`process_${n}_t` as DictKey),
        desc: t(`process_${n}_d` as DictKey),
      }));

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
      <SectionHead
        kicker={pick(copy?.kicker_ar, t("process_kicker"))}
        title={pick(copy?.title_ar, t("process_title"))}
        lede={pick(copy?.lede_ar, t("process_lede"))}
      />
      <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li
            key={step.key}
            className="relative rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6"
          >
            <span className="font-display text-5xl font-bold text-transparent [-webkit-text-stroke:1px_rgba(255,72,72,0.8)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 font-display text-xl font-bold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ----------------------------------------------------------------- 7. CTA */

function CTA() {
  const { t } = useLang();
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 md:pb-28">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black px-6 py-14 md:px-14 md:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -start-20 h-[420px] w-[420px] rounded-full bg-accent/25 blur-[120px]"
        />
        <div className="relative flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl font-bold leading-tight md:text-6xl">
              {t("cta_title_a")}
              <span className="block text-accent">{t("cta_title_b")}</span>
            </h2>
            <p className="mt-5 text-muted-foreground md:text-lg">{t("cta_sub")}</p>
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {t("cta_reply_time")}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <PillLink to="/contact" primary className="px-8 py-4 text-base">
              {t("cta_start_project")}
            </PillLink>
            <a
              href={contact.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
            >
              أو راسلني على واتساب
            </a>
            <a
              href={`mailto:${contact.cta_email}`}
              className="text-sm text-white/50 underline-offset-4 hover:text-white hover:underline"
            >
              {contact.cta_email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
