import { createFileRoute } from "@tanstack/react-router";

const DESTINATIONS: Record<string, string> = {
  wa: "https://wa.me/201030365405",
  whatsapp: "https://wa.me/201030365405",
  li: "https://www.linkedin.com/in/youssef-rehab/",
  linkedin: "https://www.linkedin.com/in/youssef-rehab/",
};

export const Route = createFileRoute("/go/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = (params._splat ?? "").toLowerCase();
        const dest = DESTINATIONS[key];
        if (!dest) return new Response("Not found", { status: 404 });
        return new Response(null, { status: 302, headers: { Location: dest, "Cache-Control": "no-store" } });
      },
    },
  },
});
