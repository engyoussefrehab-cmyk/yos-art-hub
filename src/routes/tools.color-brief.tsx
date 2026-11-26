import { createFileRoute } from "@tanstack/react-router";
import { ColorBriefEmbed } from "@/components/tools/ColorBriefEmbed";

export const Route = createFileRoute("/tools/color-brief")({
  head: () => ({
    meta: [
      { title: "أداة اختيار الألوان للهوية البصرية | يوسف رحاب" },
      { name: "description", content: "ولّد خمس لوحات من بريف الهوية وقارنها على تصميمات وراجع تباين ألوانها في الوضع الفاتح والداكن." },
    ],
  }),
  component: ColorBriefEmbed,
});
