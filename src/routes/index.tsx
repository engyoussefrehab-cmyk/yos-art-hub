import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import portrait from "@/assets/portfolio/portrait.jpg";
import p5 from "@/assets/portfolio/page_5.jpg";
import p6 from "@/assets/portfolio/page_6.jpg";
import p7 from "@/assets/portfolio/page_7.jpg";
import p8 from "@/assets/portfolio/page_8.jpg";
import p9 from "@/assets/portfolio/page_9.jpg";
import p10 from "@/assets/portfolio/page_10.jpg";
import p11 from "@/assets/portfolio/page_11.jpg";
import p12 from "@/assets/portfolio/page_12.jpg";
import p13 from "@/assets/portfolio/page_13.jpg";
import p14 from "@/assets/portfolio/page_14.jpg";
import p15 from "@/assets/portfolio/page_15.jpg";
import p16 from "@/assets/portfolio/page_16.jpg";
import p17 from "@/assets/portfolio/page_17.jpg";
import p18 from "@/assets/portfolio/page_18.jpg";
import p19 from "@/assets/portfolio/page_19.jpg";
import p20 from "@/assets/portfolio/page_20.jpg";
import p22 from "@/assets/portfolio/page_22.jpg";
import p23 from "@/assets/portfolio/page_23.jpg";
import p24 from "@/assets/portfolio/page_24.jpg";
import p25 from "@/assets/portfolio/page_25.jpg";
import p27 from "@/assets/portfolio/page_27.jpg";
import p28 from "@/assets/portfolio/page_28.jpg";
import p29 from "@/assets/portfolio/page_29.jpg";
import p30 from "@/assets/portfolio/page_30.jpg";
import p31 from "@/assets/portfolio/page_31.jpg";
import p32 from "@/assets/portfolio/page_32.jpg";
import p34 from "@/assets/portfolio/page_34.jpg";
import p35 from "@/assets/portfolio/page_35.jpg";
import p36 from "@/assets/portfolio/page_36.jpg";
import p37 from "@/assets/portfolio/page_37.jpg";
import p38 from "@/assets/portfolio/page_38.jpg";
import p39 from "@/assets/portfolio/page_39.jpg";
import p40 from "@/assets/portfolio/page_40.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

type Project = {
  name: string;
  tagline: string;
  description: string;
  approach: string[];
  value: string;
  country: string;
  year: string;
  cover: string;
  mockup: string;
};

