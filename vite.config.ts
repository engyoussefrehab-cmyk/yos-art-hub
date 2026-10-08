// Static build: every page is prerendered to plain HTML for GitHub Pages.
// Content comes from src/data/snapshot/*.json (see src/lib/static-db).
import { defineConfig } from "vite";
import path from "node:path";
import fs from "node:fs";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

const snap = (name: string): any[] =>
  JSON.parse(fs.readFileSync(path.resolve(__dirname, `src/data/snapshot/${name}.json`), "utf8"));

// Every dynamic page, so nothing depends on link crawling alone.
function staticPages() {
  const pages = new Set<string>(["/", "/en", "/404", "/rss.xml", "/en/rss.xml", "/sitemap.xml"]);
  for (const p of snap("portfolio_projects")) {
    if (p.status !== "published" || !p.category_slug) continue;
    pages.add(`/projects/${p.category_slug}/${p.slug}`);
    pages.add(`/en/projects/${p.category_slug}/${p.slug}`);
  }
  for (const c of snap("project_categories")) {
    pages.add(`/projects/${c.slug}`);
    pages.add(`/en/projects/${c.slug}`);
  }
  for (const k of ["wa", "whatsapp", "li", "linkedin"]) pages.add(`/go/${k}`);
  return [...pages].map((p) => ({ path: p }));
}

export default defineConfig({
  resolve: {
    alias: {
      "@supabase/supabase-js": path.resolve(__dirname, "src/lib/static-db/supabase-shim.ts"),
    },
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      pages: staticPages(),
      prerender: {
        enabled: true,
        crawlLinks: true,
        autoSubfolderIndex: true,
        failOnError: true,
        // the 404 page's language-switch link points at /en/404, which isn't a real page
        filter: (page) => page.path !== "/en/404",
      },
    }),
    viteReact(),
    tailwindcss(),
  ],
});
