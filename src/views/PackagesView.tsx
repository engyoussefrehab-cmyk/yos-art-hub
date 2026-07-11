import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";

type Pkg = {
  key: "starter" | "signature" | "flagship";
  name: { ar: string; en: string };
  tagline: { ar: string; en: string };
  price: { ar: string; en: string };
  timeline: { ar: string; en: string };
  best: { ar: string; en: string };
  features: { ar: string; en: string }[];
  featured?: boolean;
};

const packages: Pkg[] = [
  {
    key: "starter",
    name: { ar: "باقة البداية", en: "Starter" },
    tagline: { ar: "انطلاقة بصريّة نظيفة", en: "A clean visual launch" },
    price: { ar: "من ٤٥٠ $", en: "From $450" },
    timeline: { ar: "٧ – ١٠ أيام", en: "7 – 10 days" },
    best: { ar: "للمشاريع الناشئة والعلامات الفردية", en: "For startups & personal brands" },
    features: [
      { ar: "شعار احترافي بمفهوم واحد و٣ مراجعات", en: "Professional logo · 1 concept, 3 revisions" },
      { ar: "لوحة ألوان وطباعة أساسيّة", en: "Basic color & typography palette" },
      { ar: "ملفات جاهزة للطباعة والويب", en: "Print & web-ready files" },
      { ar: "أيقونة سوشيال ميديا وصورة غلاف", en: "Social avatar & cover image" },
      { ar: "دليل استخدام مختصر (٦ صفحات)", en: "Mini brand guidelines (6 pages)" },
    ],
  },
  {
    key: "signature",
    name: { ar: "باقة التوقيع", en: "Signature" },
    tagline: { ar: "هويّة متكاملة تُميّزك", en: "A full identity that stands out" },
    price: { ar: "من ١٢٥٠ $", en: "From $1,250" },
    timeline: { ar: "٢ – ٣ أسابيع", en: "2 – 3 weeks" },
    best: { ar: "للأعمال المتوسّطة والعلامات النامية", en: "For growing businesses" },
    featured: true,
    features: [
      { ar: "استراتيجية علامة مختصرة وتموضع", en: "Mini brand strategy & positioning" },
      { ar: "شعار رئيسي + نسخ ثانويّة + مونوغرام", en: "Primary logo + variations + monogram" },
      { ar: "نظام ألوان وطباعة كامل", en: "Full color & typography system" },
      { ar: "أنماط ورسوم داعمة للهويّة", en: "Supporting patterns & graphic elements" },
      { ar: "ورقيات: بطاقة أعمال، ورق رسمي، مغلّف", en: "Stationery: card, letterhead, envelope" },
      { ar: "قوالب سوشيال ميديا (٦ قوالب)", en: "Social media templates (6 designs)" },
      { ar: "دليل هويّة متكامل (٢٠+ صفحة)", en: "Full brand guidelines (20+ pages)" },
    ],
  },
  {
    key: "flagship",
    name: { ar: "الباقة الرائدة", en: "Flagship" },
    tagline: { ar: "نظام بصريّ استراتيجيّ شامل", en: "A complete strategic brand system" },
    price: { ar: "من ٣٢٠٠ $", en: "From $3,200" },
    timeline: { ar: "٤ – ٦ أسابيع", en: "4 – 6 weeks" },
    best: { ar: "للشركات والمشاريع الكبيرة", en: "For enterprises & premium brands" },
    features: [
      { ar: "ورشة اكتشاف واستراتيجيّة تموضع", en: "Discovery workshop & positioning strategy" },
      { ar: "منظومة هويّة كاملة بجميع الاستخدامات", en: "Complete identity system for all use cases" },
      { ar: "نظام أيقونات ورسوم مخصّص", en: "Custom icon set & illustration style" },
      { ar: "ملف تعريفي احترافي (١٢–٢٠ صفحة)", en: "Company profile (12–20 pages)" },
      { ar: "قوالب عروض تقديميّة", en: "Presentation templates" },
      { ar: "خطّة سوشيال ميديا لشهر (١٢ منشورًا)", en: "1-month social plan (12 posts)" },
      { ar: "دليل هويّة رقميّ وطباعيّ (٤٠+ صفحة)", en: "Print & digital guidelines (40+ pages)" },
      { ar: "متابعة ودعم لمدّة ٣٠ يومًا", en: "30-day post-launch support" },
    ],
  },
];

