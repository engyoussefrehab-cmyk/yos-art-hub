import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import contact from "@/content/contact.json";
const DESTINATIONS: Record<string, string> = {
  wa: contact.whatsapp_url,
  whatsapp: contact.whatsapp_url,
  li: contact.linkedin_url,
  linkedin: contact.linkedin_url,
};

// Static short links (/go/wa, /go/li …): a tiny page that forwards the visitor.
export const Route = createFileRoute("/en/go/$")({
  loader: ({ params }) => ({ dest: DESTINATIONS[(params._splat ?? "").toLowerCase()] ?? "/" }),
  head: ({ loaderData }) => ({
    meta: [
      { httpEquiv: "refresh", content: `0;url=${loaderData?.dest ?? "/"}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GoRedirect,
});

function GoRedirect() {
  const { dest } = Route.useLoaderData();
  useEffect(() => {
    window.location.replace(dest);
  }, [dest]);
  return (
    <p style={{ padding: 40, textAlign: "center" }}>
      <a href={dest}>{dest}</a>
    </p>
  );
}
