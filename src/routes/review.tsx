import { createFileRoute } from "@tanstack/react-router";
import { ReviewView } from "@/views/ReviewView";

// Shared privately with clients (not in the menu or sitemap).
export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "قيّم تجربتك | يوسف رحاب" },
      { name: "description", content: "شاركني رأيك في العمل معي، وسيظهر تقييمك في آراء العملاء." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/review" }],
  }),
  component: ReviewView,
});
