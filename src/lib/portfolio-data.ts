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

export { portrait };

export type BrandingProject = {
  slug: string;
  name: string;
  tagline: string;
  short: string;
  description: string;
  approach: string[];
  value: string;
  country: string;
  year: string;
  cover: string;
  mockup: string;
};

export const brandingProjects: BrandingProject[] = [
  {
    slug: "tarsiyah",
    name: "ترسية",
    tagline: "منصة اجتماعات مدعومة بالذكاء الاصطناعي",
    short: "هوية بصرية دقيقة لمنصة تحوّل الاجتماعات إلى قرارات واضحة.",
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
    slug: "akkas",
    name: "عكّاس",
    tagline: "إنتاج بصري تجاري",
    short: "هوية جريئة عالية التباين لعلامة إنتاج بصري إعلاني.",
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
    slug: "ogg",
    name: "OGG الأبدع",
    tagline: "تقنية وحلول رقمية",
    short: "هوية هندسية نظيفة لشركة حلول رقمية مستقبلية.",
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
    slug: "inspire-travel",
    name: "Inspire Travel",
    tagline: "تجارب سفر سلسة وملهمة",
    short: "هوية عصرية بسيطة لعلامة سفر تحوّل الرحلة إلى إلهام.",
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
    slug: "umrah-committee",
    name: "اللجنة الوطنية للعمرة والزيارة",
    tagline: "تنظيم خدمات ضيوف الرحمن بثقة",
    short: "هوية رسمية موثوقة لمنظومة تنظيم خدمات العمرة والزيارة.",
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
    slug: "bunmay",
    name: "BUNMAY",
    tagline: "صياغة راقية",
    short: "هوية فاخرة كلاسيكية معاصرة تحمل طابع الأناقة والدقّة.",
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
    slug: "qutoof",
    name: "قطوف",
    tagline: "خضار وفواكه طازجة",
    short: "هوية دافئة قريبة من الحياة اليومية لعلامة منتجات طازجة.",
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
    slug: "hz-academy",
    name: "HZ Online Academy",
    tagline: "التعلّم ببساطة",
    short: "هوية شبابية عصرية لأكاديمية إلكترونية تُبسّط التعلّم.",
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

export const logoBoards = [p22, p23, p24, p25];
export const profileBoards = [p27, p28, p29, p30, p31, p32];
export const socialBoards = [p34, p35, p36, p37, p38, p39, p40];

export const categories = [
  {
    slug: "branding",
    label: "الهوية البصرية",
    count: brandingProjects.length,
    desc: "هويات بصرية استراتيجية متكاملة تعكس شخصية العلامة.",
    cover: p5,
  },
  {
    slug: "logos",
    label: "الشعارات",
    count: 40,
    desc: "شعارات دقيقة، خالدة، تحمل معنى وتترك أثرًا.",
    cover: p22,
  },
  {
    slug: "profiles",
    label: "ملفات الشركات",
    count: profileBoards.length,
    desc: "بروفايلات مقنعة تحوّل المعلومة إلى تأثير.",
    cover: p27,
  },
  {
    slug: "social",
    label: "سوشيال ميديا",
    count: socialBoards.length,
    desc: "منشورات إبداعية ترفع علامتك وتثير التفاعل.",
    cover: p34,
  },
];
