import { createFileRoute } from "@tanstack/react-router";
import { QuoteRequestView } from "@/views/QuoteRequestView";

export const Route = createFileRoute("/quote-request")({
  head: () => ({
    meta: [
      { title: "طلب تسعير لخدمات التصميم | يوسف رحاب" },
      { name: "description", content: "اختار خدمات التصميم اللي محتاجها، ونزّل طلب التسعير PDF وابعته على واتساب للاستوديو." },
    ],
    links: [{ rel: "canonical", href: "/quote-request/" }],
  }),
  component: QuoteRequestView,
});
