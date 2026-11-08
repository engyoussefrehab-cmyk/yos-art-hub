import { useRouterState } from "@tanstack/react-router";
import { dict, type DictKey, type Lang } from "./dictionary";

// The site is Arabic only (the English version was removed in Nov 2026).
// Old /en/… links forward to the Arabic page (see routes/en.$.tsx).
export function detectLang(_pathname?: string): Lang {
  return "ar";
}

export function useLang() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lang: Lang = detectLang(pathname);
  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";
  const t = (key: DictKey): string => dict[key][lang] ?? dict[key].ar;
  const altHref = pathname;
  return { lang, dir, t, pathname, altHref };
}

export function t(lang: Lang, key: DictKey): string {
  return dict[key][lang] ?? dict[key].ar;
}
