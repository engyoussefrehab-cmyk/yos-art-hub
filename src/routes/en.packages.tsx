import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

// The packages page was removed: starting prices now live on the home page.
// Old links (bookmarks, Google, WhatsApp) forward to the services section.
const DEST = "/en#services";

export const Route = createFileRoute("/en/packages")({
  head: () => ({
    meta: [
      { httpEquiv: "refresh", content: `0;url=${DEST}` },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: DEST.split("#")[0] || "/" }],
  }),
  component: () => {
    useEffect(() => {
      window.location.replace(DEST);
    }, []);
    return (
      <p style={{ padding: 40, textAlign: "center" }}>
        <a href={DEST}>{DEST}</a>
      </p>
    );
  },
});
