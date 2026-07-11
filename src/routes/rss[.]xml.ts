import { createFileRoute } from "@tanstack/react-router";
import { getPublishedArticlesFn } from "@/lib/insights.functions";
import { SITE_URL, SITE_NAME_AR } from "@/lib/site";

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function abs(path: string | null | undefined): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function toRFC822(iso: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toUTCString();
}

async function buildRss(lang: "ar" | "en"): Promise<string> {
  const articles = await getPublishedArticlesFn();
  const isAr = lang === "ar";
  const feedUrl = `${SITE_URL}${isAr ? "/rss.xml" : "/en/rss.xml"}`;
  const homeUrl = `${SITE_URL}${isAr ? "/insights" : "/en/insights"}`;
  const title = isAr ? `${SITE_NAME_AR} — رؤى ومقالات` : "Youssef Rehab — Insights";
  const description = isAr
    ? "أحدث المقالات في استراتيجية العلامة، الهوية البصرية، تصميم الشعارات والعروض."
    : "Latest articles on brand strategy, visual identity, logo & presentation design.";

  const items = articles
    .filter((a) => a.published_at && new Date(a.published_at) <= new Date())
    .slice(0, 50)
    .map((a) => {
      const path = `${isAr ? "/insights" : "/en/insights"}/${a.category.slug}/${a.slug}`;
      const itemTitle = isAr ? a.title_ar : a.title_en || a.title_ar;
      const itemDesc = isAr ? a.excerpt_ar : a.excerpt_en || a.excerpt_ar;
      const cat = isAr ? a.category.label_ar : a.category.label_en;
      const cover = a.cover_url ? abs(a.cover_url) : null;
      return `    <item>
      <title>${xmlEscape(itemTitle)}</title>
      <link>${abs(path)}</link>
      <guid isPermaLink="true">${abs(path)}</guid>
      <pubDate>${toRFC822(a.published_at)}</pubDate>
      <category>${xmlEscape(cat)}</category>
      <dc:creator>${xmlEscape(a.author_name)}</dc:creator>
      <description>${xmlEscape(itemDesc)}</description>${cover ? `
      <enclosure url="${cover}" type="image/jpeg" length="0" />
      <media:content url="${cover}" medium="image" />` : ""}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${xmlEscape(title)}</title>
    <link>${homeUrl}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <description>${xmlEscape(description)}</description>
    <language>${isAr ? "ar" : "en"}</language>
    <lastBuildDate>${toRFC822(articles[0]?.updated_at ?? null)}</lastBuildDate>
    <ttl>60</ttl>
${items}
  </channel>
</rss>`;
}

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        const xml = await buildRss("ar");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=600",
          },
        });
      },
    },
  },
});
