import { createFileRoute } from "@tanstack/react-router";
import { getPublishedArticlesFn } from "@/lib/insights.functions";
import { SITE_URL } from "@/lib/site";

function xmlEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function abs(p: string | null | undefined): string {
  if (!p) return SITE_URL;
  return /^https?:\/\//i.test(p) ? p : `${SITE_URL}${p.startsWith("/") ? p : `/${p}`}`;
}
function toRFC822(iso: string | null): string { return (iso ? new Date(iso) : new Date()).toUTCString(); }

async function buildRss(): Promise<string> {
  const articles = await getPublishedArticlesFn();
  const feedUrl = `${SITE_URL}/en/rss.xml`;
  const homeUrl = `${SITE_URL}/en/insights`;
  const items = articles
    .filter((a) => a.published_at && new Date(a.published_at) <= new Date())
    .slice(0, 50)
    .map((a) => {
      const path = `/en/insights/${a.category.slug}/${a.slug}`;
      const title = a.title_en || a.title_ar;
      const desc = a.excerpt_en || a.excerpt_ar;
      const cover = a.cover_url ? abs(a.cover_url) : null;
      return `    <item>
      <title>${xmlEscape(title)}</title>
      <link>${abs(path)}</link>
      <guid isPermaLink="true">${abs(path)}</guid>
      <pubDate>${toRFC822(a.published_at)}</pubDate>
      <category>${xmlEscape(a.category.label_en)}</category>
      <dc:creator>${xmlEscape(a.author_name)}</dc:creator>
      <description>${xmlEscape(desc)}</description>${cover ? `
      <enclosure url="${cover}" type="image/jpeg" length="0" />
      <media:content url="${cover}" medium="image" />` : ""}
    </item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Youssef Rehab — Insights</title>
    <link>${homeUrl}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <description>Latest articles on brand strategy, visual identity, logo &amp; presentation design.</description>
    <language>en</language>
    <lastBuildDate>${toRFC822(articles[0]?.updated_at ?? null)}</lastBuildDate>
    <ttl>60</ttl>
${items}
  </channel>
</rss>`;
}

export const Route = createFileRoute("/en/rss.xml")({
  server: {
    handlers: {
      GET: async () => new Response(await buildRss(), {
        headers: {
          "Content-Type": "application/rss+xml; charset=utf-8",
          "Cache-Control": "public, max-age=300, s-maxage=600",
        },
      }),
    },
  },
});
