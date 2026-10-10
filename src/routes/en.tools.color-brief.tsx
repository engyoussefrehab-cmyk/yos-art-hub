import { createFileRoute } from "@tanstack/react-router";
import { ColorBriefEmbed } from "@/components/tools/ColorBriefEmbed";

export const Route = createFileRoute("/en/tools/color-brief")({
  head: () => ({
    meta: [
      { title: "Color Palette Studio — Brand Color Tool | Youssef Rehab" },
      { name: "description", content: "Explore early color directions for a visual identity, including color harmony and contrast checks." },
    ],
  }),
  component: ColorBriefEmbed,
});
