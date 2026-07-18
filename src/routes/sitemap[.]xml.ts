import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";

type Entry = {
  path: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: string;
  hasAlt?: boolean; // ar<->en pair
};

// Static public routes. Arabic paths are canonical; each maps to an /en/ twin.
const ARABIC: Entry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0", hasAlt: true },
  { path: "/projects", changefreq: "weekly", priority: "0.9", hasAlt: true },
  { path: "/projects/branding", changefreq: "weekly", priority: "0.8", hasAlt: false },
  { path: "/projects/logos", changefreq: "weekly", priority: "0.8", hasAlt: false },
  { path: "/projects/profiles", changefreq: "weekly", priority: "0.8", hasAlt: false },
  { path: "/projects/social", changefreq: "weekly", priority: "0.8", hasAlt: false },
  { path: "/packages", changefreq: "monthly", priority: "0.8", hasAlt: true },
  { path: "/contact", changefreq: "monthly", priority: "0.7", hasAlt: true },
  { path: "/insights", changefreq: "weekly", priority: "0.9", hasAlt: true },
  { path: "/insights/brand-strategy", changefreq: "weekly", priority: "0.7", hasAlt: true },
  { path: "/insights/visual-identity", changefreq: "weekly", priority: "0.7", hasAlt: true },
  { path: "/insights/logo-design", changefreq: "weekly", priority: "0.7", hasAlt: true },
  { path: "/insights/presentation-design", changefreq: "weekly", priority: "0.7", hasAlt: true },
  { path: "/insights/business", changefreq: "weekly", priority: "0.7", hasAlt: true },
  { path: "/insights/marketing", changefreq: "weekly", priority: "0.7", hasAlt: true },
  { path: "/insights/ai", changefreq: "weekly", priority: "0.7", hasAlt: true },
  { path: "/insights/case-studies", changefreq: "weekly", priority: "0.7", hasAlt: true },
  { path: "/insights/resources", changefreq: "weekly", priority: "0.7", hasAlt: true },
];

function toEn(arPath: string): string {
  if (arPath === "/") return "/en";
  return `/en${arPath}`;
}

function buildXml(lastmod: string): string {
  const urls: string[] = [];

  for (const e of ARABIC) {
    const arLoc = `${SITE_URL}${e.path}`;
    const enLoc = `${SITE_URL}${toEn(e.path)}`;
    const altsAr = e.hasAlt
      ? [
          `      <xhtml:link rel="alternate" hreflang="ar" href="${arLoc}" />`,
          `      <xhtml:link rel="alternate" hreflang="en" href="${enLoc}" />`,
          `      <xhtml:link rel="alternate" hreflang="x-default" href="${arLoc}" />`,
        ].join("\n")
      : "";
    urls.push(
      [
        `  <url>`,
        `    <loc>${arLoc}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${e.changefreq}</changefreq>`,
        `    <priority>${e.priority}</priority>`,
        altsAr,
        `  </url>`,
      ]
        .filter(Boolean)
        .join("\n"),
    );

    if (e.hasAlt) {
      urls.push(
        [
          `  <url>`,
          `    <loc>${enLoc}</loc>`,
          `    <lastmod>${lastmod}</lastmod>`,
          `    <changefreq>${e.changefreq}</changefreq>`,
          `    <priority>${e.priority}</priority>`,
          `      <xhtml:link rel="alternate" hreflang="ar" href="${arLoc}" />`,
          `      <xhtml:link rel="alternate" hreflang="en" href="${enLoc}" />`,
          `      <xhtml:link rel="alternate" hreflang="x-default" href="${arLoc}" />`,
          `  </url>`,
        ].join("\n"),
      );
    }
  }

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const lastmod = new Date().toISOString().slice(0, 10);
        const xml = buildXml(lastmod);
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});
