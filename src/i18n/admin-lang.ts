import { useEffect, useState, useCallback } from "react";

export type AdminLang = "ar" | "en";
const KEY = "admin-lang";
const EVT = "admin-lang-change";

function read(): AdminLang {
  if (typeof window === "undefined") return "ar";
  const v = window.localStorage.getItem(KEY);
  return v === "en" ? "en" : "ar";
}

export function useAdminLang() {
  const [lang, setLang] = useState<AdminLang>("ar");
  useEffect(() => {
    setLang(read());
    const on = () => setLang(read());
    window.addEventListener(EVT, on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener(EVT, on);
      window.removeEventListener("storage", on);
    };
  }, []);
  const set = useCallback((next: AdminLang) => {
    window.localStorage.setItem(KEY, next);
    window.dispatchEvent(new Event(EVT));
    setLang(next);
  }, []);
  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";
  const t = <T extends { ar: string; en: string }>(pair: T) => pair[lang];
  return { lang, setLang: set, dir, t };
}

// Common admin strings — extend as pages get translated.
export const A = {
  dashboard:      { ar: "الرئيسية", en: "Dashboard" },
  pages:          { ar: "صفحات الموقع", en: "Site Pages" },
  insights:       { ar: "المقالات", en: "Insights" },
  portfolio:      { ar: "المشاريع", en: "Projects" },
  services:       { ar: "الخدمات", en: "Services" },
  categories:     { ar: "التصنيفات", en: "Categories" },
  tags:           { ar: "الوسوم", en: "Tags" },
  media:          { ar: "مكتبة الوسائط", en: "Media Library" },
  messages:       { ar: "الرسائل", en: "Messages" },
  seo:            { ar: "مدير SEO", en: "SEO Manager" },
  audit:          { ar: "سجلات التدقيق", en: "Audit Logs" },
  settings:       { ar: "إعدادات الموقع", en: "Site Settings" },
  profile:        { ar: "الملف الشخصي", en: "Profile" },
  content_group:  { ar: "المحتوى", en: "Content" },
  taxonomy_group: { ar: "التصنيفات والوسائط", en: "Taxonomy & Media" },
  ops_group:      { ar: "التشغيل", en: "Operations" },
  settings_group: { ar: "الإعدادات", en: "Settings" },
  cms_subtitle:   { ar: "لوحة التحكم", en: "Admin Dashboard" },
  view_site:      { ar: "عرض الموقع", en: "View Site" },
  sign_out:       { ar: "تسجيل الخروج", en: "Sign Out" },
  language:       { ar: "اللغة", en: "Language" },
} as const;
