import type { Lang } from "@/i18n/dictionary";

export type CategorySlug =
  | "brand-strategy"
  | "visual-identity"
  | "logo-design"
  | "presentation-design"
  | "business"
  | "marketing"
  | "ai"
  | "case-studies"
  | "resources";

export interface InsightCategory {
  slug: CategorySlug;
  label: { ar: string; en: string };
  description: { ar: string; en: string };
}

export const INSIGHT_CATEGORIES: InsightCategory[] = [
  {
    slug: "brand-strategy",
    label: { ar: "استراتيجية العلامة", en: "Brand Strategy" },
    description: {
      ar: "أطر عمل ومبادئ لبناء علامات تجارية متماسكة تصمد أمام الزمن.",
      en: "Frameworks and principles for building coherent brands that stand the test of time.",
    },
  },
  {
    slug: "visual-identity",
    label: { ar: "الهوية البصرية", en: "Visual Identity" },
    description: {
      ar: "أنظمة بصرية متكاملة تنقل شخصية العلامة بوضوح واتساق.",
      en: "Complete visual systems that convey brand personality with clarity and consistency.",
    },
  },
  {
    slug: "logo-design",
    label: { ar: "تصميم الشعارات", en: "Logo Design" },
    description: {
      ar: "منهجية تصميم شعارات دقيقة، خالدة، وذات معنى.",
      en: "A methodology for designing precise, timeless, and meaningful logos.",
    },
  },
  {
    slug: "presentation-design",
    label: { ar: "تصميم العروض", en: "Presentation Design" },
    description: {
      ar: "كيف تحوّل الأفكار المعقّدة إلى عروض بصرية مقنعة.",
      en: "How to turn complex ideas into persuasive visual presentations.",
    },
  },
  {
    slug: "business",
    label: { ar: "أعمال", en: "Business" },
    description: {
      ar: "رؤى في إدارة أعمال التصميم والتسعير والتعامل مع العملاء.",
      en: "Insights into running a design business — pricing, clients, and operations.",
    },
  },
  {
    slug: "marketing",
    label: { ar: "التسويق", en: "Marketing" },
    description: {
      ar: "استراتيجيات التسويق البصري وبناء الحضور الرقمي للعلامة.",
      en: "Visual marketing strategies and building a brand's digital presence.",
    },
  },
  {
    slug: "ai",
    label: { ar: "الذكاء الاصطناعي", en: "AI" },
    description: {
      ar: "توظيف الذكاء الاصطناعي في سير عمل التصميم والإبداع.",
      en: "Leveraging AI in design workflows and creative production.",
    },
  },
  {
    slug: "case-studies",
    label: { ar: "دراسات حالة", en: "Case Studies" },
    description: {
      ar: "قصص من أرض الواقع لمشاريع علامات تجارية نفّذناها.",
      en: "Real-world stories from brand projects we've delivered.",
    },
  },
  {
    slug: "resources",
    label: { ar: "موارد", en: "Resources" },
    description: {
      ar: "أدوات، قوالب، ومراجع مختارة لمصمّمي الهويات البصرية.",
      en: "Curated tools, templates, and references for identity designers.",
    },
  },
];

export function getCategory(slug: string): InsightCategory | undefined {
  return INSIGHT_CATEGORIES.find((c) => c.slug === slug);
}

// ── Article content blocks ──────────────────────────────────────────────
export type Bi = { ar: string; en: string };
export type Block =
  | { type: "p"; text: Bi }
  | { type: "h2"; id: string; text: Bi }
  | { type: "h3"; id: string; text: Bi }
  | { type: "quote"; text: Bi; cite?: string }
  | { type: "list"; items: Bi[] }
  | { type: "callout"; title: Bi; text: Bi };

export interface FaqItem {
  q: Bi;
  a: Bi;
}

