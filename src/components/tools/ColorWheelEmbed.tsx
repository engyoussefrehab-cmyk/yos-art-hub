import { ToolEmbed } from "@/components/tools/ToolEmbed";

const COLOR_WHEEL_SRC = "/tools/color-harmony.html?v=4";

export function ColorWheelEmbed() {
  return <ToolEmbed src={COLOR_WHEEL_SRC} titleAr="عجلة الألوان" titleEn="Color Wheel" />;
}