const projects: Project[] = [
  {
    name: "ترسية",
    tagline: "منصة اجتماعات مدعومة بالذكاء الاصطناعي",
    description:
      "ترسية مصممة لتحويل طريقة تعاون الفرق عبر تحويل المحادثات إلى رؤى واضحة قابلة للتنفيذ، بما يتيح اتخاذ قرارات أكثر تركيزًا وكفاءة.",
    approach: [
      "تركيز على القرار لا مجرد اجتماعات",
      "تحويل التعقيد إلى وضوح",
      "هوية دقيقة ومقتضبة",
      "تعاون فعّال ومركّز",
    ],
    value: "تُلغي ضوضاء الاجتماعات وتقدّم وضوحًا يقود القرار.",
    country: "السعودية",
    year: "2026",
    cover: p5,
    mockup: p6,
  },
  {
    name: "عكّاس",
    tagline: "إنتاج بصري تجاري",
    description:
      "علامة إنتاج بصري متخصصة في المحتوى الإعلاني، تركّز على صناعة محتوى مؤثر يرتقي بحضور العلامات التجارية.",
    approach: [
      "توجّه تجاري صريح",
      "من الفكرة إلى الأثر البصري",
      "هوية جريئة عالية التباين",
      "حضور قوي وفاخر",
    ],
    value: "نحوّل أفكار العلامات إلى حملات بصرية عالية التأثير.",
    country: "الإمارات",
    year: "2026",
    cover: p7,
    mockup: p8,
  },
  {
    name: "OGG الأبدع",
    tagline: "تقنية وحلول رقمية",
    description:
      "شركة تقنية تفكّر بمستقبلية، متخصصة في تقديم حلول رقمية مبتكرة تجمع بين الوظيفة والإبداع والتفكير المستقبلي.",
    approach: [
      "توجّه قائم على الابتكار",
      "لغة بصرية مستقبلية",
      "هوية هندسية نظيفة",
      "إدراك تقني للعلامة",
    ],
    value: "حلول رقمية ذكية وجاهزة للمستقبل من خلال الابتكار والتصميم.",
    country: "السعودية",
    year: "2025",
    cover: p9,
    mockup: p10,
  },
  {
    name: "Inspire Travel",
    tagline: "تجارب سفر سلسة وملهمة",
    description:
      "علامة سفر ديناميكية تركّز على تقديم تجارب سفر سلسة، ملهمة، لا تُنسى.",
    approach: [
      "الإلهام لا مجرد التنقّل",
      "البساطة تقود الوضوح",
      "هوية عصرية بسيطة تُذكر",
      "دمج بين العاطفة والوظيفة",
    ],
    value: "يحوّل السفر إلى تجربة واضحة وملهمة وسلسة.",
    country: "مصر",
    year: "2025",
    cover: p11,
    mockup: p12,
  },
  {
    name: "اللجنة الوطنية للعمرة والزيارة",
    tagline: "تنظيم خدمات ضيوف الرحمن بثقة",
    description:
      "تركّز على ضمان الالتزام والاتساق والجودة عبر جميع مزوّدي الخدمة، لتقديم منظومة موثوقة ومنظّمة لخدمات العمرة والزيارة.",
    approach: [
      "تشغيل قائم على النظام",
      "تنظيم يفضي إلى اتساق وثقة",
      "عمليات واضحة عبر جميع مراحل الخدمة",
      "هوية رسمية موثوقة",
    ],
    value: "تُرسّخ إطارًا موحّدًا ومنظّمًا لخدمات العمرة والزيارة.",
    country: "السعودية",
    year: "2025",
    cover: p13,
    mockup: p14,
  },
  {
    name: "BUNMAY",
    tagline: "صياغة راقية",
    description:
      "علامة تعبّر عن الأناقة والحرفة في تفاصيلها، بهوية تحمل الطابع الفاخر والدقّة في كل تعبير بصري.",
    approach: [
      "أناقة كلاسيكية معاصرة",
      "دقّة في التفاصيل والطباعة",
      "لغة بصرية فاخرة",
      "حضور راقٍ ومتزن",
    ],
    value: "هوية فاخرة تعكس القيمة والجودة عبر كل نقطة تلامس.",
    country: "الإمارات",
    year: "2025",
    cover: p15,
    mockup: p16,
  },
  {
    name: "قطوف",
    tagline: "خضار وفواكه طازجة",
    description:
      "علامة توفّر فواكه وخضروات طازجة عالية الجودة مع تجربة تسوّق موثوقة وممتعة.",
    approach: [
      "طزاجة يومية موثوقة",
      "خط عربي دافئ",
      "هوية قريبة من الحياة اليومية",
      "تجربة تسوّق ممتعة",
    ],
    value: "تجربة تسوّق أنيقة وسهلة لأجود المنتجات الطازجة.",
    country: "الخليج",
    year: "2025",
    cover: p17,
    mockup: p18,
  },
  {
    name: "HZ Online Academy",
    tagline: "التعلّم ببساطة",
    description:
      "أكاديمية إلكترونية تُبسّط رحلة التعلّم عبر تجربة مباشرة، واضحة، وممتعة للمتعلّم.",
    approach: [
      "تبسيط رحلة التعلّم",
      "لغة بصرية شبابية عصرية",
      "وضوح في التسلسل التعليمي",
      "هوية مرنة قابلة للتوسّع",
    ],
    value: "تجربة تعلّم مبسّطة وممتعة عبر منصّة واضحة.",
    country: "مصر",
    year: "2025",
    cover: p19,
    mockup: p20,
  },
];

const logoBoards = [p22, p23, p24, p25];
const profileBoards = [p27, p28, p29, p30, p31, p32];
const socialBoards = [p34, p35, p36, p37, p38, p39, p40];

