import { ToolEmbed } from "@/components/tools/ToolEmbed";

const COLOR_WHEEL_SRC = "/tools/color-wheel.html?v=20261108b";

export function ColorWheelEmbed() {
  return <ToolEmbed src={COLOR_WHEEL_SRC} titleAr="عجلة الألوان" titleEn="Color Wheel" />;
}
