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
