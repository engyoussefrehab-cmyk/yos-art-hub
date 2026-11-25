// Pages already moved to the studio design (ivory, own header and footer).
// The rest of the site keeps the old dark layout until it is redone.
const STUDIO_PATHS = new Set(["/", "/projects", "/projects/"]);

export const isStudioPath = (pathname: string) => STUDIO_PATHS.has(pathname);

export const STUDIO_FONTS = {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Markazi+Text:wght@400;500;700&display=swap",
};
