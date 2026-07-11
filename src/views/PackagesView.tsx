import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";

type Tier = {
  key: "launch" | "signature" | "system";
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  deliverables: { ar: string; en: string }[];
  price: { ar: string; en: string };
  priceNote?: { ar: string; en: string };
  cta: { ar: string; en: string };
  featured?: boolean;
};

const tiers: Tier[] = [
  {
    key: "launch",
    name: { ar: "انطلاق العلامة", en: "Brand Launch" },
    description: {
      ar: "للشركات الناشئة والمشاريع الجديدة التي تحتاج أساسًا بصريًا نظيفًا للانطلاق.",
      en: "For startups and new businesses that need a clean visual foundation to launch with.",
    },
    deliverables: [
      { ar: "تصميم الشعار", en: "Logo Design" },
      { ar: "لوحة الألوان", en: "Color Palette" },
      { ar: "نظام الطباعة", en: "Typography" },
      { ar: "أصول الهوية الأساسية", en: "Basic Brand Assets" },
      { ar: "حزمة السوشيال ميديا", en: "Social Media Kit" },
    ],
    price: { ar: "يبدأ من ٤٥٠ $", en: "Starting from $450" },
    cta: { ar: "اطلب عرضًا", en: "Request Proposal" },
  },
  {
    key: "signature",
    name: { ar: "توقيع العلامة", en: "Brand Signature" },
    description: {
      ar: "للأعمال النامية التي تسعى إلى هويّةٍ بصريّةٍ متكاملة تصنع حضورًا مميّزًا.",
      en: "For growing businesses seeking a complete visual identity with a distinctive presence.",
    },
    deliverables: [
      { ar: "اكتشاف العلامة", en: "Brand Discovery" },
      { ar: "استراتيجيّة العلامة", en: "Brand Strategy" },
      { ar: "نظام الشعار", en: "Logo System" },
      { ar: "الهوية البصريّة", en: "Visual Identity" },
      { ar: "قوالب السوشيال ميديا", en: "Social Media Templates" },
      { ar: "دليل الهوية", en: "Brand Guidelines" },
    ],
    price: { ar: "يبدأ من ١٢٥٠ $", en: "Starting from $1,250" },
    cta: { ar: "احجز جلسة اكتشاف", en: "Book a Discovery Call" },
    featured: true,
  },
  {
    key: "system",
    name: { ar: "نظام العلامة", en: "Brand System" },
    description: {
      ar: "للمؤسّسات والشركات المتوسّعة التي تحتاج نظامًا بصريًّا استراتيجيًّا شاملًا.",
      en: "For established businesses and organizations that need a comprehensive strategic brand system.",
    },
    deliverables: [
      { ar: "استراتيجيّة علامة شاملة", en: "Comprehensive Brand Strategy" },
      { ar: "نظام علامة متكامل", en: "Complete Brand System" },
      { ar: "هندسة العلامة", en: "Brand Architecture" },
      { ar: "الأصول التسويقيّة", en: "Marketing Assets" },
      { ar: "دعم تصميميّ طويل الأمد", en: "Long-Term Design Support" },
    ],
    price: { ar: "سعرٌ مخصّص", en: "Custom Pricing" },
    cta: { ar: "لنتحدّث", en: "Let's Talk" },
  },
];

// Comparison matrix — true = included, "core" = core scope, "extended" = extended, "full" = full
type Inclusion = false | "core" | "extended" | "full";

const comparisonRows: {
  label: { ar: string; en: string };
  launch: Inclusion;
  signature: Inclusion;
  system: Inclusion;
}[] = [
  { label: { ar: "اكتشاف العلامة", en: "Brand Discovery" }, launch: false, signature: "core", system: "full" },
  { label: { ar: "استراتيجيّة العلامة", en: "Brand Strategy" }, launch: false, signature: "core", system: "full" },
  { label: { ar: "نظام الشعار", en: "Logo System" }, launch: "core", signature: "extended", system: "full" },
  { label: { ar: "الهوية البصريّة", en: "Visual Identity" }, launch: "core", signature: "extended", system: "full" },
  { label: { ar: "دليل الهوية", en: "Brand Guidelines" }, launch: false, signature: "core", system: "full" },
  { label: { ar: "الورقيّات", en: "Stationery" }, launch: false, signature: "core", system: "full" },
  { label: { ar: "قوالب السوشيال ميديا", en: "Social Templates" }, launch: "core", signature: "extended", system: "full" },
  { label: { ar: "الأصول التسويقيّة", en: "Marketing Assets" }, launch: false, signature: false, system: "full" },
  { label: { ar: "الدعم المستمر", en: "Ongoing Support" }, launch: false, signature: false, system: "full" },
];

