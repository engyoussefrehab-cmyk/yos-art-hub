import { ToolEmbed } from "@/components/tools/ToolEmbed";

const COLOR_TOOL_SRC = "/tools/lon-elbrief.html?v=studio-2";

export function ColorBriefEmbed() {
  return <ToolEmbed src={COLOR_TOOL_SRC} titleAr="أداة اختيار الألوان" titleEn="Color Palette Studio" />;
}
