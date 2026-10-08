// All site text lives in src/content/dictionary.json — edit it from the dashboard
// (/admin → نصوص الموقع) or directly in that file.
import dictionary from "@/content/dictionary.json";

export type Lang = "ar" | "en";
export type DictKey = keyof typeof dictionary;
export const dict: Record<DictKey, { ar: string; en: string }> = dictionary;

/** [arabic, english] for a dictionary key — used where code needs both at once. */
export function pair(key: DictKey): [string, string] {
  const e = dict[key];
  return [e?.ar ?? "", e?.en ?? e?.ar ?? ""];
}
