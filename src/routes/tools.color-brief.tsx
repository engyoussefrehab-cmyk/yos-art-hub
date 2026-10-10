import { createFileRoute } from "@tanstack/react-router";
import { ColorBriefEmbed } from "@/components/tools/ColorBriefEmbed";

export const Route = createFileRoute("/tools/color-brief")({
  head: () => ({
    meta: [
      { title: "لون البريف — أداة اختيار الألوان للمصممين | يوسف رحاب" },
      { name: "description", content: "أداة تساعد المصممين على استكشاف اتجاهات لونية مبدئية من البريف ومراجعة تناغم الألوان والتباين." },
    ],
  }),
  component: ColorBriefEmbed,
});
