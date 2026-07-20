import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useLang } from "@/i18n/use-lang";
import {
  getServiceTiersPageData,
  type ServiceTierDTO,
  type ServiceTierFeatureDTO,
  type ServiceTierPageDTO,
  type ServiceTiersPageDataDTO,
} from "@/lib/service-tiers.functions";

/* ------------------------------- Fallbacks ------------------------------- */

const DEFAULT_TIERS: ServiceTierDTO[] = [
  {
    id: "launch", slug: "launch",
    name_ar: "انطلاق العلامة", name_en: "Brand Launch",
    description_ar: "للشركات الناشئة والمشاريع الجديدة التي تحتاج أساسًا بصريًا نظيفًا للانطلاق.",
    description_en: "For startups and new businesses that need a clean visual foundation to launch with.",
    deliverables: [
      { ar: "تصميم الشعار", en: "Logo Design" },
      { ar: "لوحة الألوان", en: "Color Palette" },
      { ar: "نظام الطباعة", en: "Typography" },
      { ar: "أصول الهوية الأساسية", en: "Basic Brand Assets" },
      { ar: "حزمة السوشيال ميديا", en: "Social Media Kit" },
    ],
    price_ar: "يبدأ من ٤٥٠ $", price_en: "Starting from $450",
    cta_label_ar: "اطلب عرضًا", cta_label_en: "Request Proposal",
    cta_href: "/contact", featured: false, badge_ar: null, badge_en: null, sort_order: 10,
  },
  {
    id: "signature", slug: "signature",
    name_ar: "توقيع العلامة", name_en: "Brand Signature",
    description_ar: "للأعمال النامية التي تسعى إلى هويّةٍ بصريّةٍ متكاملة تصنع حضورًا مميّزًا.",
    description_en: "For growing businesses seeking a complete visual identity with a distinctive presence.",
    deliverables: [
      { ar: "اكتشاف العلامة", en: "Brand Discovery" },
      { ar: "استراتيجيّة العلامة", en: "Brand Strategy" },
      { ar: "نظام الشعار", en: "Logo System" },
      { ar: "الهوية البصريّة", en: "Visual Identity" },
      { ar: "قوالب السوشيال ميديا", en: "Social Media Templates" },
      { ar: "دليل الهوية", en: "Brand Guidelines" },
    ],
    price_ar: "يبدأ من ١٢٥٠ $", price_en: "Starting from $1,250",
    cta_label_ar: "احجز جلسة اكتشاف", cta_label_en: "Book a Discovery Call",
    cta_href: "/contact", featured: true,
    badge_ar: "الأكثر اختيارًا", badge_en: "Most Popular", sort_order: 20,
  },
  {
    id: "system", slug: "system",
    name_ar: "نظام العلامة", name_en: "Brand System",
    description_ar: "للمؤسّسات والشركات المتوسّعة التي تحتاج نظامًا بصريًّا استراتيجيًّا شاملًا.",
    description_en: "For established businesses and organizations that need a comprehensive strategic brand system.",
    deliverables: [
      { ar: "استراتيجيّة علامة شاملة", en: "Comprehensive Brand Strategy" },
      { ar: "نظام علامة متكامل", en: "Complete Brand System" },
      { ar: "هندسة العلامة", en: "Brand Architecture" },
      { ar: "الأصول التسويقيّة", en: "Marketing Assets" },
      { ar: "دعم تصميميّ طويل الأمد", en: "Long-Term Design Support" },
    ],
    price_ar: "سعرٌ مخصّص", price_en: "Custom Pricing",
    cta_label_ar: "لنتحدّث", cta_label_en: "Let's Talk",
    cta_href: "/contact", featured: false, badge_ar: null, badge_en: null, sort_order: 30,
  },
];

