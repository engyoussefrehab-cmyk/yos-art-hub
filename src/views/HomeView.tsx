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
 * Home page — bold "studio" style: big type, oversized rounded cards that
 * stack while scrolling, giant marquee words, pill buttons with a round
 * arrow, sector rows with arrows. Real work replaces decorative imagery.
 */

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
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
      <BigMarquee
        words={["هوية بصرية", "شعارات", "ملفات تعريفية", "تغليف", "عروض تقديمية", "منشورات"]}
      />
      <About />
      <Services />
      <Process methodology={methodology} />
      <Sectors projects={projects} />
      <ClientsMarquee showStats={false} />
      {projects.length > 0 && <Work projects={projects} />}
      <Testimonials />
      <CTA />
    </div>
  );
}

/* ================================================================ Shared */

/** Round arrow icon used inside buttons and on cards. */
function ArrowDot({
  tone = "dark",
  size = "sm",
}: {
  tone?: "dark" | "light" | "red";
  size?: "sm" | "lg";
}) {
  const tones = {
    dark: "bg-black text-white",
    light: "bg-white text-black",
    red: "bg-accent text-accent-foreground",
  };
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full transition-transform group-hover:-rotate-45 ${tones[tone]} ${
        size === "lg" ? "h-14 w-14 text-xl" : "h-8 w-8 text-sm"
      }`}
    >
      ↖
    </span>
  );
}

function Pill({
  to,
  href,
  children,
  variant = "light",
  download,
}: {
  to?: string;
  href?: string;
  children: React.ReactNode;
  variant?: "light" | "red" | "ghost";
  download?: string;
}) {
  const styles = {
    light: "bg-white text-black",
    red: "bg-accent text-accent-foreground",
    ghost: "border border-white/20 text-white hover:border-white/60",
  };
  const cls = `group inline-flex items-center gap-3 whitespace-nowrap rounded-full py-1.5 pe-1.5 ps-5 text-sm font-bold transition ${styles[variant]} ${focusRing}`;
  const dot = (
    <ArrowDot tone={variant === "light" ? "red" : variant === "red" ? "dark" : "light"} />
  );
  if (href)
    return (
      <a href={href} className={cls} download={download} target="_blank" rel="noopener noreferrer">
        {children}
        {dot}
      </a>
    );
  return (
    <Link to={to!} className={cls}>
      {children}
      {dot}
    </Link>
  );
}

function Heading({
  kicker,
  title,
  action,
}: {
  kicker: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-accent">✦</span>
          {kicker}
        </span>
        <h2 className="mt-3 font-display text-3xl font-bold leading-[1.2] md:text-[2.75rem]">
          {title}
        </h2>
      </div>
      {action && <div className="shrink-0 self-start md:self-auto">{action}</div>}
    </div>
  );
}

/* ================================================================ Hero */

function Hero() {
  const { t } = useLang();
  return (
    <section className="px-3 pt-3 sm:px-6">
      <div className="relative isolate mx-auto flex min-h-[78svh] max-w-[1400px] flex-col justify-end overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b0b] px-6 pb-10 pt-28 md:px-16 md:pb-16">
        {/* Animated colour field */}
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="yr-blob absolute -top-24 end-[-10%] h-[70%] w-[70%] rounded-full bg-accent/60 blur-[110px]" />
          <div className="yr-blob absolute bottom-[-30%] start-[-10%] h-[70%] w-[60%] rounded-full bg-[#ff9a62]/35 blur-[120px] [animation-delay:-6s]" />
          <div className="yr-blob absolute top-[25%] start-[30%] h-[45%] w-[40%] rounded-full bg-[#7b2cff]/30 blur-[120px] [animation-delay:-12s]" />
          <div
            className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
            style={{
              backgroundImage:
                "repeating-linear-gradient(115deg, white 0 1px, transparent 1px 22px)",
            }}
          />
        </div>

        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs text-white backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {t("hero_badge")}
            </span>
            <h1 className="mt-6 font-display text-[2.5rem] font-bold leading-[1.1] text-white sm:text-6xl lg:text-[4.75rem]">
              هويات
              <br />
              تبنى لتبقى.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-[1.9] text-white/75 md:text-lg">
              أنا يوسف رحاب، مصمم هويات بصرية. أصمم لعلامتك شعارا وألوانا وخطوطا تجعلها واضحة ومميزة
              في السوق.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Pill to="/contact" variant="light">
                {t("cta_start_project")}
              </Pill>
              <Pill href={portfolioPdf.url} download="Youssef-Rehab-Portfolio.pdf" variant="ghost">
                حمّل ملف أعمالي
              </Pill>
            </div>
          </div>
          <ul className="space-y-3 text-sm text-white/85 lg:col-span-4 lg:justify-self-end">
            {["هويات بصرية وشعارات", "ملفات تعريفية وعروض", "منشورات وتغليف"].map((s) => (
              <li key={s} className="flex items-center gap-3">
                <span className="text-accent">✦</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <style>{`
        .yr-blob { animation: yr-blob 18s ease-in-out infinite alternate; }
        @keyframes yr-blob {
          0% { transform: translate(0,0) scale(1); }
          50% { transform: translate(6%,8%) scale(1.15); }
          100% { transform: translate(-6%,-4%) scale(0.95); }
        }
        @media (prefers-reduced-motion: reduce) { .yr-blob { animation: none; } }
      `}</style>
    </section>
  );
}

/* ================================================================ Big marquee */

function BigMarquee({ words }: { words: string[] }) {
  const row = [...words, ...words];
  return (
    <div className="overflow-hidden py-14 md:py-24" aria-hidden dir="ltr">
      <div className="yr-marquee flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {row.map((w, i) => (
              <span key={`${copy}-${i}`} className="flex items-center" dir="rtl">
                <span className="px-5 font-display text-4xl font-bold text-white/90 md:px-8 md:text-[4.5rem] md:leading-none">
                  {w}
                </span>
                <span className="text-2xl text-white/25 md:text-4xl">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <style>{`
        .yr-marquee { animation: yr-marquee 60s linear infinite; }
        @keyframes yr-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .yr-marquee { animation: none; } }
      `}</style>
    </div>
  );
}

/* ================================================================ About */

function About() {
  const { t } = useLang();
  const v = (key: DictKey) => pair(key)[0];
  const stats: Array<[string, DictKey]> = [
    [v("ui_contactview_1"), "stat_years"],
    [v("ui_contactview_2"), "stat_brands"],
    [v("ui_contactview_3"), "stat_sectors"],
  ];
  return (
    <section className="mx-auto max-w-[1400px] px-6 pb-28 md:px-10 md:pb-40">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-accent">✦</span>
            من أنا
          </span>
          <p className="mt-5 max-w-2xl font-display text-2xl font-bold leading-[1.6] md:text-[2.125rem] md:leading-[1.55]">
            الهوية ليست شعارا فقط.{" "}
            <span className="text-white/40">
              هي الطريقة التي يتذكر بها الناس علامتك. أصممها بوضوح، ليختارك عميلك من أول نظرة.
            </span>
          </p>
          <dl className="mt-10 grid grid-cols-3 gap-3">
            {stats.map(([n, label]) => (
              <div key={label} className="rounded-3xl bg-white/[0.04] p-5">
                <dt className="sr-only">{t(label)}</dt>
                <dd className="font-display text-2xl font-bold md:text-4xl">{n}</dd>
                <dd aria-hidden className="mt-1 text-xs text-muted-foreground md:text-sm">
                  {t(label)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-[2rem] bg-accent">
            <img
              src={youssefPortrait.url}
              alt={t("brand_alt")}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover object-[center_30%] mix-blend-luminosity lg:aspect-[4/5]"
            />
            <div className="absolute bottom-4 start-4 rounded-full bg-black px-4 py-2 text-sm font-bold text-white">
              يوسف رحاب · مصمم هويات
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================ Services (stacking cards) */

// Starting prices set by the owner (Nov 2026). Presentations and packaging are quoted per project.
const SERVICE_OFFERS: {
  title: string;
  line: string;
  tags: string[];
  price: string;
  cat: string;
  tone: "black" | "red" | "white" | "gray";
}[] = [
  {
    title: "الهوية البصرية",
    line: "هوية متكاملة: من الشعار إلى المطبوعات ودليل الاستخدام.",
    tags: ["شعار", "ألوان", "خطوط", "دليل الهوية", "مطبوعات"],
    price: "يبدأ من ١٥٠ $",
    cat: "branding",
    tone: "black",
  },
  {
    title: "تصميم الشعار",
    line: "شعار واضح بنسخ متعددة، وكل ملفات التسليم.",
    tags: ["شعار", "نسخ متعددة", "ملفات التسليم"],
    price: "يبدأ من ٧٥ $",
    cat: "branding",
    tone: "red",
  },
  {
    title: "الملف التعريفي",
    line: "ملف يعرض شركتك وخدماتها بشكل مقنع، جاهز للطباعة والإرسال.",
    tags: ["تنظيم المحتوى", "تصميم الصفحات", "PDF"],
    price: "يبدأ من ١٠٠ $",
    cat: "profiles",
    tone: "white",
  },
  {
    title: "منشورات التواصل الاجتماعي",
    line: "تصاميم بهوية علامتك لكل المنصات، ٥ منشورات على الأقل.",
    tags: ["منشورات", "قوالب", "حملات"],
    price: "يبدأ من ٣٥ $",
    cat: "social",
    tone: "gray",
  },
  {
    title: "العروض والتغليف",
    line: "عروض تقديمية واضحة، وتصميم عبوات جاهزة للمطبعة.",
    tags: ["عروض تقديمية", "تغليف", "مطبوعات"],
    price: "حسب المشروع",
    cat: "presentations",
    tone: "black",
  },
];

const TONES = {
  black: {
    card: "bg-[#0b0b0b] text-white border border-white/10",
    tag: "border-white/25",
    dot: "red" as const,
    muted: "text-white/70",
  },
  red: {
    card: "bg-accent text-black",
    tag: "border-black/30",
    dot: "dark" as const,
    muted: "text-black/75",
  },
  white: {
    card: "bg-[#f3f1ec] text-black",
    tag: "border-black/20",
    dot: "dark" as const,
    muted: "text-black/70",
  },
  gray: {
    card: "bg-[#1d1d1d] text-white border border-white/10",
    tag: "border-white/25",
    dot: "light" as const,
    muted: "text-white/70",
  },
};

function Services() {
  return (
    <section id="services" className="mx-auto max-w-[1400px] scroll-mt-24 px-3 sm:px-6">
      <div className="px-3 sm:px-0 md:px-4">
        <Heading kicker="الخدمات والأسعار" title="ماذا أقدم، وبكم" />
      </div>
      <div className="mt-10">
        {SERVICE_OFFERS.map((s, i) => {
          const tone = TONES[s.tone];
          return (
            <article
              key={s.title}
              className={`sticky mb-4 overflow-hidden rounded-[2rem] ${tone.card}`}
              style={{ top: `calc(5.5rem + ${i * 12}px)` }}
            >
              <div className="relative flex min-h-[240px] flex-col p-7 md:min-h-[270px] md:p-12">
                {/* Big outlined number as decoration */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute bottom-[-0.15em] end-6 hidden font-display md:block text-[7rem] font-bold leading-none text-transparent md:end-10 md:text-[8rem] ${
                    s.tone === "red" || s.tone === "white"
                      ? "[-webkit-text-stroke:1.5px_rgba(0,0,0,0.25)]"
                      : "[-webkit-text-stroke:1.5px_rgba(255,255,255,0.18)]"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-2xl font-bold md:text-[2.5rem]">{s.title}</h3>
                  <a
                    href={`/projects?cat=${s.cat}#browse`}
                    className={`group ${focusRing} rounded-full`}
                    aria-label={`شاهد أمثلة: ${s.title}`}
                  >
                    <ArrowDot tone={tone.dot} size="lg" />
                  </a>
                </div>

                <div className="relative mt-auto pt-8 md:max-w-[70%]">
                  <ul className="flex flex-wrap gap-2">
                    {s.tags.map((tg) => (
                      <li key={tg} className={`rounded-full border px-3 py-1 text-xs ${tone.tag}`}>
                        {tg}
                      </li>
                    ))}
                  </ul>
                  <p className={`mt-3 text-sm font-semibold md:text-base ${tone.muted}`}>
                    {s.line}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <span className="font-display text-xl font-bold md:text-2xl">{s.price}</span>
                    <Link
                      to="/contact"
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${tone.tag} ${focusRing}`}
                    >
                      اطلب عرض سعر
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* ================================================================ Process (rows) */

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
    <section className="mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40">
      <Heading
        kicker={pick(copy?.kicker_ar, t("process_kicker"))}
        title={pick(copy?.title_ar, t("process_title"))}
        action={
          <Pill to="/contact" variant="ghost">
            هيا نتحدث
          </Pill>
        }
      />
      <ol className="mt-12 border-t border-white/10">
        {steps.map((s, i) => (
          <li
            key={s.key}
            className="grid grid-cols-[3.5rem_1fr] items-start gap-4 border-b border-white/10 py-8 md:grid-cols-[6rem_1fr_1.4fr] md:items-center md:gap-12 md:py-11"
          >
            <span className="font-display text-4xl font-bold text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.45)] md:text-5xl">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display text-xl font-bold md:text-[1.75rem]">{s.title}</h3>
            <p className="col-start-2 text-sm leading-relaxed text-muted-foreground md:col-start-auto md:text-base">
              {s.desc}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ================================================================ Sectors (rows with arrows) */

function Sectors({ projects }: { projects: PortfolioDTO[] }) {
  const bySector = new Map<string, PortfolioDTO[]>();
  for (const p of projects) {
    const k = sectorOf(p.industry);
    bySector.set(k, [...(bySector.get(k) ?? []), p]);
  }
  const rows = SECTORS.filter((s) => bySector.get(s.key)?.length)
    .sort((a, b) => bySector.get(b.key)!.length - bySector.get(a.key)!.length)
    .slice(0, 7);

  return (
    <section className="mx-auto max-w-[1400px] px-6 pb-28 md:px-10 md:pb-40">
      <Heading
        kicker="ما مجال شركتك؟"
        title="مجالات اشتغلت فيها"
        action={
          <Pill to="/projects" variant="ghost">
            كل الأعمال
          </Pill>
        }
      />
      <ul className="mt-12 border-t border-white/10">
        {rows.map((s) => {
          const list = bySector.get(s.key)!;
          return (
            <li key={s.key} className="border-b border-white/10">
              <a
                href={`/projects?sector=${s.key}#browse`}
                className={`group grid grid-cols-[1fr_auto] items-center gap-4 py-7 md:grid-cols-[1.3fr_1fr_auto] md:py-10 ${focusRing}`}
              >
                <span className="flex items-center gap-4 font-display text-2xl font-bold transition-colors group-hover:text-accent md:text-[2rem]">
                  <span className="text-xl transition-transform group-hover:-translate-x-2 md:text-2xl">
                    ←
                  </span>
                  {s.ar}
                </span>
                <span className="hidden text-sm text-muted-foreground md:block">
                  {list
                    .slice(0, 3)
                    .map((p) => p.name_ar)
                    .join(" · ")}
                </span>
                <span className="rounded-full bg-white/[0.06] px-3 py-1 text-sm">
                  {list.length} مشروع
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ================================================================ Work */