const services = [
  { title: "الهوية البصرية", desc: "أنظمة هوية استراتيجية متكاملة تعكس شخصية العلامة." },
  { title: "تصميم الشعارات", desc: "شعارات دقيقة، خالدة، تحمل معنى وتترك أثرًا." },
  { title: "ملفات الشركات", desc: "بروفايلات احترافية تحوّل المعلومة إلى تأثير." },
  { title: "منشورات السوشيال ميديا", desc: "محتوى بصري إبداعي يرفع تفاعل جمهورك." },
  { title: "الأنظمة البصرية", desc: "أدلة استخدام واضحة تضمن اتساق العلامة." },
  { title: "الإخراج الإبداعي", desc: "قيادة إبداعية شاملة لحملاتك ومنتجاتك." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <About />
      <Services />
      <Projects />
      <LogoGrid />
      <Profiles />
      <Social />
      <Contact />
      <Footer />
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#about", label: "من أنا" },
    { href: "#services", label: "الخدمات" },
    { href: "#projects", label: "المشاريع" },
    { href: "#logos", label: "الشعارات" },
    { href: "#contact", label: "تواصل" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground font-black">
            ي
          </span>
          <span className="font-display text-lg font-bold">يوسف رحاب<span className="text-accent">®</span></span>
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href="https://wa.me/201030365405"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          تواصل معي
        </a>
        <button
          className="md:hidden rounded-md border border-border p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="القائمة"
        >
          <span className="block h-0.5 w-5 bg-foreground mb-1" />
          <span className="block h-0.5 w-5 bg-foreground mb-1" />
          <span className="block h-0.5 w-5 bg-foreground" />
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm text-muted-foreground">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-7 flex flex-col justify-center">
          <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-cream px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-accent" />
            متاح لمشاريع فريلانس وتعاونات
          </span>
          <h1 className="font-display text-5xl font-black leading-[1.05] text-balance md:text-7xl">
            هويات بصرية <span className="text-accent">جريئة</span>،
            <br /> واضحة، لا تُنسى.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
            أنا يوسف رحاب، مصمم هوية بصرية استراتيجي بخبرة تتجاوز ٨ سنوات، أساعد العلامات على تحويل أفكارها إلى أنظمة بصرية قوية، بسيطة، وخالدة تتحدث بوضوح وتتميّز في الأسواق التنافسية.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="#projects" className="inline-flex items-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">
              استعرض المشاريع
            </a>
            <a href="#contact" className="inline-flex items-center rounded-full border border-primary/20 px-7 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-cream">
              ابدأ مشروعك
            </a>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8">
            <Stat n="+٨" label="سنوات خبرة" />
            <Stat n="+٢٥٠" label="علامة تجارية" />
            <Stat n="+٢٠" label="دولة وقطاع" />
          </div>
        </div>
        <div className="md:col-span-5 relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-ink">
            <img src={portrait} alt="يوسف رحاب" className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-6 -right-6 hidden md:block rounded-2xl bg-accent px-6 py-4 text-primary shadow-xl rotate-[-4deg]">
            <div className="font-display text-xs font-bold">Strategic Brand</div>
            <div className="font-display text-lg font-black leading-none">Identity Designer</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl md:text-4xl font-black">{n}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function About() {
  const skills = [
    "الهوية البصرية",
    "الأنظمة البصرية",
    "تصميم الشعارات",
    "الذكاء الاصطناعي التوليدي",
    "تصميم العروض",
    "منشورات السوشيال ميديا",
    "التايبوجرافي",
    "الإخراج الإبداعي",
  ];
  return (
    <section id="about" className="border-y border-border bg-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-24 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="sticky top-24">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">من أنا</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-black leading-tight">
              أصمّم هويات
              <br /> تعيش طويلاً.
            </h2>
          </div>
        </div>
        <div className="md:col-span-7">
          <p className="text-lg leading-relaxed text-foreground/90">
            على مدى أكثر من ثماني سنوات، ساعدت أكثر من <strong>٢٥٠ علامة تجارية</strong> في مختلف قطاعات منطقة الخليج على تحويل أفكارها إلى هويات قوية لا تُنسى. أتخصّص في تصميمات نظيفة، استراتيجية، وخالدة تتواصل بوضوح وتصمد أمام الزمن.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            أؤمن أن التصميم الجيد ليس زخرفة، بل قرار تجاري. كل تفصيل في الهوية يجب أن يخدم موقع العلامة، جمهورها، وأهدافها.
          </p>
          <div className="mt-10">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">مهارات أساسية</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="rounded-full border border-border bg-background px-4 py-2 text-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">الخدمات</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-black">ماذا أقدّم</h2>
        </div>
        <p className="hidden md:block max-w-md text-muted-foreground">
          خدمات تصميم شاملة تحوّل رؤيتك إلى نظام بصري متكامل يعمل عبر كل نقاط التلامس.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <div key={s.title} className="group relative bg-background p-8 transition-colors hover:bg-cream">
            <div className="font-display text-6xl font-black text-accent/20 group-hover:text-accent/40 transition-colors">
              {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="mt-4 font-display text-2xl font-bold">{s.title}</h3>
            <p className="mt-2 text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Projects() {
  return (
    <section id="projects" className="border-t border-border bg-ink text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">أعمال مختارة</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-black">المشاريع</h2>
          </div>
          <p className="hidden md:block max-w-md text-white/60">
            هويات بصرية استراتيجية لعلامات في الخليج ومصر عبر قطاعات متنوّعة.
          </p>
        </div>
        <div className="mt-16 space-y-24">
          {projects.map((p, i) => (
            <ProjectRow key={p.name} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const flip = index % 2 === 1;
  return (
    <article className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12 items-center">
      <div className={`md:col-span-7 ${flip ? "md:order-2" : ""}`}>
        <div className="relative overflow-hidden rounded-2xl bg-white/5 aspect-[4/3]">
          <img src={project.cover} alt={project.name} className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-xl bg-white/5 aspect-[4/3]">
            <img src={project.mockup} alt={`${project.name} mockup`} className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="rounded-xl border border-white/10 p-4 flex flex-col justify-between">
            <div className="text-xs uppercase tracking-widest text-accent">Value Proposition</div>
            <p className="mt-2 text-sm text-white/80 leading-relaxed">{project.value}</p>
          </div>
        </div>
      </div>
      <div className={`md:col-span-5 ${flip ? "md:order-1" : ""}`}>
        <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-white/50">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span className="h-px w-8 bg-white/20" />
          <span>هوية بصرية · {project.country} · {project.year}</span>
        </div>
        <h3 className="mt-4 font-display text-4xl md:text-5xl font-black">{project.name}</h3>
        <div className="mt-1 text-accent font-medium">{project.tagline}</div>
        <p className="mt-5 text-white/70 leading-relaxed">{project.description}</p>
        <div className="mt-6">
          <div className="text-xs uppercase tracking-widest text-white/50 mb-3">التوجّه والمقاربة</div>
          <ul className="space-y-2">
            {project.approach.map((a) => (
              <li key={a} className="flex items-start gap-3 text-sm text-white/80">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function LogoGrid() {
  return (
    <section id="logos" className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">٠٢ — الشعارات</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-black">شعارات مختارة</h2>
        </div>
        <p className="hidden md:block max-w-md text-muted-foreground">
          تصاميم شعارات تتواصل بوضوح وتترك انطباعًا يدوم.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {logoBoards.map((src, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-cream">
            <img src={src} alt={`Logos board ${i + 1}`} className="w-full" loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
}

function Profiles() {
  return (
    <section className="border-t border-border bg-cream">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between gap-6 border-b border-border pb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">٠٣ — بروفايلات</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-black">ملفات الشركات</h2>
          </div>
          <p className="hidden md:block max-w-md text-muted-foreground">
            بروفايلات مقنعة تحوّل المعلومة إلى تأثير.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profileBoards.map((src, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border bg-background">
              <img src={src} alt={`Company profile ${i + 1}`} className="w-full" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Social() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">٠٤ — سوشيال ميديا</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-black">منشورات إبداعية</h2>
        </div>
        <p className="hidden md:block max-w-md text-muted-foreground">
          محتوى بصري يرفع علامتك ويثير التفاعل.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {socialBoards.map((src, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-cream">
            <img src={src} alt={`Social post ${i + 1}`} className="w-full" loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="border-t border-border bg-ink text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 items-center">
          <div className="md:col-span-7">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">تواصل</span>
            <h2 className="mt-3 font-display text-4xl md:text-6xl font-black leading-tight">
              عندك فكرة؟
              <br /> خلّينا نحوّلها لهوية.
            </h2>
            <p className="mt-6 max-w-xl text-white/70">
              متاح لمشاريع الهوية البصرية والتعاونات الإبداعية. راسلني وسنبدأ رحلة بناء علامتك.
            </p>
          </div>
          <div className="md:col-span-5 space-y-4">
            <a
              href="https://wa.me/201030365405"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-accent hover:text-primary"
            >
              <div>
                <div className="text-xs uppercase tracking-widest opacity-60">واتساب / اتصال</div>
                <div className="mt-1 font-display text-xl font-bold" dir="ltr">+20 103 036 5405</div>
              </div>
              <span className="text-2xl">←</span>
            </a>
            <a
              href="mailto:youssefrehab@outlook.com"
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-accent hover:text-primary"
            >
              <div>
                <div className="text-xs uppercase tracking-widest opacity-60">البريد الإلكتروني</div>
                <div className="mt-1 font-display text-xl font-bold" dir="ltr">youssefrehab@outlook.com</div>
              </div>
              <span className="text-2xl">←</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-ink text-white/60 border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
        <div className="font-display text-sm">
          © {new Date().getFullYear()} يوسف رحاب<span className="text-accent">®</span> — جميع الحقوق محفوظة
        </div>
        <div className="text-xs uppercase tracking-widest">Strategic Brand Identity Designer</div>
      </div>
    </footer>
  );
}
