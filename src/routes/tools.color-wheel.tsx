import { createFileRoute } from "@tanstack/react-router";
import { ColorWheelEmbed } from "@/components/tools/ColorWheelEmbed";

export const Route = createFileRoute("/tools/color-wheel")({
  head: () => ({
    meta: [
      { title: "عجلة الألوان — ٨ قواعد لتناغم الألوان | يوسف رحاب" },
      { name: "description", content: "اكتب كود HEX أو اختار لون من العجلة، وجرّب ٨ قواعد عشان تكوّن لوحة وتعرف تستخدم ألوانها مع بعض." },
    ],
    links: [{ rel: "canonical", href: "/tools/color-wheel/" }],
  }),
  component: ColorWheelEmbed,
});
