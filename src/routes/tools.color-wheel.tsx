import { createFileRoute } from "@tanstack/react-router";
import { ColorWheelEmbed } from "@/components/tools/ColorWheelEmbed";

export const Route = createFileRoute("/tools/color-wheel")({
  head: () => ({
    meta: [
      { title: "عجلة الألوان — اختار اللون اللي يشد العين | يوسف رحاب" },
      { name: "description", content: "اختار لون الخلفية ومجال مشروعك، وخُد اللون اللي هيشد العين مع سبب اختياره واختبارات عمى الألوان ووضوح اللون." },
    ],
  }),
  component: ColorWheelEmbed,
});
