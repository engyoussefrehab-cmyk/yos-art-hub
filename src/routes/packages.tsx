import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

// Keep bookmarked package URLs pointing to the studio overview.
const DEST = "/#studio";

export const Route = createFileRoute("/packages")({
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
        <a href={DEST}>الاستوديو</a>
      </p>
    );
  },
});