const DEFAULT_FEATURES: ServiceTierFeatureDTO[] = [
  { id: "f1", label_ar: "اكتشاف العلامة", label_en: "Brand Discovery", launch: "none", signature: "core", system: "full", sort_order: 10 },
  { id: "f2", label_ar: "استراتيجيّة العلامة", label_en: "Brand Strategy", launch: "none", signature: "core", system: "full", sort_order: 20 },
  { id: "f3", label_ar: "نظام الشعار", label_en: "Logo System", launch: "core", signature: "extended", system: "full", sort_order: 30 },
  { id: "f4", label_ar: "الهوية البصريّة", label_en: "Visual Identity", launch: "core", signature: "extended", system: "full", sort_order: 40 },
  { id: "f5", label_ar: "دليل الهوية", label_en: "Brand Guidelines", launch: "none", signature: "core", system: "full", sort_order: 50 },
  { id: "f6", label_ar: "الورقيّات", label_en: "Stationery", launch: "none", signature: "core", system: "full", sort_order: 60 },
  { id: "f7", label_ar: "قوالب السوشيال ميديا", label_en: "Social Templates", launch: "core", signature: "extended", system: "full", sort_order: 70 },
  { id: "f8", label_ar: "الأصول التسويقيّة", label_en: "Marketing Assets", launch: "none", signature: "none", system: "full", sort_order: 80 },
  { id: "f9", label_ar: "الدعم المستمر", label_en: "Ongoing Support", launch: "none", signature: "none", system: "full", sort_order: 90 },
];

const DEFAULT_PAGE: ServiceTierPageDTO = {
  eyebrow_ar: "فئات الخدمات", eyebrow_en: "Service Tiers",
  title_ar: "اختر الحلّ المناسب لعلامتك", title_en: "Choose the Right Branding Solution",
  subtitle_ar: "كلّ علامةٍ فريدة. خدماتي مُصمَّمة لتتناسب مع أهدافك التجاريّة وقطاعك ومرحلة نموّك.",
  subtitle_en: "Every brand is unique. Our services are tailored to your business goals, industry, and growth stage.",
  footnote_ar: "كلّ مشروع علامة تجاريّة فريدٌ من نوعه. يعتمد السعر النهائي على نطاق المشروع، والأهداف التجاريّة، والمخرجات، والجدول الزمني. الأسعار المذكورة تُمثّل قيمة الاستثمار الأوّليّة لكلّ فئة خدمة.",
  footnote_en: "Every branding project is unique. Final pricing depends on project scope, business goals, deliverables, and timeline. The listed prices represent the starting investment for each service tier.",
  cta_eyebrow_ar: "لنبدأ", cta_eyebrow_en: "Let's begin",
  cta_title_ar: "غير متأكّد من الفئة المناسبة؟", cta_title_en: "Not sure which tier fits your brand?",
  cta_subtitle_ar: "أخبرني عن مشروعك، وسأُعدّ لك عرضًا مخصّصًا يعكس أهدافك ومرحلة نموّ علامتك.",
  cta_subtitle_en: "Tell me about your project and I'll prepare a tailored proposal aligned with your goals and growth stage.",
  cta_button_ar: "اطلب عرضًا مخصّصًا", cta_button_en: "Request a custom proposal",
  cta_href: "/contact",
  compare_eyebrow_ar: "مقارنة", compare_eyebrow_en: "Compare",
  compare_title_ar: "ما الذي تحصل عليه في كلّ فئة", compare_title_en: "What's included in each tier",
};

/* --------------------------------- Cell ---------------------------------- */

type Inclusion = "none" | "core" | "extended" | "full";

