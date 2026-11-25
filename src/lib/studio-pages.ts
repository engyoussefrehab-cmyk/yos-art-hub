const STUDIO_PATHS = new Set(["/", "/projects", "/projects/"]);
const PROJECT_DETAIL_PATH = /^\/projects\/[^/]+\/[^/]+\/?$/;

export function studioSurface(pathname: string): "custom" | "light" | "dark" {
  if (STUDIO_PATHS.has(pathname) || PROJECT_DETAIL_PATH.test(pathname)) return "custom";
  if (/^\/projects\/[^/]+\/?$/.test(pathname) || /^\/(tools|contact)\/?$/.test(pathname)) return "light";
  return "dark";
}

export function isStandalonePath(pathname: string): boolean {
  const section = pathname.split("/")[1];
  return ["admin", "go", "en", "packages", "rss.xml", "sitemap.xml"].includes(section);
}

export const STUDIO_FONTS = {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap",
};

// Thmanyah Serif Display (headings), self-hosted; preloaded so headings don't swap late.
export const STUDIO_FONT_PRELOAD = [
  { rel: "preload", as: "font", type: "font/woff2", crossOrigin: "anonymous", href: "/fonts/thmanyah-serif-display-bold.woff2" },
  { rel: "preload", as: "font", type: "font/woff2", crossOrigin: "anonymous", href: "/fonts/thmanyah-serif-display-medium.woff2" },
] as const;
