/**
 * Business sectors: groups the many free-text "industry" values on projects
 * into a short list a client recognises ("my company is in construction").
 * Order matters: the first sector whose keyword matches wins.
 */
export type SectorKey =
  | "construction"
  | "realestate"
  | "food"
  | "health"
  | "education"
  | "legal"
  | "travel"
  | "beauty"
  | "trade"
  | "tech"
  | "other";

export const SECTORS: { key: SectorKey; ar: string; en: string; keywords: string[] }[] = [
  {
    key: "realestate",
    ar: "العقارات",
    en: "Real estate",
    keywords: ["عقار", "real estate", "property"],
  },
  {
    key: "construction",
    ar: "المقاولات والهندسة",
    en: "Construction & engineering",
    keywords: [
      "مقاول",
      "إنشاء",
      "انشاء",
      "هندس",
      "قياسات",
      "صيانة",
      "التصميم الداخلي",
      "تشطيب",
      "interior",
      "landscape",
      "construction",
      "engineering",
    ],
  },
  {
    key: "health",
    ar: "الطب والصحة",
    en: "Health & medical",
    keywords: [
      "طب",
      "صحة",
      "صحي",
      "صيدل",
      "نفسي",
      "كبار السن",
      "ذوي الإعاقة",
      "جلدية",
      "أسنان",
      "health",
      "medical",
      "nutrition",
      "pharma",
    ],
  },
  {
    key: "food",
    ar: "المطاعم والأغذية",
    en: "Food & restaurants",
    keywords: [
      "مطعم",
      "مطاعم",
      "مأكولات",
      "أغذية",
      "اغذية",
      "مخبوز",
      "حلويات",
      "لحوم",
      "خضار",
      "فواكه",
      "تموين",
      "قهوة",
      "food",
      "restaurant",
      "butcher",
      "meat",
      "kitchen",
      "cafe",
      "coffee",
    ],
  },
  {
    key: "education",
    ar: "التعليم والتدريب",
    en: "Education & training",
    keywords: ["تعليم", "تدريب", "التعلم", "education", "training", "learning", "school"],
  },
  {
    key: "legal",
    ar: "المحاماة والمحاسبة والاستشارات",
    en: "Law, accounting & consulting",
    keywords: [
      "محاما",
      "قانون",
      "محاسب",
      "استشار",
      "خدمات الأعمال",
      "law",
      "legal",
      "accounting",
      "consult",
    ],
  },
  {
    key: "travel",
    ar: "السياحة والضيافة",
    en: "Travel & hospitality",
    keywords: [
      "سياح",
      "سفر",
      "فندق",
      "فنادق",
      "ضيافة",
      "ضيوف الرحمن",
      "طيران",
      "بواخر",
      "رحلات",
      "travel",
      "hotel",
      "hospitality",
      "tourism",
      "aviation",
    ],
  },
  {
    key: "beauty",
    ar: "التجميل والعطور والمجوهرات",
    en: "Beauty, perfume & jewelry",
    keywords: [
      "تجميل",
      "عطر",
      "عطور",
      "مجوهرات",
      "المعادن الثمينة",
      "صياغة",
      "beauty",
      "cosmetic",
      "fragrance",
      "perfume",
      "jewel",
    ],
  },
  {
    key: "tech",
    ar: "التقنية والتسويق",
    en: "Tech & marketing",
    keywords: [
      "تقني",
      "رقمي",
      "إلكترون",
      "الكترون",
      "صوتيات",
      "تطبيق",
      "تسويق",
      "إنتاج بصري",
      "tech",
      "digital",
      "app",
      "software",
      "marketing",
      "advertising",
    ],
  },
  {
    key: "trade",
    ar: "التجارة والصناعة والنقل",
    en: "Trade, industry & logistics",
    keywords: [
      "تجار",
      "توزيع",
      "استيراد",
      "صناع",
      "موانئ",
      "حديد",
      "نقل",
      "لوجست",
      "سيارات",
      "ألعاب",
      "trade",
      "import",
      "logistic",
      "industr",
      "retail",
    ],
  },
];

export const OTHER_SECTOR = { key: "other" as const, ar: "مجالات أخرى", en: "Other" };

export function sectorOf(industry: string | null | undefined): SectorKey {
  const s = (industry ?? "").toLowerCase();
  if (!s) return "other";
  for (const sec of SECTORS)
    if (sec.keywords.some((k) => s.includes(k.toLowerCase()))) return sec.key;
  return "other";
}

export function sectorLabel(key: string, lang: "ar" | "en") {
  const sec = SECTORS.find((x) => x.key === key) ?? (key === "other" ? OTHER_SECTOR : null);
  return sec ? sec[lang] : key;
}
