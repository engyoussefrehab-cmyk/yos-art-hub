import type { Lang } from "./dictionary";

export type BrandingI18n = {
  name: string;
  tagline: string;
  short: string;
  description: string;
  approach: string[];
  value: string;
  country: string;
};

// Slug -> English strings. Brand names in Latin keep their form.
export const brandingEn: Record<string, BrandingI18n> = {
  tarsiyah: {
    name: "Tarsiyah",
    tagline: "AI-powered meeting platform",
    short: "A precise visual identity for a platform that turns meetings into clear decisions.",
    description:
      "Tarsiyah reshapes how teams collaborate by turning conversations into clear, actionable insights, enabling more focused and efficient decisions.",
    approach: [
      "Decision-first, not just meetings",
      "Turn complexity into clarity",
      "A precise, concise identity",
      "Effective, focused collaboration",
    ],
    value: "Cuts through meeting noise and delivers the clarity that drives decisions.",
    country: "Saudi Arabia",
  },
  akkas: {
    name: "AKKAS",
    tagline: "Commercial visual production",
    short: "A bold, high-contrast identity for a commercial visual production brand.",
    description:
      "A visual production brand specialized in advertising content, focused on creating impact-driven work that elevates brand presence.",
    approach: [
      "A clear commercial direction",
      "From idea to visual impact",
      "Bold, high-contrast identity",
      "A confident, premium presence",
    ],
    value: "We turn brand ideas into high-impact visual campaigns.",
    country: "UAE",
  },
  ogg: {
    name: "OGG Alabdaa",
    tagline: "Technology & digital solutions",
    short: "A clean, geometric identity for a forward-looking digital solutions company.",
    description:
      "A forward-thinking tech company specialized in innovative digital solutions that combine function, creativity, and future-ready thinking.",
    approach: [
      "Innovation-driven direction",
      "A future-facing visual language",
      "Clean, geometric identity",
      "A technical, brand-aware mindset",
    ],
    value: "Smart, future-ready digital solutions through innovation and design.",
    country: "Saudi Arabia",
  },
  "inspire-travel": {
    name: "Inspire Travel",
    tagline: "Seamless, inspiring travel experiences",
    short: "A modern, minimal identity for a travel brand that turns the journey into inspiration.",
    description:
      "A dynamic travel brand focused on delivering seamless, inspiring, and memorable travel experiences.",
    approach: [
      "Inspiration, not just transit",
      "Simplicity leads clarity",
      "A memorable, modern identity",
      "Emotion and function combined",
    ],
    value: "Turns travel into a clear, inspiring, and seamless experience.",
    country: "Egypt",
  },
  "umrah-committee": {
    name: "National Umrah & Visit Committee",
    tagline: "Organizing services for the guests of the Sacred House",
    short: "A trusted, official identity for a system regulating Umrah and Visit services.",
    description:
      "Focused on ensuring compliance, consistency, and quality across every service provider, offering a trusted, organized system for Umrah and Visit services.",
    approach: [
      "System-driven operations",
      "Regulation that builds consistency and trust",
      "Clear processes across service stages",
      "A trusted, official identity",
    ],
    value: "Establishes a unified, structured framework for Umrah and Visit services.",
    country: "Saudi Arabia",
  },
  bunmay: {
    name: "BUNMAY",
    tagline: "Refined craftsmanship",
    short: "A luxurious identity balancing classic and contemporary refinement.",
    description:
      "A brand expressing elegance and craftsmanship in every detail, with an identity that carries a premium, precise visual tone.",
    approach: [
      "Contemporary-classic elegance",
      "Precision in detail and typography",
      "A luxurious visual language",
      "A composed, refined presence",
    ],
    value: "A premium identity that reflects value and quality at every touchpoint.",
    country: "UAE",
  },
  qutoof: {
    name: "Qutoof",
    tagline: "Fresh fruits & vegetables",
    short: "A warm, everyday identity for a fresh produce brand.",
    description:
      "A brand offering premium fresh fruits and vegetables with a trusted, enjoyable shopping experience.",
    approach: [
      "Trusted daily freshness",
      "Warm Arabic typography",
      "An everyday, approachable identity",
      "An enjoyable shopping experience",
    ],
    value: "A refined, easy shopping experience for the finest fresh produce.",
    country: "Gulf",
  },
  "hz-academy": {
    name: "HZ Online Academy",
    tagline: "Learning, simplified",
    short: "A modern, youthful identity for an online academy that simplifies learning.",
    description:
      "An online academy simplifying the learning journey with a direct, clear, and enjoyable experience for the learner.",
    approach: [
      "Simplifying the learning journey",
      "Youthful, modern visual language",
      "Clear educational structure",
      "A flexible, scalable identity",
    ],
    value: "A simplified, enjoyable learning experience through a clear platform.",
    country: "Egypt",
  },
};

export function projectI18n(slug: string, lang: Lang, base: {
  name: string; tagline: string; short: string; description: string; approach: string[]; value: string; country: string;
}) {
  if (lang === "ar") return base;
  const en = brandingEn[slug];
  return en ? { ...base, ...en } : base;
}
