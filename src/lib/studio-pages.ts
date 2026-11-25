// Pages already moved to the studio design (ivory, own header and footer).
// The rest of the site keeps the old dark layout until it is redone.
const STUDIO_PATHS = new Set(["/", "/projects", "/projects/"]);

export const isStudioPath = (pathname: string) => STUDIO_PATHS.has(pathname);

export const STUDIO_FONTS = {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap",
};

// Thmanyah Serif Display (headings), self-hosted; preloaded so headings don't swap late.
export const STUDIO_FONT_PRELOAD = [
  { rel: "preload", as: "font", type: "font/woff2", crossOrigin: "anonymous", href: "/fonts/thmanyah-serif-display-bold.woff2" },
  { rel: "preload", as: "font", type: "font/woff2", crossOrigin: "anonymous", href: "/fonts/thmanyah-serif-display-medium.woff2" },
] as const;
