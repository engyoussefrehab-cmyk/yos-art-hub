// The same red–yellow–blue wheel used by the studio's accent tool.
const wheelStops = [0, 60, 120, 180, 240, 300, 360];
const screenStops = [0, 30, 60, 120, 220, 280, 360];
export const wrapHue = angle => (angle % 360 + 360) % 360;

export const rules = [
  { id: "analogous", name: "ألوان متجاورة", en: "Analogous", offsets: [0, -30, 30, -60, 60],
    why: "ألوان قريبة من بعضها على العجلة. قربها بيخلّي الانتقال بينها هادي.",
    use: "خلّي لون واحد هو الأساسي، واستخدم الدرجات القريبة في المساحات الثانوية." },
  { id: "monochromatic", name: "لون واحد بدرجاته", en: "Monochromatic", offsets: [0, 0, 0, 0, 0],
    why: "نفس اللون بدرجات فاتحة وغامقة. الاختلاف في الإضاءة بيدي عمق للوحة.",
    use: "استخدم الدرجات الفاتحة في الخلفية والغامقة للعناوين بعد ما تتأكد إن النص واضح." },
  { id: "triadic", name: "تناغم ثلاثي", en: "Triadic", offsets: [0, 120, 240],
    why: "ثلاثة ألوان بفواصل متساوية على العجلة، فكل لون متميز وواضح.",
    use: "خلّي لون واحد أكبر مساحة، ووزّع اللونين التانيين على التفاصيل والعناصر المهمة." },
  { id: "complementary", name: "ألوان متكاملة", en: "Complementary", offsets: [0, 180],
    why: "لونين قصاد بعض على العجلة. المسافة بينهم بتدي تباين لوني قوي.",
    use: "استخدم لونك الأساسي في المساحة الأكبر، واللون المقابل في زر أو تفصيلة عايز تبرزها." },
  { id: "split", name: "تكاملي منقسم", en: "Split complementary", offsets: [0, 150, 210],
    why: "ناخد اللونين على جانبي اللون المقابل. ده بيدي تباين مع مرونة أكتر في التوزيع.",
    use: "خلي واحد من اللونين لون مساعد، واستخدم التاني في تفاصيل صغيرة." },
  { id: "double-split", name: "تكاملي مزدوج منقسم", en: "Double split complementary", offsets: [0, -30, 30, 150, 210],
    why: "درجتين حوالين اللون الأساسي ودرجتين حوالين اللون المقابل، مع اللون الأساسي.",
    use: "اجمع الألوان القريبة في مساحات مشتركة واختار لون إبراز واحد من الناحية المقابلة." },
  { id: "square", name: "تناغم مربّع", en: "Square", offsets: [0, 90, 180, 270],
    why: "أربعة ألوان المسافة بين كل لون واللي بعده ربع العجلة.",
    use: "اختار لون مسيطر ولون مساعد، ووزّع باقي الألوان على تفاصيل صغيرة." },
  { id: "compound", name: "تناغم مركّب", en: "Compound", offsets: [0, 30, 60, 180, 210],
    why: "مجموعة ألوان قريبة من لونك الأساسي ومعاها مجموعة من الناحية المقابلة.",
    use: "استخدم المجموعة القريبة في الخلفيات والعناصر المتكررة، والمجموعة المقابلة للإبراز." },
];

export function normalizeHex(value) {
  const hex = value.trim().replace(/^#/, "");
  if (/^[a-f\d]{3}$/i.test(hex)) return "#" + [...hex.toUpperCase()].map(char => char.repeat(2)).join("");
  return /^[a-f\d]{6}$/i.test(hex) ? "#" + hex.toUpperCase() : null;
}

function interpolate(angle, source, target) {
  const hue = wrapHue(angle);
  const next = source.findIndex(stop => stop > hue);
  const previous = next - 1;
  return target[previous] + (hue - source[previous]) * (target[next] - target[previous]) / (source[next] - source[previous]);
}

export const screenHue = angle => interpolate(angle, wheelStops, screenStops);
const wheelHue = hue => interpolate(hue, screenStops, wheelStops);

export function hexToHsl(hex) {
  const [red, green, blue] = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);
  const min = Math.min(red, green, blue);
  const max = Math.max(red, green, blue);
  const light = (max + min) / 2;
  const delta = max - min;
  if (!delta) return [0, 0, light];
  const segment = max === red ? (green - blue) / delta
    : max === green ? 2 + (blue - red) / delta : 4 + (red - green) / delta;
  return [wrapHue(segment * 60), delta / (1 - Math.abs(2 * light - 1)), light];
}

export function hslToHex(hue, saturation, lightness) {
  const hueStep = wrapHue(hue) / 30;
  const amplitude = saturation * Math.min(lightness, 1 - lightness);
  const channel = shift => {
    const k = (shift + hueStep) % 12;
    const value = lightness - amplitude * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * value).toString(16).padStart(2, "0");
  };
  return ("#" + [0, 8, 4].map(channel).join("")).toUpperCase();
}

export function makePalette(base, rule) {
  const [hue, saturation, lightness] = hexToHsl(base);
  const angle = wheelHue(hue);
  const saturationForHarmony = saturation > .025 ? Math.max(saturation, .32) : .52;
  const lightForHarmony = Math.max(.34, Math.min(lightness, .66));
  const lighter = lightness > .9 ? [lightness * .8, lightness * .62]
    : [lightness + (1 - lightness) * .26, lightness + (1 - lightness) * .53];
  const darker = lightness < .1 ? [lightness + (1 - lightness) * .18, lightness + (1 - lightness) * .32]
    : [lightness * .72, lightness * .44];
  const monochromeLights = [...lighter, ...darker];
  return rule.offsets.map((offset, index) => {
    if (!index) return { hex: base, angle, radius: saturation };
    const nextAngle = wrapHue(angle + offset);
    if (rule.id === "monochromatic") {
      const hex = hslToHex(hue, saturation, monochromeLights[index - 1]);
      return { hex, angle, radius: [.28, .46, .65, .83][index - 1] };
    }
    return { hex: hslToHex(screenHue(nextAngle), saturationForHarmony, lightForHarmony),
      angle: nextAngle, radius: saturationForHarmony };
  });
}

export function contrastRatio(first, second) {
  const luminance = hex => [1, 3, 5].reduce((sum, index, channel) => {
    const value = parseInt(hex.slice(index, index + 2), 16) / 255;
    const linear = value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
    return sum + linear * [.2126, .7152, .0722][channel];
  }, 0);
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