function Cell({ value }: { value: Inclusion }) {
  if (!value) {
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

export function PackagesView() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const base = isAr ? "" : "/en";

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
            {isAr ? "فئات الخدمات" : "Service Tiers"}
          </span>
          <h1 className="mt-8 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {isAr ? "اختر الحلّ المناسب لعلامتك" : "Choose the Right Branding Solution"}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {isAr
              ? "كلّ علامةٍ فريدة. خدماتي مُصمَّمة لتتناسب مع أهدافك التجاريّة وقطاعك ومرحلة نموّك."
              : "Every brand is unique. Our services are tailored to your business goals, industry, and growth stage."}
          </p>
        </div>
      </section>

      {/* Tier cards */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {tiers.map((tier) => {
            const featured = tier.featured;
            return (
              <article
                key={tier.key}
                className={`group relative flex flex-col rounded-3xl border p-8 transition-all duration-500 sm:p-10 ${
                  featured
                    ? "border-accent/40 bg-ink text-white shadow-[0_30px_80px_-30px_rgb(0_0_0/0.35)] hover:-translate-y-1.5 hover:shadow-[0_40px_100px_-30px_rgb(0_0_0/0.45)] md:-my-4"
                    : "border-border/70 bg-card text-card-foreground hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_60px_-30px_rgb(0_0_0/0.25)]"
                }`}
              >
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-accent-foreground shadow-md">
                    {isAr ? "الأكثر اختيارًا" : "Most Popular"}
                  </span>
                )}

                <header>
                  <h3 className={`font-display text-2xl font-semibold tracking-tight sm:text-[1.75rem] ${featured ? "text-white" : "text-foreground"}`}>
                    {tier.name[lang]}
                  </h3>
                  <p className={`mt-3 text-sm leading-relaxed ${featured ? "text-white/70" : "text-muted-foreground"}`}>
                    {tier.description[lang]}
                  </p>
                </header>

                <div className={`my-8 h-px w-full ${featured ? "bg-white/10" : "bg-border/70"}`} />

                <ul className="space-y-3 text-sm">
                  {tier.deliverables.map((d, i) => (
                    <li key={i} className={`flex items-start gap-3 ${featured ? "text-white/90" : "text-foreground/85"}`}>
                      <span className={`mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full ${featured ? "bg-accent" : "bg-accent"}`} />
                      <span className="leading-relaxed">{d[lang]}</span>
                    </li>
                  ))}
                </ul>

                <footer className="mt-10 flex-1 flex flex-col justify-end">
                  <div className={`font-display text-xl font-semibold tracking-tight ${featured ? "text-white" : "text-foreground"}`}>
                    {tier.price[lang]}
                  </div>
                  <Link
                    to={`${base}/contact`}
                    className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                      featured
                        ? "bg-accent text-accent-foreground hover:brightness-110"
                        : "border border-foreground/15 bg-transparent text-foreground hover:border-accent hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {tier.cta[lang]}
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
              {isAr ? "مقارنة" : "Compare"}
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {isAr ? "ما الذي تحصل عليه في كلّ فئة" : "What's included in each tier"}
            </h2>
          </div>

          <div className="mt-14 overflow-hidden rounded-3xl border border-border/70 bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border/70 bg-background/40">
                    <th className={`px-6 py-5 font-medium text-muted-foreground ${isAr ? "text-right" : "text-left"}`}>
                      {isAr ? "المكوّنات" : "Deliverables"}
                    </th>
                    {tiers.map((tier) => (
                      <th key={tier.key} className="px-4 py-5 text-center">
                        <span className={`font-display text-sm font-semibold ${tier.featured ? "text-accent" : "text-foreground"}`}>
                          {tier.name[lang]}
                        </span>
                        {tier.featured && (
                          <span className="mx-auto mt-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-accent/70">
                            {isAr ? "الأكثر اختيارًا" : "Most Popular"}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={i} className="border-b border-border/40 last:border-0 transition-colors hover:bg-background/40">
                      <td className={`px-6 py-4 font-medium text-foreground/90 ${isAr ? "text-right" : "text-left"}`}>
                        {row.label[lang]}
                      </td>
                      <td className="px-4 py-4 text-center"><Cell value={row.launch} /></td>
                      <td className="px-4 py-4 text-center"><Cell value={row.signature} /></td>
                      <td className="px-4 py-4 text-center"><Cell value={row.system} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground">
            {isAr
              ? "كلّ مشروع علامة تجاريّة فريدٌ من نوعه. يعتمد السعر النهائي على نطاق المشروع، والأهداف التجاريّة، والمخرجات، والجدول الزمني. الأسعار المذكورة تُمثّل قيمة الاستثمار الأوّليّة لكلّ فئة خدمة."
              : "Every branding project is unique. Final pricing depends on project scope, business goals, deliverables, and timeline. The listed prices represent the starting investment for each service tier."}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
            {isAr ? "لنبدأ" : "Let's begin"}
          </span>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {isAr ? "غير متأكّد من الفئة المناسبة؟" : "Not sure which tier fits your brand?"}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-white/70">
            {isAr
              ? "أخبرني عن مشروعك، وسأُعدّ لك عرضًا مخصّصًا يعكس أهدافك ومرحلة نموّ علامتك."
              : "Tell me about your project and I'll prepare a tailored proposal aligned with your goals and growth stage."}
          </p>
          <Link
            to={`${base}/contact`}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-semibold text-accent-foreground transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
          >
            {isAr ? "اطلب عرضًا مخصّصًا" : "Request a custom proposal"}
            <svg viewBox="0 0 24 24" className={`h-4 w-4 ${isAr ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
