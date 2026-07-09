import { createFileRoute, Link } from "@tanstack/react-router";
import youssefPortrait from "@/assets/youssef-portrait.jpg.asset.json";
import portfolioPdf from "@/assets/portfolio.pdf.asset.json";
import { Testimonials } from "@/components/Testimonials";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "يوسف رحاب — مصمم هوية بصرية" },
      { name: "description", content: "يوسف رحاب، مصمم هوية بصرية استراتيجي بخبرة تتجاوز ٨ سنوات مع أكثر من ٢٥٠ علامة تجارية." },
    ],
  }),
  component: Home,
});

function Home() {
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
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-7 flex flex-col justify-center">
          <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-cream px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent" /> متاحٌ لاستقبال مشاريع جديدة
          </span>
          <h1 className="font-display text-[2rem] font-semibold leading-[1.45] text-balance sm:text-4xl md:text-5xl lg:text-6xl md:leading-[1.3]">
            هوياتٌ بصريّة <span className="text-accent">تُبنى لتبقى</span>
            <span className="block mt-2 text-muted-foreground/90 font-normal text-[0.72em]">
              نظيفةٌ · ذكيّةٌ · خالدة
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-[1.9] text-muted-foreground md:text-lg">
            أنا يوسف رحاب، مصمّم هويةٍ بصريّةٍ استراتيجي. أُساعد العلامات التجارية على التعبير عن ذاتها بوضوحٍ عبر أنظمةٍ بصريّةٍ محكمةٍ تصنع فارقًا حقيقيًّا في السوق.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/projects" className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">استعراض المشاريع</Link>
            <Link to="/contact" className="rounded-full border border-primary/20 px-7 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-cream">ابدأ مشروعك</Link>
            <a
              href={portfolioPdf.url}
              download="Youssef-Rehab-Portfolio.pdf"
              className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-7 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-primary"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              تحميل ملف الأعمال
            </a>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8">
            <Stat n="+٨" label="سنواتُ خبرة" />
            <Stat n="+٢٥٠" label="علامةٌ تجاريّة" />
            <Stat n="+٢٠" label="دولةً وقطاعًا" />
          </div>
        </div>
        <div className="md:col-span-5 relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-ink">
            <img src={youssefPortrait.url} alt="يوسف رحاب" className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-6 -right-6 hidden md:block rounded-2xl bg-accent px-6 py-4 text-primary shadow-xl rotate-[-4deg]">
            <div className="font-display text-xs font-semibold">Strategic Brand</div>
            <div className="font-display text-lg font-bold leading-none">Identity Designer</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl md:text-4xl font-bold">{n}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function About() {
  const skills = ["الهوية البصريّة","الأنظمة البصريّة","تصميم الشعارات","الذكاء الاصطناعي التوليدي","تصميم العروض","السوشيال ميديا","التايبوجرافي","الإخراج الإبداعي"];
  return (
    <section className="border-y border-border bg-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-24 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="sticky top-24">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">من أنا</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold leading-tight">أُصمّم هوياتٍ<br /> تعيش طويلًا.</h2>
          </div>
        </div>
        <div className="md:col-span-7">
          <p className="text-lg leading-relaxed text-foreground/90">
            على مدى أكثر من ثماني سنوات، ساعدتُ أكثر من <strong>٢٥٠ علامةً تجاريّة</strong> في مختلف قطاعات الخليج ومصر على تحويل أفكارها إلى هويّاتٍ قويّةٍ لا تُنسى. أتخصّص في تصاميم نظيفةٍ واستراتيجيّةٍ وخالدة، تتحدّث بوضوح وتصمد أمام الزمن.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            أُؤمن بأنّ التصميم الجيّد ليس زخرفة، بل قرارٌ تجاري. كلّ تفصيلٍ في الهوية يجب أن يخدم موقع العلامة، وجمهورها، وأهدافها.
          </p>
          <div className="mt-10">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">مهاراتٌ أساسيّة</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map(s => <span key={s} className="rounded-full border border-border bg-background px-4 py-2 text-sm">{s}</span>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const items = [
    { title: "الهوية البصريّة", desc: "أنظمةٌ هوية استراتيجيّة متكاملة تعكس شخصيّة العلامة." },
    { title: "تصميم الشعارات", desc: "شعاراتٌ دقيقةٌ وخالدة، تحمل معنًى وتترك أثرًا." },
    { title: "ملفّات الشركات", desc: "بروفايلاتٌ احترافيّة تُحوّل المعلومة إلى تأثير." },
    { title: "منشورات السوشيال ميديا", desc: "محتوًى بصريٌّ إبداعيٌّ يرفع تفاعل جمهورك." },
    { title: "الأنظمة البصريّة", desc: "أدلّةُ استخدامٍ واضحة تضمن اتّساق العلامة." },
    { title: "الإخراج الإبداعي", desc: "قيادةٌ إبداعيّةٌ شاملة لحملاتك ومنتجاتك." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">الخدمات</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">ماذا أُقدّم</h2>
        </div>
        <p className="hidden md:block max-w-md text-muted-foreground">خدمات تصميمٍ شاملة تُحوّل رؤيتك إلى نظامٍ بصريٍّ متكامل.</p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
        {items.map((s, i) => (
          <div key={s.title} className="group bg-background p-8 transition-colors hover:bg-cream">
            <div className="font-display text-6xl font-bold text-accent/20 group-hover:text-accent/40 transition-colors">{String(i + 1).padStart(2, "0")}</div>
            <h3 className="mt-4 font-display text-2xl font-bold">{s.title}</h3>
            <p className="mt-2 text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="bg-ink text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-20 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
            هل لديك فكرة؟ <span className="text-accent">دعنا نُحوّلها إلى هويّة.</span>
          </h2>
          <p className="mt-4 max-w-xl text-white/70">متاحٌ لمشاريع الهويّة البصريّة والتعاونات الإبداعيّة.</p>
        </div>
        <Link to="/contact" className="inline-flex rounded-full bg-accent px-8 py-4 text-sm font-bold text-primary transition-transform hover:-translate-y-0.5">تواصل معي ←</Link>
      </div>
    </section>
  );
}
