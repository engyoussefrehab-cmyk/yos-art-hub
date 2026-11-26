import { contrastRatio, hslToHex, makePalette, normalizeHex, rules, screenHue, wrapHue } from "./color-harmony.mjs";

const get = id => document.getElementById(id);
const wheel = get("wheel");
const hexField = get("base-hex");
const picker = get("picker");
const ruleButtons = get("rules");
const swatches = get("swatches");
let base = picker.value.toUpperCase();
let active = rules[0];
let palette = [];

const stops = Array.from({ length: 25 }, (_, index) => {
  const angle = index * 15;
  return hslToHex(screenHue(angle), 1, .5) + " " + angle + "deg";
});
wheel.style.setProperty("--wheel", "conic-gradient(" + stops.join(", ") + ")");
ruleButtons.innerHTML = rules.map(rule => `<button class="rule" type="button" data-rule="${rule.id}" aria-pressed="false"><span>${rule.name}</span><small lang="en" dir="ltr">${rule.en}</small></button>`).join("");

function render() {
  palette = makePalette(base, active);
  for (const button of ruleButtons.querySelectorAll("button")) {
    button.setAttribute("aria-pressed", String(button.dataset.rule === active.id));
  }
  get("rule-name").textContent = active.name;
  get("rule-why").textContent = active.why;
  get("rule-use").textContent = active.use;
  get("copy-status").textContent = "";

  const markers = palette.map(({ angle, radius, hex }) => {
    const radians = angle * Math.PI / 180;
    return {
      x: 50 + Math.sin(radians) * 45 * radius,
      y: 50 - Math.cos(radians) * 45 * radius,
      hex,
    };
  });
  const trace = markers.map(({ x, y }) => x.toFixed(2) + "," + y.toFixed(2)).join(" ");
  get("markers").innerHTML =
    `<polyline points="${trace}" fill="none" stroke="#3b1a1e" stroke-opacity=".64" stroke-width="1.1" />` +
    markers.map(({ x, y, hex }, index) =>
      `<circle cx="${x}" cy="${y}" r="${index ? 3 : 4}" fill="${hex}" stroke="#391b21" stroke-width="1.1"/><circle cx="${x}" cy="${y}" r="${index ? 3.6 : 4.6}" fill="none" stroke="#fff" stroke-width="1"/>`).join("");

  swatches.innerHTML = palette.map(({ hex }, index) => {
    const ink = contrastRatio(hex, "#FFFFFF") >= contrastRatio(hex, "#171015") ? "#FFFFFF" : "#171015";
    return `<button class="swatch" type="button" data-hex="${hex}" aria-label="انسخ ${hex}" style="--swatch:${hex};--swatch-text:${ink}">${index ? "" : "<span>اللون الأساسي</span>"}<bdi>${hex}</bdi></button>`;
  }).join("");
  const partner = palette.at(-1).hex;
  const roles = [
    ["اللون الأساسي", base],
    ["لون مساعد", palette.length > 2 ? palette[1].hex : hslToHex(screenHue(palette[0].angle), .12, .89)],
    ["لون إبراز", partner],
  ];
  get("proportions").innerHTML = roles.map(([, hex]) => `<span style="background:${hex}"></span>`).join("");
  get("roles").innerHTML = roles.map(([role, hex]) => `<span><i style="background:${hex}" aria-hidden="true"></i>${role} <bdi>${hex}</bdi></span>`).join("");
}

function setBase(hex, syncField = true) {
  base = hex;
  picker.value = hex;
  if (syncField) hexField.value = hex;
  hexField.removeAttribute("aria-invalid");
  get("hex-error").hidden = true;
  render();
}

function commitHex() {
  const next = normalizeHex(hexField.value);
  if (next) setBase(next);
  else {
    hexField.setAttribute("aria-invalid", "true");
    get("hex-error").hidden = false;
  }
}

get("base-form").addEventListener("submit", event => {
  event.preventDefault();
  commitHex();
});
hexField.addEventListener("input", () => {
  hexField.removeAttribute("aria-invalid");
  get("hex-error").hidden = true;
  const value = hexField.value;
  if (/^#?[0-9a-f]{6}$/i.test(value)) setBase(normalizeHex(value), false);
});
hexField.addEventListener("blur", commitHex);
picker.addEventListener("input", () => setBase(picker.value.toUpperCase()));
wheel.addEventListener("click", event => {
  const { left, top, width, height } = wheel.getBoundingClientRect();
  const x = (event.clientX - left) / width * 2 - 1;
  const y = (event.clientY - top) / height * 2 - 1;
  const radius = Math.hypot(x, y);
  if (radius > 1) return;
  const angle = wrapHue(Math.atan2(x, -y) * 180 / Math.PI);
  setBase(hslToHex(screenHue(angle), Math.min(1, radius / .9), .5));
});
ruleButtons.addEventListener("click", event => {
  const choice = event.target.closest("button[data-rule]");
  if (!choice) return;
  active = rules.find(rule => rule.id === choice.dataset.rule);
  render();
});

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    const success = document.execCommand("copy");
    field.remove();
    if (!success) {
      get("copy-status").textContent = "النسخ ما اشتغلش. الأكواد ظاهرة على اللوحة.";
      return;
    }
  }
  get("copy-status").textContent = "تم النسخ.";
}

swatches.addEventListener("click", event => {
  const swatch = event.target.closest("button[data-hex]");
  if (swatch) copy(swatch.dataset.hex);
});
get("copy-all").addEventListener("click", () => copy(palette.map(({ hex }) => hex).join(", ")));
render();