function Cell({ value }: { value: Inclusion }) {
  if (value === "none") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center text-muted-foreground/40" aria-label="—">
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14" /></svg>
      </span>
    );
  }
  const tone =
    value === "full"
      ? "bg-accent text-accent-foreground"
      : value === "extended"
        ? "bg-accent/25 text-accent"
        : "bg-accent/10 text-accent";
  return (
    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${tone}`} aria-label="Included">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
    </span>
  );
}

/* ------------------------------- Component ------------------------------- */

function pick<T>(ar: T | null | undefined, en: T | null | undefined, isAr: boolean, fbAr: T, fbEn: T): T {
  return (isAr ? ar : en) ?? (isAr ? fbAr : fbEn);
}

export function PackagesView() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const base = isAr ? "" : "/en";
  const loadFn = useServerFn(getServiceTiersPageData);

  const q = useQuery<ServiceTiersPageDataDTO>({
    queryKey: ["service-tiers-page"],
    queryFn: () => loadFn(),
    placeholderData: { page: DEFAULT_PAGE, tiers: DEFAULT_TIERS, features: DEFAULT_FEATURES },
    staleTime: 60_000,
  });

  const tiers = q.data?.tiers?.length ? q.data.tiers : DEFAULT_TIERS;
  const features = q.data?.features?.length ? q.data.features : DEFAULT_FEATURES;
  const page = q.data?.page ?? DEFAULT_PAGE;

  const eyebrow = pick(page.eyebrow_ar, page.eyebrow_en, isAr, DEFAULT_PAGE.eyebrow_ar!, DEFAULT_PAGE.eyebrow_en!);
  const title = pick(page.title_ar, page.title_en, isAr, DEFAULT_PAGE.title_ar!, DEFAULT_PAGE.title_en!);
  const subtitle = pick(page.subtitle_ar, page.subtitle_en, isAr, DEFAULT_PAGE.subtitle_ar!, DEFAULT_PAGE.subtitle_en!);
  const compareEyebrow = pick(page.compare_eyebrow_ar, page.compare_eyebrow_en, isAr, DEFAULT_PAGE.compare_eyebrow_ar!, DEFAULT_PAGE.compare_eyebrow_en!);
  const compareTitle = pick(page.compare_title_ar, page.compare_title_en, isAr, DEFAULT_PAGE.compare_title_ar!, DEFAULT_PAGE.compare_title_en!);
  const footnote = pick(page.footnote_ar, page.footnote_en, isAr, DEFAULT_PAGE.footnote_ar!, DEFAULT_PAGE.footnote_en!);
  const ctaEyebrow = pick(page.cta_eyebrow_ar, page.cta_eyebrow_en, isAr, DEFAULT_PAGE.cta_eyebrow_ar!, DEFAULT_PAGE.cta_eyebrow_en!);
  const ctaTitle = pick(page.cta_title_ar, page.cta_title_en, isAr, DEFAULT_PAGE.cta_title_ar!, DEFAULT_PAGE.cta_title_en!);
  const ctaSubtitle = pick(page.cta_subtitle_ar, page.cta_subtitle_en, isAr, DEFAULT_PAGE.cta_subtitle_ar!, DEFAULT_PAGE.cta_subtitle_en!);
  const ctaButton = pick(page.cta_button_ar, page.cta_button_en, isAr, DEFAULT_PAGE.cta_button_ar!, DEFAULT_PAGE.cta_button_en!);
  const ctaHref = page.cta_href || "/contact";

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {eyebrow}
          </span>
          <h1 className="mt-8 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Tier cards */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {tiers.map((tier) => {
            const featured = tier.featured;
            const name = isAr ? tier.name_ar : tier.name_en;
            const desc = (isAr ? tier.description_ar : tier.description_en) ?? "";
            const price = (isAr ? tier.price_ar : tier.price_en) ?? "";
            const ctaLabel = (isAr ? tier.cta_label_ar : tier.cta_label_en) ?? (isAr ? "تواصل" : "Contact");
            const badge = (isAr ? tier.badge_ar : tier.badge_en) ?? (isAr ? "الأكثر اختيارًا" : "Most Popular");
            const href = tier.cta_href || "/contact";
            const to = `${base}${href.startsWith("/") ? href : `/${href}`}`;
            return (
              <article
                key={tier.id}
                className={`group relative flex flex-col rounded-3xl border p-8 transition-all duration-500 sm:p-10 ${
                  featured
                    ? "border-accent/40 bg-ink text-white shadow-[0_30px_80px_-30px_rgb(0_0_0/0.35)] hover:-translate-y-1.5 hover:shadow-[0_40px_100px_-30px_rgb(0_0_0/0.45)] md:-my-4"
                    : "border-border/70 bg-card text-card-foreground hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_60px_-30px_rgb(0_0_0/0.25)]"
                }`}
              >
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-accent-foreground shadow-md">
                    {badge}
                  </span>
                )}

                <header>
                  <h3 className={`font-display text-2xl font-semibold tracking-tight sm:text-[1.75rem] ${featured ? "text-white" : "text-foreground"}`}>
                    {name}
                  </h3>
                  <p className={`mt-3 text-sm leading-relaxed ${featured ? "text-white/70" : "text-muted-foreground"}`}>
                    {desc}
                  </p>
                </header>

                <div className={`my-8 h-px w-full ${featured ? "bg-white/10" : "bg-border/70"}`} />

                <ul className="space-y-3 text-sm">
                  {tier.deliverables.map((d, i) => (
                    <li key={i} className={`flex items-start gap-3 ${featured ? "text-white/90" : "text-foreground/85"}`}>
                      <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-accent" />
                      <span className="leading-relaxed">{isAr ? d.ar : d.en}</span>
                    </li>
                  ))}
                </ul>

                <footer className="mt-10 flex-1 flex flex-col justify-end">
                  <div className={`font-display text-xl font-semibold tracking-tight ${featured ? "text-white" : "text-foreground"}`}>
                    {price}
                  </div>
                  <Link
                    to={to}
                    className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                      featured
                        ? "bg-accent text-accent-foreground hover:brightness-110"
                        : "border border-foreground/15 bg-transparent text-foreground hover:border-accent hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {ctaLabel}
                    <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 ${isAr ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </Link>
                </footer>
              </article>
            );
          })}
        </div>
      </section>

      {/* Comparison */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
              {compareEyebrow}
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {compareTitle}
            </h2>
          </div>

          <p className="mt-6 text-center text-[11px] text-muted-foreground/70 md:hidden">
            {isAr ? "← اسحب لعرض جميع الفئات →" : "← Swipe to see all tiers →"}
          </p>

          <div className="mt-4 overflow-hidden rounded-3xl border border-border/70 bg-card md:mt-14">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border/70 bg-background/40">
                    <th className={`px-6 py-5 font-medium text-muted-foreground ${isAr ? "text-right" : "text-left"}`}>
                      {isAr ? "المكوّنات" : "Deliverables"}
                    </th>
                    {tiers.map((tier) => (
                      <th key={tier.id} className="px-4 py-5 text-center">
                        <span className={`font-display text-sm font-semibold ${tier.featured ? "text-accent" : "text-foreground"}`}>
                          {isAr ? tier.name_ar : tier.name_en}
                        </span>
                        {tier.featured && (
                          <span className="mx-auto mt-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-accent/70">
                            {(isAr ? tier.badge_ar : tier.badge_en) ?? (isAr ? "الأكثر اختيارًا" : "Most Popular")}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((row) => {
                    // Map inclusion columns to tier slug order
                    const bySlug: Record<string, Inclusion> = {
                      launch: row.launch,
                      signature: row.signature,
                      system: row.system,
                    };
                    return (
                      <tr key={row.id} className="border-b border-border/40 last:border-0 transition-colors hover:bg-background/40">
                        <td className={`px-6 py-4 font-medium text-foreground/90 ${isAr ? "text-right" : "text-left"}`}>
                          {isAr ? row.label_ar : row.label_en}
                        </td>
                        {tiers.map((tier) => (
                          <td key={tier.id} className="px-4 py-4 text-center">
                            <Cell value={bySlug[tier.slug] ?? "none"} />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground">
            {footnote}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
            {ctaEyebrow}
          </span>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {ctaTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-white/70">
            {ctaSubtitle}
          </p>
          <Link
            to={`${base}${ctaHref.startsWith("/") ? ctaHref : `/${ctaHref}`}`}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-semibold text-accent-foreground transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
          >
            {ctaButton}
            <svg viewBox="0 0 24 24" className={`h-4 w-4 ${isAr ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