function Work({ projects }: { projects: PortfolioDTO[] }) {
  const latest = [...projects]
    .filter((p) => p.cover)
    .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""))
    .slice(0, 6);
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40">
      <Heading
        kicker="أحدث الأعمال"
        title="مشاريع قريبة"
        action={
          <Pill to="/projects" variant="light">
            كل المشاريع
          </Pill>
        }
      />
      <div className="-mx-6 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
        {latest.map((p) => (
          <Link
            key={p.slug}
            to={`/projects/${p.category_slug ?? "branding"}/${p.slug}`}
            className={`group block w-[78%] shrink-0 snap-center md:w-auto ${focusRing}`}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-white/5">
              <img
                src={p.cover}
                alt={p.name_ar}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-3 start-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                  {CAT_AR[p.category_slug ?? ""] ?? "مشروع"}
                </span>
                {p.year && (
                  <span className="rounded-full bg-black/70 px-3 py-1 text-xs text-white backdrop-blur">
                    {p.year}
                  </span>
                )}
              </div>
            </div>
            <h3 className="mt-4 font-display text-lg font-bold transition-colors group-hover:text-accent">
              {p.name_ar}
            </h3>
            {p.short_ar && (
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{p.short_ar}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ================================================================ CTA */

function CTA() {
  return (
    <section className="px-3 pb-6 sm:px-6">
      <div className="relative isolate mx-auto max-w-[1400px] overflow-hidden rounded-[2rem] bg-[#0b0b0b] px-6 py-20 md:px-16 md:py-32">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="yr-blob absolute -bottom-1/3 end-[-10%] h-[90%] w-[60%] rounded-full bg-accent/50 blur-[120px]" />
          <div className="yr-blob absolute -top-1/3 start-[-10%] h-[70%] w-[50%] rounded-full bg-[#7b2cff]/25 blur-[120px] [animation-delay:-8s]" />
        </div>
        <h2 className="font-display text-4xl font-bold leading-[1.15] text-white md:text-[4.25rem]">
          حدّثني
          <br />
          عن مشروعك.
        </h2>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Pill to="/contact" variant="red">
            ابدأ مشروعك
          </Pill>
          <Pill href={contact.whatsapp_url} variant="ghost">
            واتساب
          </Pill>
          <a
            href={`mailto:${contact.cta_email}`}
            className="ps-2 text-sm text-white/60 hover:text-white"
          >
            {contact.cta_email}
          </a>
        </div>
      </div>
    </section>
  );
}
