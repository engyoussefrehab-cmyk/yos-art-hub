import { useRouterState } from "@tanstack/react-router";
import { dict, type DictKey, type Lang } from "./dictionary";

export function detectLang(pathname: string): Lang {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ar";
}

export function useLang() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lang: Lang = detectLang(pathname);
  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";
  const t = (key: DictKey): string => dict[key][lang] ?? dict[key].ar;
  // Build alternate-language path preserving the rest of the URL.
  const altHref = lang === "ar" ? `/en${pathname === "/" ? "" : pathname}` : pathname.replace(/^\/en/, "") || "/";
  return { lang, dir, t, pathname, altHref };
}

export function t(lang: Lang, key: DictKey): string {
  return dict[key][lang] ?? dict[key].ar;
}
