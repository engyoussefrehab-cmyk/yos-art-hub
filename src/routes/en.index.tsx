import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

// The English site was removed. Old /en links forward to the Arabic page.
export const Route = createFileRoute("/en/")({
  loader: () => ({ dest: "/" }),
  head: ({ loaderData }) => ({
    meta: [
      { httpEquiv: "refresh", content: `0;url=${loaderData?.dest ?? "/"}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EnRedirect,
});

function EnRedirect() {
  const { dest } = Route.useLoaderData();
  useEffect(() => {
    window.location.replace(dest + window.location.search + window.location.hash);
  }, [dest]);
  return (
    <p style={{ padding: 40, textAlign: "center" }}>
      <a href={dest}>{dest}</a>
    </p>
  );
}