const addons = [
  { ar: "شعار إضافي", en: "Extra logo", price: { ar: "٢٥٠ $", en: "$250" } },
  { ar: "ملف تعريفي (Company Profile)", en: "Company profile", price: { ar: "من ٦٠٠ $", en: "From $600" } },
  { ar: "تصميم موقع لاندنج", en: "Landing page design", price: { ar: "من ٩٠٠ $", en: "From $900" } },
  { ar: "قوالب سوشيال ميديا (١٠)", en: "Social templates (10)", price: { ar: "٣٥٠ $", en: "$350" } },
  { ar: "تصميم عرض تقديمي", en: "Pitch deck design", price: { ar: "من ٤٥٠ $", en: "From $450" } },
  { ar: "تصميم تغليف منتج", en: "Packaging design", price: { ar: "من ٧٥٠ $", en: "From $750" } },
];

export function PackagesView() {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const base = isAr ? "" : "/en";
  const arrow = isAr ? "←" : "→";

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-background">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-20 text-center sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {isAr ? "الباقات والأسعار" : "Packages & Pricing"}
          </span>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {isAr ? "استثمارٌ في هويّةٍ" : "Invest in an identity"}
            <br />
            <span className="text-accent">{isAr ? "تبقى وتُميّز" : "that lasts & stands out"}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {isAr
              ? "باقات مصمَّمة لمراحل مختلفة من رحلة علامتك — من الانطلاق إلى التوسّع. كلّ باقة قابلة للتخصيص وفق احتياجك."
              : "Packages crafted for every stage of your brand journey — from launch to scale. Each one is fully customizable to fit your needs."}
          </p>
        </div>
      </section>

      {/* Packages grid */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {packages.map((pkg) => {
            const featured = pkg.featured;
            return (
              <div
                key={pkg.key}
                className={`relative flex flex-col rounded-3xl border p-8 transition-all hover:-translate-y-1 ${
                  featured
                    ? "border-accent/50 bg-ink text-white shadow-2xl md:-my-4 md:scale-[1.03]"
                    : "border-border bg-card text-card-foreground hover:border-accent/40"
                }`}
              >
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground shadow-md">
                    {isAr ? "الأكثر اختيارًا" : "Most popular"}
                  </span>
                )}
                <div className={`text-xs font-semibold uppercase tracking-[0.2em] ${featured ? "text-accent" : "text-accent"}`}>
                  {pkg.tagline[lang]}
                </div>
                <h3 className={`mt-3 font-display text-2xl font-semibold ${featured ? "text-white" : "text-foreground"}`}>
                  {pkg.name[lang]}
                </h3>
                <div className={`mt-4 font-display text-4xl font-bold ${featured ? "text-white" : "text-foreground"}`}>
                  {pkg.price[lang]}
                </div>
                <div className={`mt-1 text-xs ${featured ? "text-white/60" : "text-muted-foreground"}`}>
                  {isAr ? "مدّة التنفيذ:" : "Timeline:"} {pkg.timeline[lang]}
                </div>
                <div className={`mt-4 rounded-lg border px-3 py-2 text-xs ${featured ? "border-white/15 bg-white/5 text-white/75" : "border-border bg-background/60 text-muted-foreground"}`}>
                  {pkg.best[lang]}
                </div>

                <ul className="mt-6 space-y-3 text-sm">
                  {pkg.features.map((f, i) => (
                    <li key={i} className={`flex gap-2 ${featured ? "text-white/85" : "text-foreground/85"}`}>
                      <svg viewBox="0 0 24 24" className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? "text-accent" : "text-accent"}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      <span className="leading-relaxed">{f[lang]}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={`${base}/contact`}
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                    featured
                      ? "bg-accent text-accent-foreground hover:brightness-110"
                      : "bg-primary text-primary-foreground hover:brightness-110"
                  }`}
                >
                  {isAr ? "اطلب الباقة" : "Get started"}
                  <span>{arrow}</span>
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          {isAr
            ? "* الأسعار إرشاديّة وتختلف بحسب نطاق المشروع. تُدفع على دفعتين (٥٠٪ مقدّم / ٥٠٪ عند التسليم)."
            : "* Indicative pricing; final quote depends on scope. Paid in two installments (50% upfront / 50% on delivery)."}
        </p>
      </section>

      {/* Add-ons */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              {isAr ? "خدمات إضافيّة" : "Add-ons"}
            </span>
            <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
              {isAr ? "خصّص باقتك كما تشاء" : "Customize your package"}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {isAr
                ? "خدمات فرديّة يمكن إضافتها لأيّ باقة أو طلبها بشكل مستقل."
                : "Individual services you can add to any package or order standalone."}
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {addons.map((a, i) => (
              <div key={i} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:border-accent/40">
                <span className="text-sm font-medium text-card-foreground">{isAr ? a.ar : a.en}</span>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">{a.price[lang]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            {isAr ? "آليّة العمل" : "Process"}
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            {isAr ? "كيف نعمل معًا" : "How we work together"}
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {[
            { n: "01", ar: "اكتشاف", en: "Discovery", d_ar: "جلسة نفهم فيها علامتك وجمهورك وأهدافك.", d_en: "A session to understand your brand, audience, and goals." },
            { n: "02", ar: "استراتيجيّة", en: "Strategy", d_ar: "نُحدّد التموضع والاتّجاه الإبداعي.", d_en: "We define positioning and creative direction." },
            { n: "03", ar: "تصميم", en: "Design", d_ar: "نصنع الهويّة عبر تكرارات مدروسة.", d_en: "We craft the identity through refined iterations." },
            { n: "04", ar: "تسليم", en: "Delivery", d_ar: "تسليم الملفّات والدليل مع المتابعة.", d_en: "Files, guidelines, and post-launch support." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-accent/40">
              <div className="font-display text-3xl font-bold text-accent">{s.n}</div>
              <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{isAr ? s.ar : s.en}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{isAr ? s.d_ar : s.d_en}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              {isAr ? "أسئلة شائعة" : "FAQ"}
            </span>
            <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
              {isAr ? "أسئلة يُكرّرها العملاء" : "Frequently asked"}
            </h2>
          </div>
          <div className="mt-10 space-y-3">
            {[
              { q_ar: "هل يمكن تخصيص باقة مختلفة؟", q_en: "Can I customize a package?", a_ar: "نعم — أيّ باقة قابلة للتخصيص. تواصل معي بتفاصيل مشروعك وسأُعدّ عرضًا مخصّصًا.", a_en: "Yes — every package is customizable. Share your project details and I'll prepare a tailored quote." },
              { q_ar: "ما طريقة الدفع؟", q_en: "How does payment work?", a_ar: "دفعتان: ٥٠٪ مقدّمًا لبدء العمل، و٥٠٪ عند تسليم الملفّات النهائيّة.", a_en: "Two installments: 50% upfront to begin work, 50% on final delivery." },
              { q_ar: "كم عدد المراجعات المسموح بها؟", q_en: "How many revisions are included?", a_ar: "٣ مراجعات في باقة البداية، و٥ في التوقيع، ومراجعات مفتوحة ضمن النطاق في الرائدة.", a_en: "3 rounds in Starter, 5 in Signature, and open rounds within scope in Flagship." },
              { q_ar: "ماذا لو احتجتُ تعديلات لاحقة؟", q_en: "What if I need edits later?", a_ar: "الباقة الرائدة تشمل ٣٠ يومًا دعم مجّاني. بعدها تُحسب التعديلات بالساعة.", a_en: "Flagship includes 30 days of free support. Later edits are billed hourly." },
            ].map((f, i) => (
              <details key={i} className="group rounded-2xl border border-border bg-card px-5 py-4 transition-colors open:border-accent/40">
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                  {isAr ? f.q_ar : f.q_en}
                  <span className="text-accent transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{isAr ? f.a_ar : f.a_en}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            {isAr ? "لست متأكّدًا من الباقة المناسبة؟" : "Not sure which package fits?"}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            {isAr
              ? "أخبرني عن مشروعك، وسأُرشّح لك الأنسب بناءً على مرحلة علامتك وأهدافك."
              : "Tell me about your project, and I'll recommend the best fit based on your brand stage and goals."}
          </p>
          <Link
            to={`${base}/contact`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
          >
            {t("cta_button")}
          </Link>
        </div>
      </section>
    </div>
  );
}