export interface Article {
  slug: string;
  category: CategorySlug;
  title: Bi;
  excerpt: Bi;
  author: { ar: string; en: string };
  publishedAt: string; // ISO
  readingMinutes: number;
  keywords: string[];
  cover: {
    // gradient palette from tailwind tokens (dark→light)
    from: string;
    to: string;
    accent: string;
  };
  content: Block[];
  faq?: FaqItem[];
  featured?: boolean;
}

const AUTHOR = { ar: "يوسف رحاب", en: "Youssef Rehab" };

export const ARTICLES: Article[] = [
  {
    slug: "brand-strategy-first-principles",
    category: "brand-strategy",
    featured: true,
    title: {
      ar: "استراتيجية العلامة قبل التصميم: خمسة مبادئ لا غنى عنها",
      en: "Strategy Before Design: 5 Non-Negotiable Brand Principles",
    },
    excerpt: {
      ar: "قبل أن يُرسم شعار أو يُختار لون، هناك خمس قرارات استراتيجية تُحدّد نجاح الهوية. هذه هي.",
      en: "Before a logo is drawn or a color chosen, five strategic decisions determine an identity's success. Here they are.",
    },
    author: AUTHOR,
    publishedAt: "2026-06-14",
    readingMinutes: 9,
    keywords: ["brand strategy", "positioning", "visual identity", "استراتيجية العلامة"],
    cover: { from: "#0b1220", to: "#1a2540", accent: "#d4a373" },
    content: [
      {
        type: "p",
        text: {
          ar: "التصميم البصري بلا استراتيجية زخرفة. القرارات الجمالية التي لا تستند إلى فهم عميق للسوق والجمهور والموقع تُنتج علامات تبدو جميلة لكنها لا تعمل.",
          en: "Visual design without strategy is decoration. Aesthetic choices that aren't rooted in a deep understanding of market, audience, and position produce brands that look nice but don't work.",
        },
      },
      { type: "h2", id: "positioning", text: { ar: "١. الموقع الاستراتيجي", en: "1. Strategic Positioning" } },
      {
        type: "p",
        text: {
          ar: "أين تقف علامتك في ذهن العميل مقارنةً بمنافسيها؟ الموقع هو الوعد الذي تصنعه — يجب أن يكون واضحًا وقابلًا للدفاع عنه.",
          en: "Where does your brand stand in the customer's mind relative to competitors? Positioning is the promise you make — it must be clear and defensible.",
        },
      },
      { type: "h2", id: "audience", text: { ar: "٢. الجمهور الحقيقي", en: "2. The Real Audience" } },
      {
        type: "p",
        text: {
          ar: "ليس \"الجميع\". حدّد شريحة دقيقة يمكنك خدمتها بشكل استثنائي، ثم صمّم لهم لا لغيرهم.",
          en: "Not \"everyone.\" Define a narrow segment you can serve exceptionally, then design for them and no one else.",
        },
      },
      {
        type: "quote",
        text: {
          ar: "العلامة التي تُخاطب الجميع لا تُخاطب أحدًا.",
          en: "A brand that speaks to everyone speaks to no one.",
        },
      },
      { type: "h2", id: "personality", text: { ar: "٣. الشخصية والصوت", en: "3. Personality & Voice" } },
      {
        type: "p",
        text: {
          ar: "هل علامتك رصينة أم جريئة؟ حرفيّة أم عاطفيّة؟ حدّد سمات الشخصية قبل أن تلمس أدوات التصميم.",
          en: "Is your brand serious or bold? Technical or emotional? Define personality traits before touching design tools.",
        },
      },
      { type: "h2", id: "value", text: { ar: "٤. القيمة الجوهريّة", en: "4. Core Value" } },
      {
        type: "p",
        text: {
          ar: "ما القيمة التي تُقدّمها ولا يُقدّمها غيرك؟ لخّصها في جملة واحدة يفهمها ابن عشر سنوات.",
          en: "What value do you offer that no one else does? Distill it into one sentence a ten-year-old would understand.",
        },
      },
      { type: "h2", id: "system", text: { ar: "٥. النظام قبل الأصول", en: "5. System Before Assets" } },
      {
        type: "p",
        text: {
          ar: "الشعار أصل واحد. النظام هو مجموعة القواعد التي تجعل مئات الأصول اللاحقة متسقة. ابنِ النظام أولًا.",
          en: "A logo is one asset. A system is the set of rules that keeps hundreds of downstream assets coherent. Build the system first.",
        },
      },
      {
        type: "callout",
        title: { ar: "خلاصة", en: "Takeaway" },
        text: {
          ar: "استثمر ثلث وقت المشروع في الاستراتيجية قبل رفع أي قلم رقمي. النتيجة تستحقّ.",
          en: "Invest a third of the project timeline in strategy before lifting a digital pen. The result is worth it.",
        },
      },
    ],
    faq: [
      {
        q: { ar: "متى تبدأ في العمل على الاستراتيجية؟", en: "When should strategy work start?" },
        a: {
          ar: "قبل أي قرار بصري. عادةً في أول أسبوعين من مشروع الهوية.",
          en: "Before any visual decision. Typically in the first two weeks of an identity project.",
        },
      },
      {
        q: { ar: "هل يمكن للمصمّم أن يقوم بالاستراتيجية؟", en: "Can a designer handle strategy?" },
        a: {
          ar: "نعم، إذا كان مصمّمًا استراتيجيًّا. غير ذلك يُفضّل التعاون مع مستشار استراتيجية علامة.",
          en: "Yes, if they're a strategic designer. Otherwise, collaborate with a brand strategist.",
        },
      },
    ],
  },
  {
    slug: "anatomy-of-a-timeless-logo",
    category: "logo-design",
    title: {
      ar: "تشريح الشعار الخالد: ما الذي يجعل شعارًا يعيش عقودًا",
      en: "Anatomy of a Timeless Logo: What Makes One Last Decades",
    },
    excerpt: {
      ar: "الشعارات الخالدة لا تحدث بالصدفة. هذه سماتها الستّ.",
      en: "Timeless logos don't happen by accident. Here are their six defining traits.",
    },
    author: AUTHOR,
    publishedAt: "2026-05-28",
    readingMinutes: 7,
    keywords: ["logo design", "timeless logo", "شعار", "تصميم شعار"],
    cover: { from: "#12100e", to: "#2b241c", accent: "#c9a26a" },
    content: [
      {
        type: "p",
        text: {
          ar: "شعارات مثل Nike وApple وMercedes لم تصمد لأنّها جميلة، بل لأنّها بُنيت على مبادئ صلبة تتجاوز الأذواق.",
          en: "Logos like Nike, Apple, and Mercedes didn't endure because they're pretty — they were built on solid principles that outlast taste.",
        },
      },
      { type: "h2", id: "simplicity", text: { ar: "البساطة", en: "Simplicity" } },
      {
        type: "p",
        text: {
          ar: "الشعار الجيّد يمكن رسمه من الذاكرة. كلّما زادت العناصر، قلّت الذاكرة.",
          en: "A good logo can be drawn from memory. The more elements, the less memorable.",
        },
      },
      { type: "h2", id: "scalability", text: { ar: "قابلية التوسّع", en: "Scalability" } },
      {
        type: "p",
        text: {
          ar: "من ١٦px في favicon إلى لوحة إعلانيّة على الطريق — يجب أن يعمل الشعار في كلّ المقاسات.",
          en: "From a 16px favicon to a highway billboard — the logo must work at every scale.",
        },
      },
      { type: "h2", id: "meaning", text: { ar: "المعنى", en: "Meaning" } },
      {
        type: "p",
        text: {
          ar: "الشكل يجب أن يحمل فكرة، لا مجرّد جمال. المعنى هو ما يجعل الشعار قابلًا للسرد.",
          en: "The form must carry an idea, not just beauty. Meaning is what makes a logo storyable.",
        },
      },
      { type: "h2", id: "distinct", text: { ar: "التميّز", en: "Distinctiveness" } },
      { type: "p", text: { ar: "إذا استبدلت اسم العلامة تحته باسم منافس، هل يظلّ الشعار منطقيًّا؟ إذا نعم، فهو ليس متميّزًا كفاية.", en: "If you swap the wordmark below with a competitor's name, does the logo still make sense? If yes, it isn't distinctive enough." } },
      { type: "h2", id: "adaptability", text: { ar: "المرونة", en: "Adaptability" } },
      { type: "p", text: { ar: "أبيض وأسود، ملوّن، متحرّك، منقوش، على قماش أو زجاج — يجب أن يبقى الشعار متينًا.", en: "Black and white, colored, animated, engraved, on fabric or glass — the logo must remain robust." } },
      { type: "h2", id: "restraint", text: { ar: "ضبط النفس", en: "Restraint" } },
      { type: "p", text: { ar: "قاوم إغراء إضافة تدرّجات وظلال ومؤثّرات. الشعار الخالد يعتمد على شكله لا على تلبيسه.", en: "Resist the urge to add gradients, shadows, and effects. A timeless logo relies on its form, not its dressing." } },
    ],
    faq: [
      {
        q: { ar: "كم يستغرق تصميم شعار احترافي؟", en: "How long does a professional logo take?" },
        a: { ar: "من ٣ إلى ٦ أسابيع، تشمل البحث والاستكشاف والتنقيح.", en: "3 to 6 weeks, including research, exploration, and refinement." },
      },
    ],
  },
  {
    slug: "building-a-visual-system",
    category: "visual-identity",
    title: {
      ar: "من شعار إلى نظام: كيف تبني هوية بصرية متكاملة",
      en: "From Logo to System: Building a Complete Visual Identity",
    },
    excerpt: {
      ar: "الشعار نقطة البداية. النظام هو ما يُبقي العلامة متماسكة عبر مئات نقاط التواصل.",
      en: "A logo is the starting point. A system is what keeps a brand coherent across hundreds of touchpoints.",
    },
    author: AUTHOR,
    publishedAt: "2026-05-10",
    readingMinutes: 11,
    keywords: ["visual identity", "design system", "brand guidelines", "نظام بصري"],
    cover: { from: "#0e1a1a", to: "#233838", accent: "#a8c5b5" },
    content: [
      { type: "p", text: { ar: "الفارق بين علامة هاوية وأخرى محترفة يظهر عندما تحتاج العلامة إلى الظهور في ٥٠ مكانًا مختلفًا في نفس الأسبوع.", en: "The gap between amateur and professional brands shows the week a brand needs to appear in 50 different places." } },
      { type: "h2", id: "foundation", text: { ar: "الأساسات", en: "Foundations" } },
      { type: "list", items: [
        { ar: "الشعار وتنويعاته", en: "Logo and variations" },
        { ar: "لوحة الألوان الأساسيّة والثانويّة", en: "Primary and secondary color palettes" },
        { ar: "التايبوجرافي الرئيسيّة والداعمة", en: "Primary and supporting typography" },
        { ar: "الشبكة والمساحات", en: "Grid and spacing system" },
      ] },
      { type: "h2", id: "voice", text: { ar: "الصوت البصري", en: "Visual Voice" } },
      { type: "p", text: { ar: "الأنماط، الأيقونات، الصور، والحركة — كلّها يجب أن تنطق بنفس الشخصية.", en: "Patterns, iconography, imagery, and motion — all must speak with the same personality." } },
      { type: "h2", id: "governance", text: { ar: "الحوكمة", en: "Governance" } },
      { type: "p", text: { ar: "دليل الاستخدام لا يكفي؛ العلامات الجيّدة تُوفّر قوالب جاهزة وأدوات لضمان الاتساق.", en: "A usage guide isn't enough; strong brands ship ready-made templates and tools to enforce consistency." } },
    ],
  },
  {
    slug: "designing-decks-that-close-deals",
    category: "presentation-design",
    title: {
      ar: "عروض تقدّميّة تُغلق الصفقات: منهجية عمليّة",
      en: "Decks That Close Deals: A Practical Methodology",
    },
    excerpt: {
      ar: "العرض ليس مستندًا مصمّمًا، بل حجّة مرئيّة. هكذا تُبنى.",
      en: "A deck isn't a decorated document — it's a visual argument. Here's how to build one.",
    },
    author: AUTHOR,
    publishedAt: "2026-04-22",
    readingMinutes: 8,
    keywords: ["presentation design", "pitch deck", "عرض تقديمي"],
    cover: { from: "#161010", to: "#2e1e1e", accent: "#e0a58e" },
    content: [
      { type: "p", text: { ar: "معظم العروض تفشل قبل الشريحة الثالثة. السبب دائمًا نفسه: نقص في الحجّة، لا في التصميم.", en: "Most decks fail before slide three. The reason is always the same: an argument problem, not a design one." } },
      { type: "h2", id: "structure", text: { ar: "البنية أوّلًا", en: "Structure First" } },
      { type: "p", text: { ar: "اكتب سطرًا واحدًا لكلّ شريحة قبل فتح أدوات التصميم. إذا لم يستطع المخطط الإقناع، لن يفعل التصميم.", en: "Write one line per slide before opening design tools. If the outline can't convince, design won't." } },
      { type: "h2", id: "hierarchy", text: { ar: "التسلسل البصري", en: "Visual Hierarchy" } },
      { type: "p", text: { ar: "شريحة واحدة، فكرة واحدة، عنصر بصريّ رئيسي واحد. البقيّة دعم.", en: "One slide, one idea, one primary visual. The rest is supporting." } },
    ],
  },
  {
    slug: "ai-in-brand-design-workflow",
    category: "ai",
    title: {
      ar: "الذكاء الاصطناعي في تصميم الهويات: أدوات وسير عمل",
      en: "AI in Brand Design: Tools and Workflow",
    },
    excerpt: {
      ar: "كيف أستخدم الذكاء الاصطناعي التوليدي لتسريع الاستكشاف دون التنازل عن الجودة الاستراتيجيّة.",
      en: "How I use generative AI to accelerate exploration without compromising strategic quality.",
    },
    author: AUTHOR,
    publishedAt: "2026-04-05",
    readingMinutes: 6,
    keywords: ["AI design", "generative AI", "brand design workflow", "ذكاء اصطناعي تصميم"],
    cover: { from: "#0a0a12", to: "#1c1c2e", accent: "#b39ddb" },
    content: [
      { type: "p", text: { ar: "الذكاء الاصطناعي لا يحلّ محلّ المصمّم الاستراتيجي، لكنه يوسّع مساحة الاستكشاف بشكل هائل.", en: "AI doesn't replace the strategic designer, but it enormously expands the exploration space." } },
      { type: "h2", id: "exploration", text: { ar: "الاستكشاف السريع", en: "Rapid Exploration" } },
      { type: "p", text: { ar: "أدوات مثل Midjourney وFigma AI تسمح بتوليد عشرات الاتجاهات البصريّة في ساعة، بدلًا من يوم.", en: "Tools like Midjourney and Figma AI let you generate dozens of visual directions in an hour instead of a day." } },
      { type: "h2", id: "curation", text: { ar: "الاختيار البشري", en: "Human Curation" } },
      { type: "p", text: { ar: "دور المصمّم يتحوّل من \"إنتاج\" إلى \"انتقاء\" — وهذه مهارة أصعب.", en: "The designer's role shifts from \"producing\" to \"curating\" — a harder skill." } },
    ],
  },
  {
    slug: "case-study-fintech-rebrand",
    category: "case-studies",
    title: {
      ar: "دراسة حالة: إعادة تصميم هوية شركة تقنيّة ماليّة سعوديّة",
      en: "Case Study: Rebranding a Saudi Fintech",
    },
    excerpt: {
      ar: "من هوية عشوائيّة إلى نظام بصريّ يعكس الثقة والابتكار — قصّة مشروع كامل.",
      en: "From a chaotic identity to a visual system reflecting trust and innovation — a full project story.",
    },
    author: AUTHOR,
    publishedAt: "2026-03-18",
    readingMinutes: 10,
    keywords: ["case study", "fintech branding", "rebrand", "دراسة حالة"],
    cover: { from: "#0a1420", to: "#1a2a3e", accent: "#7fb3d5" },
    content: [
      { type: "p", text: { ar: "بدأت الشركة كستارت أب صغير في ٢٠٢٢، وبعد جولة استثماريّة كبيرة في ٢٠٢٥ لم تعد هويتها الأصليّة تعكس مكانتها الجديدة.", en: "The company started as a small startup in 2022, and after a major funding round in 2025 the original identity no longer reflected its new stature." } },
      { type: "h2", id: "challenge", text: { ar: "التحدّي", en: "The Challenge" } },
      { type: "p", text: { ar: "بناء هوية تنقل الثقة المؤسّسية دون فقدان روح الابتكار التي ميّزت العلامة في بداياتها.", en: "Build an identity that conveys institutional trust without losing the innovative spirit that defined the early brand." } },
      { type: "h2", id: "approach", text: { ar: "المقاربة", en: "The Approach" } },
      { type: "p", text: { ar: "بدأنا بأربعة أسابيع من العمل الاستراتيجي، أعقبها استكشاف بصريّ مكثّف، ثم بناء نظام بصريّ كامل خلال ثلاثة أشهر.", en: "We started with four weeks of strategic work, followed by intensive visual exploration, then built a complete system over three months." } },
      { type: "h2", id: "outcome", text: { ar: "النتيجة", en: "The Outcome" } },
      { type: "p", text: { ar: "زيادة ٤٠٪ في معدّل تحويل الزوّار إلى مستخدمين خلال ٦ أشهر من الإطلاق، وتغطية إعلاميّة عبر ٣ دول.", en: "A 40% increase in visitor-to-user conversion within 6 months of launch, and media coverage across 3 countries." } },
    ],
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(cat: CategorySlug): Article[] {
  return ARTICLES.filter((a) => a.category === cat).sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );
}

export function getAllArticlesSorted(): Article[] {
  return [...ARTICLES].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

export function getFeaturedArticle(): Article {
  return ARTICLES.find((a) => a.featured) ?? ARTICLES[0];
}

export function getRelatedArticles(slug: string, limit = 3): Article[] {
  const current = getArticle(slug);
  if (!current) return [];
  const same = ARTICLES.filter((a) => a.slug !== slug && a.category === current.category);
  const others = ARTICLES.filter((a) => a.slug !== slug && a.category !== current.category);
  return [...same, ...others].slice(0, limit);
}

export function getAdjacentArticles(slug: string): { prev?: Article; next?: Article } {
  const sorted = getAllArticlesSorted();
  const i = sorted.findIndex((a) => a.slug === slug);
  if (i === -1) return {};
  return { prev: sorted[i + 1], next: sorted[i - 1] };
}

export function searchArticles(query: string, lang: Lang): Article[] {
  const q = query.trim().toLowerCase();
  if (!q) return getAllArticlesSorted();
  return getAllArticlesSorted().filter((a) => {
    const hay = [
      a.title[lang],
      a.excerpt[lang],
      ...a.keywords,
      a.category,
    ].join(" ").toLowerCase();
    return hay.includes(q);
  });
}

export function formatDate(iso: string, lang: Lang): string {
  try {
    return new Date(iso).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
