import { createFileRoute } from "@tanstack/react-router";
import { ColorBriefEmbed } from "@/components/tools/ColorBriefEmbed";

export const Route = createFileRoute("/tools/color-brief")({
  head: () => ({
    meta: [
      { title: "مختبر الألوان — اختيار ألوان الهوية البصرية | يوسف رحاب" },
      { name: "description", content: "استكشف اتجاهات لونية مبدئية للهوية البصرية وراجع تناغم الألوان والتباين." },
    ],
  }),
  component: ColorBriefEmbed,
});
