// Canonical site URL used by SEO/schema/RSS.
export const SITE_URL = "https://yrstudio.art";
export const SITE_NAME_AR = "يوسف رحاب — YR Studio";
export const SITE_NAME_EN = "Youssef Rehab — YR Studio";
export const TWITTER_HANDLE = "@yrstudio";

/** Build an absolute URL from a path like `/insights/foo`. */
export function absUrl(path: string): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Contact form delivery (Web3Forms — free, sends every message to your email).
 * Get a key at https://web3forms.com by entering your email, then paste it here.
 */
export const WEB3FORMS_ACCESS_KEY = "5b2a3b0a-0f52-48bc-80db-bbeeeb5bff27";

/**
 * Absolute JPEG URL for social-share previews (WhatsApp, LinkedIn, X…).
 * Site images are WebP; scripts/optimize-images.py writes a JPEG twin of each
 * one under /media/share/.
 */
export function shareImage(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const m = url.match(/^\/media\/(.+)\.webp$/);
  return absUrl(m ? `/media/share/${m[1]}.jpg` : url);
}

/**
 * YR Studio OS (Supabase) — the project brief form saves each submission as a
 * lead there. Both values are public by design: the anon key can only call
 * submit_inquiry() and list service names (Row Level Security blocks the rest).
 */
export const OS_SUPABASE_URL = "https://vbkgiaxsytaajexmoqmj.supabase.co";
export const OS_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZia2dpYXhzeXRhYWpleG1vcW1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNDkwMTYsImV4cCI6MjEwOTYyNTAxNn0.w9KvuTfpqx-NZ6l6FG4LCB_5KKRK3KVG4BTF-KVBvQk";
