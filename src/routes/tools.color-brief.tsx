import { createFileRoute } from "@tanstack/react-router";
import { ColorBriefEmbed } from "@/components/tools/ColorBriefEmbed";

export const Route = createFileRoute("/tools/color-brief")({
  head: () => ({
    meta: [
      { title: "أداة اختيار الألوان للهوية البصرية | يوسف رحاب" },
      { name: "description", content: "جرب مجموعات ألوان مبدئية لهويتك البصرية وتأكد من تناسق الألوان ووضوحها." },
    ],
  }),
  component: ColorBriefEmbed,
});
