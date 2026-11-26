import { createFileRoute } from "@tanstack/react-router";
import { ToolEmbed } from "@/components/tools/ToolEmbed";

export const Route = createFileRoute("/tools/color-balance")({
  head: () => ({
    meta: [
      { title: "ميزان اللون — اقتراح لون إبراز وقياس التباين | يوسف رحاب" },
      { name: "description", content: "اختار لون إبراز لخلفيتك، قارن نسب التباين وفق WCAG 2.2 وشوف الألوان على بوستر." },
    ],
    links: [{ rel: "canonical", href: "/tools/color-balance/" }],
  }),
  component: ColorBalancePage,
});

function ColorBalancePage() {
  return <ToolEmbed src="/tools/color-wheel-app.html?v=balance-1" titleAr="ميزان اللون" titleEn="Color Balance" />;
}
