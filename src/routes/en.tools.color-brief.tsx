import { createFileRoute } from "@tanstack/react-router";
import { ColorBriefEmbed } from "@/components/tools/ColorBriefEmbed";

export const Route = createFileRoute("/en/tools/color-brief")({
  head: () => ({
    meta: [
      { title: "Color Brief — A Palette Tool for Designers | Youssef Rehab" },
      { name: "description", content: "Explore early color directions from a design brief, including color harmony and contrast checks." },
    ],
  }),
  component: ColorBriefEmbed,
});
